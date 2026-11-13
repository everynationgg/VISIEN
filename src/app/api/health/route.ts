import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Throttle keepalive row writes so public/repeated hits cannot spam Postgres
const WRITE_INTERVAL_MS = 15 * 60 * 1000;

function detectPingSource(req: NextRequest): string {
  const paramSource = req.nextUrl.searchParams.get('source');
  if (paramSource) return paramSource.slice(0, 64);
  const ua = req.headers.get('user-agent') || '';
  if (ua.includes('vercel-cron')) return 'vercel-cron';
  return 'http';
}

export async function GET(req: NextRequest) {
  const now = new Date();
  const timestamp = now.toISOString();
  const source = detectPingSource(req);

  try {
    // 1. Always execute lightweight read queries against Supabase tables
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);

    if (sessionError) {
      console.error('[Health Check] Supabase query error:', sessionError.message);
      return NextResponse.json(
        {
          status: 'degraded',
          database: 'error',
          error: sessionError.message,
          timestamp,
        },
        { status: 500 }
      );
    }

    // 2. Execute privileged multi-table reads + single-row write heartbeat when service key is available
    let writeOk = false;
    let pingCount: number | null = null;
    let lastPingAt: string | null = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = getAdminSupabase();

      const [messagesRes, briefsRes, keepaliveRes] = await Promise.all([
        admin.from('messages').select('id', { count: 'exact', head: true }),
        admin.from('app_briefs').select('id', { count: 'exact', head: true }),
        admin.from('keepalive').select('last_ping_at, ping_count').eq('id', 1).maybeSingle(),
      ]);

      if (messagesRes.error) {
        console.warn('[Health Check] Messages count check warning:', messagesRes.error.message);
      }
      if (briefsRes.error) {
        console.warn('[Health Check] Briefs count check warning:', briefsRes.error.message);
      }

      if (!keepaliveRes.error) {
        const prevCount = Number(keepaliveRes.data?.ping_count ?? 0);
        const prevPingMs = keepaliveRes.data?.last_ping_at
          ? new Date(keepaliveRes.data.last_ping_at).getTime()
          : 0;

        if (!keepaliveRes.data || now.getTime() - prevPingMs >= WRITE_INTERVAL_MS) {
          const nextCount = prevCount + 1;
          const { error: upsertError } = await admin.from('keepalive').upsert(
            {
              id: 1,
              last_ping_at: timestamp,
              ping_count: nextCount,
              source,
            },
            { onConflict: 'id' }
          );

          if (upsertError) {
            console.warn('[Health Check] Keepalive write warning:', upsertError.message);
          } else {
            writeOk = true;
            pingCount = nextCount;
            lastPingAt = timestamp;
          }
        } else {
          writeOk = true;
          pingCount = prevCount;
          lastPingAt = keepaliveRes.data.last_ping_at;
        }
      } else {
        console.warn('[Health Check] Keepalive read warning:', keepaliveRes.error.message);
      }
    }

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      recordsFound: sessionData ? sessionData.length : 0,
      writeOk,
      pingCount,
      lastPingAt,
      source,
      timestamp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal health check failure';
    console.error('[Health Check] Unexpected error:', message);
    return NextResponse.json(
      {
        status: 'error',
        message,
        timestamp,
      },
      { status: 500 }
    );
  }
}

