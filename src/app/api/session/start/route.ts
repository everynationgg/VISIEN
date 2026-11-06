import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

// Generates a memorable 6-digit session code (e.g. 748-219)
function generateSecureToken(): string {
  const num = crypto.randomInt(100000, 999999);
  const str = num.toString();
  return `${str.slice(0, 3)}-${str.slice(3)}`;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { clientName, company, email } = await request.json();

    if (!clientName || !clientName.trim()) {
      return NextResponse.json({ error: 'Please enter your name to start' }, { status: 400 });
    }

    const token = generateSecureToken();
    const supabase = getAdminSupabase();

    const { data: newSession, error } = await supabase
      .from('sessions')
      .insert({
        token,
        client_name: clientName.trim(),
        company: company?.trim() || null,
        email: email?.trim() || null,
        status: 'not_started',
        current_question_index: 0,
        current_chapter: 1,
      })
      .select()
      .single();

    if (error) {
      console.error('[Session Start] Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      token: newSession.token,
      sessionId: newSession.id,
      clientName: newSession.client_name,
    });
  } catch (error: any) {
    console.error('[Session Start] API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to start discovery session' },
      { status: 500 }
    );
  }
}
