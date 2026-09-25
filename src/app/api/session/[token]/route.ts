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

    // 1. Fetch session by token
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
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

    const { data: updatedSession, error } = await supabase
      .from('sessions')
      .update(updatePayload)
      .eq('token', token)
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
