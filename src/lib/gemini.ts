import { GoogleGenerativeAI } from '@google/generative-ai';
import { CORE_QUESTIONS } from './questions';
import { AppBrief } from './types';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Active model: gemini-3.5-flash-lite (high free tier quota, fast, conversational)
const ENOS_MODEL = 'gemini-3.5-flash-lite';

/**
 * Retries a Gemini call with exponential backoff on 429 rate-limit errors.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 5000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Too Many Requests') || err?.message?.includes('quota');
      if (is429 && attempt < retries) {
        // Extract retry delay from Gemini error if available, otherwise use exponential backoff
        const retryAfterMatch = err?.message?.match(/Please retry in (\d+)/);
        const waitMs = retryAfterMatch ? parseInt(retryAfterMatch[1]) * 1000 : delayMs * Math.pow(2, attempt);
        console.warn(`Gemini 429 rate limit — retrying in ${waitMs}ms (attempt ${attempt + 1}/${retries})`);
        await new Promise(r => setTimeout(r, Math.min(waitMs, 60000)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

export const enosSystemInstruction = `
You are ENOS, the conversational AI consultant inside VISIEN (Vision Inspired by Story and Idea), created by Every Nation GG.
Every Nation GG (ENGG) is the company, design studio, and software engineering team that will review the brief, design, and build the client's application.
You, ENOS, are their intelligent AI guide helping the client articulate their vision. You are NOT the company.

YOUR JOB: Guide the client through understanding their app idea. You must ALWAYS stay relevant to the current question and the client's actual response.

CRITICAL RULES:
1. ALWAYS read and respond to what the client actually said. If they said something unrelated (e.g., food cravings, confusion, jokes), acknowledge it briefly and warmly redirect to the current question. Never pretend an off-topic answer addressed the question.
2. If the client says "next question", "skip", "I don't know", or "next" — briefly acknowledge and move on to the actual next question. Do NOT invent an answer for them.
3. If the client says something clearly off-topic (e.g., "I want Jollibee right now") — smile at it briefly and redirect: "Ha, noted! Let's get back to your app though..."
4. If the client's answer IS clear and on-topic — acknowledge what they said specifically, not generically. Never use the same acknowledgement twice in a row.
5. NEVER use the exact phrase "Got it, that helps clarify your vision. Let's move on to the next step" — it is robotic and overused. Vary your language naturally.
6. When you advance to the next question, ALWAYS include the full question text in your message. Don't just say "moving on" — actually ask the next question clearly.
7. Keep responses short (2-4 sentences maximum). You are a chat interface, not an essay writer.
8. Tone: Calm, warm, conversational, intelligent. Like a smart colleague — not a corporate survey bot.

INFRASTRUCTURE QUESTIONS: Clarify these are for planning only. Refer to Every Nation GG as the provider.
`;

export interface ChatTurnContext {
  clientName: string;
  currentQuestionIndex: number;
  followUpCountForCurrentQuestion: number;
  conversationHistory: { role: string; content: string }[];
  latestClientAnswer: string;
}

export interface ChatTurnResponse {
  message: string;
  isFollowUp: boolean;
  advanceToNextQuestion: boolean;
  nextQuestionIndex: number;
  isFinished?: boolean;
}

/**
 * Evaluates the client's answer and generates the next conversational turn from ENOS.
 */
