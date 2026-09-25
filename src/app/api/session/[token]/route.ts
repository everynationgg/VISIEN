import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Fetch session by token (handles with-dash, without-dash, case-insensitive, and legacy tokens)
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
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Fetch conversation messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    // 3. Fetch app brief if completed
    let brief = null;
    if (session.status === 'completed') {
      const { data: briefData } = await supabase
        .from('app_briefs')
        .select('*')
        .eq('session_id', session.id)
        .single();
      brief = briefData;
    }

    return NextResponse.json({
      session,
      messages: messages || [],
      brief,
    });
  } catch (error: any) {
    console.error('Session API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const supabase = getAdminSupabase();

    const allowedUpdates = [
      'client_name',
      'company',
      'email',
      'status',
      'consent_given',
      'current_question_index',
      'current_chapter',
      'completed_at',
    ];

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key];
      }
    }

    const cleanToken = token.trim();
    let { data: existingSession } = await supabase
      .from('sessions')
      .select('id')
      .eq('token', cleanToken)
      .maybeSingle();

    if (!existingSession && cleanToken.length === 6 && !cleanToken.includes('-')) {
      const withDash = `${cleanToken.slice(0, 3)}-${cleanToken.slice(3)}`;
      const { data: dashMatch } = await supabase
        .from('sessions')
        .select('id')
        .eq('token', withDash)
        .maybeSingle();
      existingSession = dashMatch;
    }

    if (!existingSession && cleanToken.includes('-')) {
      const noDash = cleanToken.replace(/-/g, '');
      const { data: noDashMatch } = await supabase
        .from('sessions')
        .select('id')
        .eq('token', noDash)
        .maybeSingle();
      existingSession = noDashMatch;
    }

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { data: updatedSession, error } = await supabase
      .from('sessions')
      .update(updatePayload)
      .eq('id', existingSession.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error: any) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
