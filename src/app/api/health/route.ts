import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Perform a lightweight query to verify connectivity and keep Supabase active
    const { data, error } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[Health Check] Supabase query error:', error.message);
      return NextResponse.json(
        {
          status: 'degraded',
          database: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      recordsFound: data ? data.length : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Health Check] Unexpected error:', err?.message || err);
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Internal health check failure',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

