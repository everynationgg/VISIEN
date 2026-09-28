import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

// Generates a memorable, clean 6-digit session code (e.g. 748-219)
function generateSecureToken(): string {
  const num = crypto.randomInt(100000, 999999);
  const str = num.toString();
  return `${str.slice(0, 3)}-${str.slice(3)}`;
}

// GET /api/admin/sessions: Lists all client sessions and briefs
export async function GET() {
  try {
    const supabase = getAdminSupabase();

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*, app_briefs(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Admin sessions fetch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sessions: Creates a new private session
export async function POST(request: NextRequest) {
  try {
    const { clientName, company, email } = await request.json();
    const token = generateSecureToken();
    const supabase = getAdminSupabase();

    const { data: newSession, error } = await supabase
      .from('sessions')
      .insert({
        token,
        client_name: clientName?.trim() || null,
        company: company?.trim() || null,
        email: email?.trim() || null,
        status: 'not_started',
        current_question_index: 0,
        current_chapter: 1,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ session: newSession, token });
  } catch (error: any) {
    console.error('Admin session creation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sessions: Deletes a session and cascading records (messages, brief)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const tokenParam = searchParams.get('token');

    let id = idParam;
    let token = tokenParam;

    if (!id && !token) {
      try {
        const body = await request.json();
        id = body.id;
        token = body.token;
      } catch {
        // Request body was empty or not JSON
      }
    }

    if (!id && !token) {
      return NextResponse.json(
        { error: 'Session id or token is required for deletion' },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    let targetId = id;
    if (!targetId && token) {
      const cleanToken = token.trim();
      const { data: found } = await supabase
        .from('sessions')
        .select('id')
        .eq('token', cleanToken)
        .maybeSingle();

      if (!found && cleanToken.length === 6 && !cleanToken.includes('-')) {
        const withDash = `${cleanToken.slice(0, 3)}-${cleanToken.slice(3)}`;
        const { data: dashMatch } = await supabase
          .from('sessions')
          .select('id')
          .eq('token', withDash)
          .maybeSingle();
        targetId = dashMatch?.id;
      } else if (!found && cleanToken.includes('-')) {
        const noDash = cleanToken.replace(/-/g, '');
        const { data: noDashMatch } = await supabase
          .from('sessions')
          .select('id')
          .eq('token', noDash)
          .maybeSingle();
        targetId = noDashMatch?.id;
      } else {
        targetId = found?.id;
      }
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Explicitly delete messages and brief to safeguard in case database foreign keys lack CASCADE
    await supabase.from('messages').delete().eq('session_id', targetId);
    await supabase.from('app_briefs').delete().eq('session_id', targetId);

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', targetId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Session deleted successfully' });
  } catch (error: any) {
    console.error('Admin session deletion error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete session' },
      { status: 500 }
    );
  }
}

