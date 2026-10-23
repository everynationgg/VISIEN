import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { CORE_QUESTIONS } from './questions';
import { AppBrief } from './types';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// High-availability Gemini model tier with automatic failover
export const GEMINI_CHAT_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
];

// Relaxed safety settings for business discovery sessions (e.g. adult wellness, nightlife, medical clinics)
export const geminiSafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

/**
 * Executes a Gemini operation with automatic model failover.
 */
export async function executeGeminiWithFailover<T>(
  action: (modelName: string) => Promise<T>
): Promise<T> {
  let lastError: any = null;

  for (const modelName of GEMINI_CHAT_MODELS) {
    try {
      return await action(modelName);
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} error (${err?.message?.slice(0, 100)}), failing over...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model fallbacks exhausted');
}

export const visienSystemInstruction = `
You are VISIEN, the Lead Technical Solutions Architect & AI Consultant created by Every Nation GG.
Every Nation GG (ENGG) is the software design and engineering company that will review this discovery brief, design the database schemas, UI/UX architecture, and build the client's application.
You, VISIEN, are their intelligent AI technical partner. You are NOT a mechanical corporate survey bot.

YOUR MISSION:
Extract concrete, actionable technical details our engineering leads need to scope and build the system:
1. App Purpose & Scale: Is this a personal tool just for them/their circle, a creator project, a startup, or an existing business? Adapt your language to their exact scale (never force corporate jargon on a personal project!).
2. Aesthetics & Theme: Exact color preferences, dark mode vs light mode vs adaptive, and visual references.
3. User Access & Auth: Private/passcode vs open public vs guest access vs 1-tap Google/Apple ID.
4. Starting Data: Fresh blank slate vs notes/spreadsheets to import.
5. Notifications & Payments: Push reminders vs quiet mode; free app vs GCash/Maya/Stripe.
6. Deployment Context: Every Nation GG delivers apps universally as installable Progressive Web Apps (PWA) for iOS & desktop, and APK + PWA for Android. Never debate app stores vs browser with the user.

THE 1-FOLLOW-UP ARCHITECTURAL PROBE RULE:
- When a client answers a core question briefly or at a high level (e.g., "workout app", "dark mode", "take payments", "notes app"):
  DO NOT immediately jump to the next core question!
  Instead, set ADVANCE: false and ask ONE sharp, tailored follow-up question to clarify the specifics developers need.
  Examples:
  * If they say: "Personal workout and diet tracker"
    -> Ask: "Will you want quick 1-tap logging with timers right on the main screen, and do you need daily reminder notifications to log your workouts?"
  * If they say: "Sleek dark mode"
    -> Ask: "Do you like glowing accent colors (like electric violet, neon cyan, or amber gold), or do you prefer a stealth monochrome look (pure blacks and subtle greys)?"
  * If they say: "Accept payments"
    -> Ask: "Which payment channels do you want to accept (e.g. GCash, Maya, card via Stripe, or bank transfer slips)?"
- When to set ADVANCE: true:
  1) The client has already answered your follow-up clarifying question on this topic, OR
  2) The client provided a very thorough, detailed answer on their first turn with specifics, OR
  3) The follow-up count has reached 2 (to maintain momentum), OR
  4) The client explicitly says "next", "skip", "pass", or asks to move forward.

BRAINSTORMING & DOMAIN DISCOVERY RULE (FOR QUESTION 1):
- If the client mentions a goal or interest without a specific app idea (e.g. fitness, personal finance, art portfolio, bakery, coffee shop, community group) or says "let's brainstorm":
  1. Warmly reassure them that helping them identify high-ROI digital solutions is why VISIEN and ENGG are here.
  2. Proactively pitch 2 to 3 distinct, high-impact app concepts tailored to their interest.
  3. Ask which of those directions feels most exciting.
  4. Keep ADVANCE: false to lock in their choice before advancing to Question 2.

CRITICAL CONVERSATION RULES:
1. ALWAYS read and respond to what the client actually said. Be specific to their domain.
2. NEVER use robotic clichés like "Understood, that gives us great clarity", "Got it, that helps clarify your vision. Let's move on", or "Great to know". Speak like an experienced, thoughtful Senior Product Manager.
3. Keep responses concise: 2 to 3 sentences maximum (1 sentence validating their idea with technical insight + 1 sharp question). You are a chat interface, not an essay writer.
4. When advancing to the next question, connect what they just told you smoothly to the next question. ALWAYS include the full next question text.
5. Tone: Calm, warm, consultative, sharp, and intelligent.
`;

export const enosSystemInstruction = visienSystemInstruction;

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
 * Evaluates the client's answer and generates the next conversational turn from VISIEN.
 */
export async function generateVisienResponse(
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

  const recentHistory = context.conversationHistory.slice(-8);
  const historyText = recentHistory.length > 0
    ? `\nRECENT CONVERSATION:\n${recentHistory.map(m => `${m.role === 'client' ? 'CLIENT' : 'VISIEN'}: ${m.content}`).join('\n')}\n`
    : '';

  const isSkipSignal = /^(next|skip|next question|idk|i don'?t know|move on|pass|continue|okay|ok|sure)$/i.test(
    context.latestClientAnswer.trim()
  );

  const isOffTopic = /jollibee|mcdo|mcdonald|burger|pizza|food|hungry|eat/i.test(context.latestClientAnswer) ||
    /^(do what|huh\??|what\??|i don'?t (know|understand)|confused)$/i.test(context.latestClientAnswer.trim());

  const isMetaQuestion =
    /^(hello|hi|hey|test|testing|does this work|is this working)\b/i.test(context.latestClientAnswer.trim()) ||
    /(speak|understand|intindi|tagalog|english|language|who are you|what are you|si visien ka ba|si enos ka ba|visien|enos|chapters progress|progress to|counter|why did)/i.test(
      context.latestClientAnswer
    );

  const mustAdvance = (context.followUpCountForCurrentQuestion >= 2 && !isMetaQuestion) || isSkipSignal;

  const fullPrompt = `${visienSystemInstruction}

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
1. If the client's answer is brief, high-level, or missing key architectural details (e.g. didn't specify guest vs account, exact payment gateways, admin operational workflows, courier/shipping method, or catalog size):
   Set ADVANCE: false and ask ONE sharp technical follow-up question!
2. Set ADVANCE: true ONLY if:
   - The client has already answered your follow-up clarifying question on this topic, OR
   - Their first answer was already very comprehensive with technical specifics, OR
   - Follow-up count reached 2 (or max reached flag is set), OR
   - The client says 'skip', 'next', 'idk', or asks to move forward.
3. If the client asked to brainstorm, named only a business type without a concept, or wants suggestions: Set ADVANCE: false! Pitch 2-3 tailored concepts and ask which fits best.
4. If the client asked a meta-question, tested the mic, asked about languages, or questioned the system: Set ADVANCE: false! Answer their question, then guide them back to Question #${currentQ?.number}: "${currentQ?.title}". Do NOT advance.
5. If the client said something off-topic, confusing, or conversational banter: Set ADVANCE: false. Redirect back to Question #${currentQ?.number}.
6. Never repeat robotic canned phrases verbatim. Speak like an experienced Senior Product Manager.
7. Always include the FULL next question text when advancing.
8. Keep your message under 3 sentences (1 sentence validating + 1 sharp question).

RESPOND ONLY IN THIS EXACT FORMAT:
ADVANCE: true
MESSAGE: [your message here]

OR:

ADVANCE: false
MESSAGE: [your message here]`;

  try {
    const result = await executeGeminiWithFailover(async (modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings: geminiSafetySettings,
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 1500,
          topP: 0.9,
        },
      });
      return await model.generateContent(fullPrompt);
    });

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
    console.error('generateVisienResponse fallback error:', error);
    // If client provided a meaningful answer or we reached max followups, advance to keep momentum!
    const clientWords = context.latestClientAnswer.trim().split(/\s+/).length;
    const shouldAdvance = mustAdvance || !nextQ || clientWords >= 3;
    const fallbackMessage = shouldAdvance
      ? nextQ
        ? `Got that noted down! Let's explore the next key pillar of your build: ${nextQ.title}`
        : `That gives Every Nation GG a solid foundation to scope your build! Let me synthesize your App Vision now.`
      : `Thanks for sharing that! To make sure our engineering team scopes this accurately, could you share a bit more detail on how you envision that working?`;

    return {
      message: fallbackMessage,
      isFollowUp: !shouldAdvance,
      advanceToNextQuestion: shouldAdvance,
      nextQuestionIndex: shouldAdvance
        ? context.currentQuestionIndex + 1
        : context.currentQuestionIndex,
    };
  }
}