export async function generateEnosResponse(
  context: ChatTurnContext
): Promise<ChatTurnResponse> {
  const currentQ = CORE_QUESTIONS[context.currentQuestionIndex];
  const nextQ = CORE_QUESTIONS[context.currentQuestionIndex + 1];

  // 1. Detect if client explicitly wants to end/wrap up the chat
  const isEndSignal =
    /(end (this|the)? (chat|session|call)|want to end|end it now|wrap (it|things)? up|can we end|stop (chat|session)?|finish now|let'?s (end|finish|stop)|close (chat|session)|exit (chat|session)?|no goal here)/i.test(
      context.latestClientAnswer.trim()
    );

  if (isEndSignal) {
    return {
      message: `Understood! We'll wrap things up right here. Thank you for your time and thoughts—let me synthesize everything we've discussed into your App Vision now.`,
      isFollowUp: false,
      advanceToNextQuestion: false,
      nextQuestionIndex: context.currentQuestionIndex,
      isFinished: true,
    };
  }

  const model = genAI.getGenerativeModel({
    model: ENOS_MODEL,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 500,
      topP: 0.9,
    },
  });

  const recentHistory = context.conversationHistory.slice(-8);
  const historyText = recentHistory.length > 0
    ? `\nRECENT CONVERSATION:\n${recentHistory.map(m => `${m.role === 'enos' ? 'ENOS' : 'CLIENT'}: ${m.content}`).join('\n')}\n`
    : '';

  const isSkipSignal = /^(next|skip|next question|idk|i don'?t know|move on|pass|continue|okay|ok|sure)$/i.test(
    context.latestClientAnswer.trim()
  );

  const isOffTopic = /jollibee|mcdo|mcdonald|burger|pizza|food|hungry|eat/i.test(context.latestClientAnswer) ||
    /^(do what|huh\??|what\??|i don'?t (know|understand)|confused)$/i.test(context.latestClientAnswer.trim());

  const isMetaQuestion =
    /^(hello|hi|hey|test|testing|does this work|is this working)\b/i.test(context.latestClientAnswer.trim()) ||
    /(speak|understand|intindi|tagalog|english|language|who are you|what are you|si enos ka ba|chapters progress|progress to|counter|why did)/i.test(
      context.latestClientAnswer
    );

  const mustAdvance = (context.followUpCountForCurrentQuestion >= 2 && !isMetaQuestion) || isSkipSignal;

  const fullPrompt = `${enosSystemInstruction}

---
YOU ARE NOW IN AN ACTIVE CONVERSATION SESSION.

CLIENT NAME: ${context.clientName || 'Client'}
CURRENT QUESTION #${currentQ?.number || 1}: "${currentQ?.title || ''}"
GUIDANCE: "${currentQ?.guidance || ''}"
${historyText}
CLIENT JUST SAID: "${context.latestClientAnswer}"

SITUATION FLAGS:
- Client asking meta/system/language question: ${isMetaQuestion ? 'YES → DO NOT ADVANCE! Answer their question warmly and stay on CURRENT QUESTION #' + (currentQ?.number || 1) : 'NO'}
- Skip/next signal detected: ${isSkipSignal ? 'YES → Advance now, ask next question' : 'NO'}
- Off-topic detected: ${isOffTopic ? 'YES → Acknowledge briefly and warmly redirect to CURRENT QUESTION' : 'NO'}
- Follow-up count: ${context.followUpCountForCurrentQuestion}/2 ${mustAdvance ? '→ MAX REACHED, must advance' : ''}

NEXT QUESTION IF ADVANCING: #${nextQ?.number ?? 'FINAL'}: "${nextQ?.title ?? 'That covers everything — let me compile your App Vision now.'}"

CRITICAL ADVANCEMENT RULES:
1. ONLY set ADVANCE: true if the client ACTUALLY provided relevant information answering Question #${currentQ?.number}, OR explicitly said 'skip'/'next'.
2. If the client asked a meta-question, tested the mic, asked about languages, or questioned the system: Set ADVANCE: false! Answer their question, then guide them back to Question #${currentQ?.number}: "${currentQ?.title}". Do NOT advance.
3. If the client said something off-topic, confusing, or conversational banter: Set ADVANCE: false. Redirect back to Question #${currentQ?.number}.
4. Never repeat "Got it, that helps clarify your vision" verbatim.
5. Always include the FULL next question text when advancing.
6. Keep your message under 4 sentences.
7. Be warm, natural, specific to what they actually said.

RESPOND ONLY IN THIS EXACT FORMAT:
ADVANCE: true
MESSAGE: [your message here]

OR:

ADVANCE: false
MESSAGE: [your message here]`;

  try {
    const result = await withRetry(() => model.generateContent(fullPrompt));

    // Safely extract text — handle empty candidates gracefully
    let text = '';
    try {
      text = result.response.text().trim();
    } catch {
      text = '';
    }

    if (!text) {
      throw new Error('Empty Gemini response');
    }

    const advanceMatch = text.match(/^ADVANCE:\s*(true|false)/im);
    const messageMatch = text.match(/^MESSAGE:\s*([\s\S]+)/im);

    const shouldAdvance = advanceMatch ? advanceMatch[1].toLowerCase() === 'true' : mustAdvance;
    let messageContent = messageMatch
      ? messageMatch[1].trim()
      : text.replace(/^ADVANCE:\s*(true|false)\s*/im, '').trim();

    // Ensure no leaked format tags
    messageContent = messageContent.replace(/^ADVANCE:\s*(true|false)\s*\n?/im, '').trim();

    if (!messageContent) throw new Error('Empty message content after parsing');

    return {
      message: messageContent,
      isFollowUp: !shouldAdvance,
      advanceToNextQuestion: shouldAdvance,
      nextQuestionIndex: shouldAdvance
        ? context.currentQuestionIndex + 1
        : context.currentQuestionIndex,
    };
  } catch (error) {
    console.error('generateEnosResponse error:', error);
    const fallbackAdvance = mustAdvance || !nextQ;
    const fallback = fallbackAdvance
      ? nextQ
        ? `Noted. Let's keep going — ${nextQ.title}`
        : `That covers everything I needed. Let me put together your App Vision now.`
      : `Could you share a bit more detail about that?`;

    return {
      message: fallback,
      isFollowUp: !fallbackAdvance,
      advanceToNextQuestion: fallbackAdvance,
      nextQuestionIndex: fallbackAdvance
        ? context.currentQuestionIndex + 1
        : context.currentQuestionIndex,
    };
  }
}

