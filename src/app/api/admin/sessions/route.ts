import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

// Generates an unguessable 8-character alphanumeric token
function generateSecureToken(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const bytes = crypto.randomBytes(8);
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
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
