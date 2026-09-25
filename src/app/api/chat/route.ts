import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { generateEnosResponse } from '@/lib/gemini';
import { CORE_QUESTIONS } from '@/lib/questions';

export async function POST(request: NextRequest) {
  try {
    const { token, message, questionId } = await request.json();

    if (!token || !message?.trim()) {
      return NextResponse.json({ error: 'Token and message are required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Fetch active session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 404 });
    }

    if (session.status === 'completed') {
      return NextResponse.json({ error: 'Session is already completed' }, { status: 400 });
    }

    // 2. Count existing follow-ups for the current question
    const currentQ = CORE_QUESTIONS[session.current_question_index];
    const currentQuestionKey = questionId || currentQ?.id || 'question';

    const { data: previousFollowUps } = await supabase
      .from('messages')
      .select('id')
      .eq('session_id', session.id)
      .eq('question_id', currentQuestionKey)
      .eq('is_follow_up', true);

    const followUpCount = previousFollowUps?.length || 0;

    // 3. Save Client Message
    await supabase.from('messages').insert({
      session_id: session.id,
      role: 'client',
      content: message.trim(),
      question_id: currentQuestionKey,
      is_follow_up: false,
    });

    // 4. Generate AI Turn from ENOS
    const aiResponse = await generateEnosResponse({
      clientName: session.client_name || 'there',
      currentQuestionIndex: session.current_question_index,
      followUpCountForCurrentQuestion: followUpCount,
      recentHistory: [],
      latestClientAnswer: message.trim(),
    });

    // 5. Save ENOS Message
    await supabase.from('messages').insert({
      session_id: session.id,
      role: 'enos',
      content: aiResponse.message,
      question_id: currentQuestionKey,
      is_follow_up: aiResponse.isFollowUp,
    });

    // 6. Update Session State & Chapter
    const nextIndex = aiResponse.nextQuestionIndex;
    const nextQ = CORE_QUESTIONS[nextIndex];
    const newChapter = nextQ ? nextQ.chapter : 3;

    await supabase
      .from('sessions')
      .update({
        current_question_index: nextIndex,
        current_chapter: newChapter,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    return NextResponse.json({
      reply: aiResponse.message,
      isFollowUp: aiResponse.isFollowUp,
      nextQuestionIndex: nextIndex,
      chapter: newChapter,
      isFinished: nextIndex >= CORE_QUESTIONS.length,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