/**
 * Synthesizes the full conversational transcript into a structured AppBrief.
 */
export async function generateAppBriefFromTranscript(
  clientName: string,
  transcript: { role: string; content: string }[]
): Promise<Partial<AppBrief>> {
  const model = genAI.getGenerativeModel({
    model: ENOS_MODEL,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are the lead technical analyst at Every Nation GG.
Analyze the following client discovery conversation between ENOS (AI Guide) and ${clientName}.
Extract ONLY what the client actually stated. Do not invent details they never mentioned.
If the client was unclear or skipped a topic, note "Not specified" for that field.

FULL CONVERSATION TRANSCRIPT:
${transcript.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n')}

Extract into JSON matching this exact structure:
{
  "project_title": "Concise working title based on what client described",
  "vision_summary": "2-3 sentences capturing the core idea from the client's own words",
  "problem_statement": "The core problem/friction the client described",
  "target_users": "Who uses this app as the client described",
  "target_platform": "Target platforms (e.g. iOS & Android App Store, Responsive Web App, Tablet/Desktop, etc.)",
  "payments_integrations": "Payment methods (GCash, Stripe, COD, etc.) and tool/courier integrations as described",
  "moment_of_use": "When and where users open the app as described",
  "first_screen_experience": "What user sees first as described (or 'Not specified')",
  "core_action": "The single most important task or user journey as described",
  "expected_outcome": "What happens after the core action",
  "emotional_ux_feel": ["UX feel keywords client mentioned"],
  "visual_direction": "Visual style, colors, apps loved or aesthetic preferences",
  "anti_patterns": ["things client explicitly does NOT want"],
  "business_impact": "How this transforms the client's operations",
  "current_workflow": "How they manage this today as described",
  "v1_essential_features": ["Essential features for launch based on conversation"],
  "target_timeline": "Target launch timeline (e.g. 4-6 weeks, 2-3 months, flexible)",
  "future_horizon": "Long-term vision as client described",
  "infrastructure_preference": "Client's infrastructure preference",
  "additional_notes": "Any other specific points mentioned"
}
`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text();

  // Strip possible markdown code fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}
