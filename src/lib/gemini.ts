import { GoogleGenerativeAI } from '@google/generative-ai';
import { CORE_QUESTIONS } from './questions';
import { AppBrief } from './types';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const enosSystemInstruction = `
You are ENOS, the conversational AI consultant inside VISIEN (Vision Inspired by Story and Idea), created by Every Nation GG.
Every Nation GG (ENGG) is the company, design studio, and software engineering team that will review the brief, design, and build the client's application.
You, ENOS, are their intelligent AI guide helping the client articulate their vision. You are NOT the company.

CONVERSATION PRINCIPLES:
1. Tone: Calm, conversational, attentive, concise, approachable, and encouraging. Never robotic, corporate, or preachy.
2. Natural Acknowledgements: Use varied acknowledgements ("Got it.", "That's clear.", "Understood.", "That paints a helpful picture.") without repeating the exact same phrase repeatedly.
3. Adaptive Follow-ups:
   - When a client's answer is sufficiently clear and detailed: acknowledge warmly and smoothly transition to the next core question.
   - When an answer is too broad, vague, or missing crucial context (e.g., "like Shopee", "an app for my business"): ask ONE focused, friendly clarifying follow-up.
   - Never exceed 1–2 follow-ups on any single topic. Always prioritize forward momentum over exhaustive interrogation.
4. Smart Question Bridging: If the client already answered an upcoming question naturally in a previous turn, acknowledge it and bridge forward to the next relevant question rather than asking them something they already answered.
5. Infrastructure questions: Always clarify that infrastructure/hosting management is for planning only, and refer to Every Nation GG as the provider (e.g. "Every Nation GG will manage them for me"), never yourself.
`;

export interface ChatTurnContext {
  clientName: string;
  currentQuestionIndex: number;
  followUpCountForCurrentQuestion: number;
  recentHistory: { role: 'user' | 'model'; content: string }[];
  latestClientAnswer: string;
}

export interface ChatTurnResponse {
  message: string;
  isFollowUp: boolean;
  advanceToNextQuestion: boolean;
  nextQuestionIndex: number;
}

/**
 * Evaluates the client's answer and generates the next conversational turn from ENOS.
 */
export async function generateEnosResponse(
  context: ChatTurnContext
): Promise<ChatTurnResponse> {
  const currentQ = CORE_QUESTIONS[context.currentQuestionIndex];
  const nextQ = CORE_QUESTIONS[context.currentQuestionIndex + 1];

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: enosSystemInstruction,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 350,
      topP: 0.9,
    },
  });

  const prompt = `
CLIENT NAME: ${context.clientName || 'Client'}
CURRENT QUESTION #${currentQ?.number || 1}: "${currentQ?.title || ''}"
QUESTION GUIDANCE: "${currentQ?.guidance || ''}"
FOLLOW-UP COUNT SO FAR ON THIS QUESTION: ${context.followUpCountForCurrentQuestion} (MAX ALLOWED: 2)

LATEST CLIENT ANSWER:
"${context.latestClientAnswer}"

DECISION INSTRUCTIONS:
Evaluate if the client's answer is sufficiently understood to produce a software development brief, or if it is too broad / ambiguous.
- If the answer is clear, OR if follow-up count is already 1 or 2:
  Set ADVANCE: true.
  Write a brief acknowledgement, then smoothly ask the next question (#${nextQ?.number || 'Final Review'}: "${nextQ?.title || 'Review stage'}").
- If the answer is excessively broad (e.g. "an app for shopping", "like Uber") and follow-up count is 0:
  Set ADVANCE: false.
  Ask ONE focused, friendly clarifying question to uncover their specific intent.

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:
ADVANCE: [true/false]
MESSAGE: [Your conversational response as ENOS]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const advanceMatch = text.match(/ADVANCE:\s*(true|false)/i);
    const messageMatch = text.match(/MESSAGE:\s*([\s\S]+)/i);

    const shouldAdvance = advanceMatch ? advanceMatch[1].toLowerCase() === 'true' : true;
    let messageContent = messageMatch ? messageMatch[1].trim() : text;

    // Clean any residual formatting tags if leaked
    messageContent = messageContent.replace(/^ADVANCE:\s*(true|false)\s*/i, '').trim();

    return {
      message: messageContent,
      isFollowUp: !shouldAdvance,
      advanceToNextQuestion: shouldAdvance,
      nextQuestionIndex: shouldAdvance
        ? context.currentQuestionIndex + 1
        : context.currentQuestionIndex,
    };
  } catch (error) {
    console.error('Error in generateEnosResponse:', error);
    // Graceful fallback for rate limits or network hiccups
    const fallbackAdvance = context.followUpCountForCurrentQuestion >= 1 || !nextQ;
    return {
      message: fallbackAdvance
        ? `Got it, that helps clarify your vision. Let's move on to the next step: ${nextQ?.title || 'Let us review everything we discussed.'}`
        : `Got it. Could you tell me a little more about how you imagine that working?`,
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
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are the lead technical analyst at Every Nation GG.
Analyze the following client discovery conversation between ENOS (AI Guide) and ${clientName}.
Extract and synthesize the information into a comprehensive, high-quality App Brief for our design and engineering team.

FULL CONVERSATION TRANSCRIPT:
${transcript.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n')}

Extract into JSON matching this exact structure:
{
  "project_title": "Concise working title for the project",
  "vision_summary": "2-3 sentences capturing the core idea and essence",
  "problem_statement": "The core friction, manual cost, or pain point this solves",
  "target_users": "Who uses this app (roles, demographics, contexts)",
  "moment_of_use": "When and where users reach for this app",
  "first_screen_experience": "What the user immediately sees upon opening",
  "core_action": "The single most important flow or task",
  "expected_outcome": "What happens after the core action is completed",
  "emotional_ux_feel": ["string (e.g. Light & simple, Premium, Calm)"],
  "visual_direction": "Colors, aesthetics, layout style, references",
  "anti_patterns": ["things they explicitly do NOT want"],
  "business_impact": "How this app transforms the client's operations or business",
  "current_workflow": "How they manage this process today (e.g. spreadsheets, DMs)",
  "v1_essential_features": ["bullet point list of must-haves for launch"],
  "future_horizon": "Long-term ideas, phase 2 additions, and scale vision",
  "infrastructure_preference": "Client's preference regarding hosting/infrastructure management",
  "additional_notes": "Any other specific requests or nuances mentioned"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}