export const generateEnosResponse = generateVisienResponse;

/**
 * Synthesizes the full conversational transcript into a structured AppBrief.
 */
export async function generateAppBriefFromTranscript(
  clientName: string,
  transcript: { role: string; content: string }[]
): Promise<Partial<AppBrief>> {

  const prompt = `
You are the lead technical analyst at Every Nation GG.
Analyze the following client discovery conversation between VISIEN (AI Guide) and ${clientName}.
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
  "user_roles": "Different types of user roles, permissions, or admin access levels described",
  "target_platform": "Target platforms (e.g. iOS & Android App Store, Responsive Web App, Tablet/Desktop, etc.)",
  "auth_requirements": "Login, onboarding, and authentication methods described (e.g. Phone OTP, Email, Google/Apple, Guest)",
  "payments_integrations": "Payment methods (GCash, Stripe, COD, etc.) and tool/courier integrations as described",
  "notifications_channels": "Notification channels (Push alerts, SMS receipts, automated emails, in-app feed)",
  "hardware_capabilities": "Hardware & device capabilities (Camera/QR, GPS, Bluetooth printer, Offline mode)",
  "data_readiness": "Existing data to migrate (spreadsheets, databases) and brand asset readiness",
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
  "budget_range": "Target investment or budget range described for V1",
  "future_horizon": "Long-term vision as client described",
  "infrastructure_preference": "Client's infrastructure preference",
  "additional_notes": "Any other specific points mentioned"
}
`;

  const result = await executeGeminiWithFailover(async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings: geminiSafetySettings,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });
    return await model.generateContent(prompt);
  });

  const text = result.response.text();

  // Strip possible markdown code fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

