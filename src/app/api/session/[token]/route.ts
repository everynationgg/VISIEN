import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { findSessionByTokenOrQuery } from '@/lib/sessionResolver';

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
    const session = await findSessionByTokenOrQuery(supabase, token);

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
      'client_clarification_reply',
    ];

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key];
      }
    }

    if (body.client_clarification_reply !== undefined) {
      updatePayload.client_clarification_replied_at = new Date().toISOString();
    }

    const existingSession = await findSessionByTokenOrQuery(supabase, token);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const session = await findSessionByTokenOrQuery(supabase, token);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await supabase.from('messages').delete().eq('session_id', session.id);
    await supabase.from('app_briefs').delete().eq('session_id', session.id);

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', session.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Session deleted successfully' });
  } catch (error: any) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

