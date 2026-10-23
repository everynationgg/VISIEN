import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { generateEnosResponse } from '@/lib/gemini';
import { CORE_QUESTIONS } from '@/lib/questions';
import { findSessionByTokenOrQuery } from '@/lib/sessionResolver';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { token, message, questionId } = await request.json();

    if (!token || !message?.trim()) {
      return NextResponse.json({ error: 'Token and message are required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Fetch active session
    const session = await findSessionByTokenOrQuery(supabase, token);

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 404 });
    }

    if (session.status === 'completed' && session.current_question_index >= CORE_QUESTIONS.length) {
      return NextResponse.json({ error: 'Session is already completed' }, { status: 400 });
    }

    // 2. Determine current question key
    const currentQ = CORE_QUESTIONS[session.current_question_index];
    const currentQuestionKey = questionId || currentQ?.id || 'question';

    // 3. Concurrently fetch conversation history and insert client message
    const [messagesResult] = await Promise.all([
      supabase
        .from('messages')
        .select('role, content, question_id, is_follow_up')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true }),
      supabase.from('messages').insert({
        session_id: session.id,
        role: 'client',
        content: message.trim(),
        question_id: currentQuestionKey,
        is_follow_up: false,
      }),
    ]);

    const allMessages = messagesResult.data || [];
    const conversationHistory = allMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // In-memory follow-up calculation for the current question
    const followUpCount = allMessages.filter(
      (m) => m.question_id === currentQuestionKey && m.is_follow_up && m.role === 'enos'
    ).length;

    // 4. Generate AI Turn from ENOS (with full conversation history for context)
    const aiResponse = await generateEnosResponse({
      clientName: session.client_name || 'there',
      currentQuestionIndex: session.current_question_index,
      followUpCountForCurrentQuestion: followUpCount,
      conversationHistory, // pass full history so ENOS is context-aware
      latestClientAnswer: message.trim(),
    });

    const nextIndex = aiResponse.nextQuestionIndex;
    const nextQ = CORE_QUESTIONS[nextIndex];
    const newChapter = nextQ ? nextQ.chapter : 4;
    const isFinished = nextIndex >= CORE_QUESTIONS.length || !!aiResponse.isFinished;

    // 5. Concurrently save ENOS message and update session state
    await Promise.all([
      supabase.from('messages').insert({
        session_id: session.id,
        role: 'enos',
        content: aiResponse.message,
        question_id: currentQuestionKey,
        is_follow_up: aiResponse.isFollowUp,
      }),
      supabase
        .from('sessions')
        .update({
          current_question_index: nextIndex,
          current_chapter: newChapter,
          status: isFinished ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id),
    ]);

    return NextResponse.json({
      reply: aiResponse.message,
      isFollowUp: aiResponse.isFollowUp,
      nextQuestionIndex: nextIndex,
      chapter: newChapter,
      isFinished,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
