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
    const cleanToken = token.trim();
    let { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', cleanToken)
      .maybeSingle();

    if (!session && cleanToken.length === 6 && !cleanToken.includes('-')) {
      const withDash = `${cleanToken.slice(0, 3)}-${cleanToken.slice(3)}`;
      const { data: dashMatch } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', withDash)
        .maybeSingle();
      session = dashMatch;
    }

    if (!session && cleanToken.includes('-')) {
      const noDash = cleanToken.replace(/-/g, '');
      const { data: noDashMatch } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', noDash)
        .maybeSingle();
      session = noDashMatch;
    }

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 404 });
    }

    if (session.status === 'completed') {
      return NextResponse.json({ error: 'Session is already completed' }, { status: 400 });
    }

    // 2. Fetch conversation history for context (ENOS needs to remember what was said)
    const { data: allMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    const conversationHistory = (allMessages || []).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Count existing follow-ups for the current question
    const currentQ = CORE_QUESTIONS[session.current_question_index];
    const currentQuestionKey = questionId || currentQ?.id || 'question';

    const { data: previousFollowUps } = await supabase
      .from('messages')
      .select('id')
      .eq('session_id', session.id)
      .eq('question_id', currentQuestionKey)
      .eq('is_follow_up', true)
      .eq('role', 'enos');

    const followUpCount = previousFollowUps?.length || 0;

    // 4. Save Client Message
    await supabase.from('messages').insert({
      session_id: session.id,
      role: 'client',
      content: message.trim(),
      question_id: currentQuestionKey,
      is_follow_up: false,
    });

    // 5. Generate AI Turn from ENOS (with full conversation history for context)
    const aiResponse = await generateEnosResponse({
      clientName: session.client_name || 'there',
      currentQuestionIndex: session.current_question_index,
      followUpCountForCurrentQuestion: followUpCount,
      conversationHistory, // pass full history so ENOS is context-aware
      latestClientAnswer: message.trim(),
    });

    // 6. Save ENOS Message
    await supabase.from('messages').insert({
      session_id: session.id,
      role: 'enos',
      content: aiResponse.message,
      question_id: currentQuestionKey,
      is_follow_up: aiResponse.isFollowUp,
    });

    // 7. Update Session State & Chapter
    const nextIndex = aiResponse.nextQuestionIndex;
    const nextQ = CORE_QUESTIONS[nextIndex];
    const newChapter = nextQ ? nextQ.chapter : 3;
    const isFinished = nextIndex >= CORE_QUESTIONS.length || !!aiResponse.isFinished;

    await supabase
      .from('sessions')
      .update({
        current_question_index: nextIndex,
        current_chapter: newChapter,
        status: isFinished ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

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
