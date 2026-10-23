import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { generateAppBriefFromTranscript } from '@/lib/gemini';
import { findSessionByTokenOrQuery } from '@/lib/sessionResolver';

export const maxDuration = 60; // Allow ample time for Gemini synthesis

export async function POST(request: NextRequest) {
  try {
    const { token, feedbackNotes, finalize = false } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Fetch Session
    const session = await findSessionByTokenOrQuery(supabase, token);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if brief already exists
    const { data: existingBrief } = await supabase
      .from('app_briefs')
      .select('*')
      .eq('session_id', session.id)
      .maybeSingle();

    // If brief already exists and client is confirming without any feedback notes, skip re-synthesis!
    if (existingBrief && !feedbackNotes?.trim()) {
      if (finalize) {
        await supabase
          .from('sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.id);
      }
      return NextResponse.json({ brief: existingBrief });
    }

    // 2. Fetch full transcript
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (messagesError || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No conversation history found to generate brief' },
        { status: 400 }
      );
    }

    // Append any final client review feedback notes if provided
    if (feedbackNotes?.trim()) {
      messages.push({
        role: 'client',
        content: `Client final review correction / note: ${feedbackNotes.trim()}`,
      });
    }

    // 3. Synthesize App Brief with Gemini
    const briefData = await generateAppBriefFromTranscript(
      session.client_name || 'Client',
      messages
    );

    // 4. Upsert into app_briefs table (clean field mappings without prepending duplicate prefixes)
    const briefRecord = {
      session_id: session.id,
      client_name: session.client_name || 'Client',
      company: session.company || null,
      project_title: briefData.project_title || 'New Application Project',
      vision_summary: briefData.vision_summary || '',
      problem_statement: briefData.problem_statement || '',
      target_users: briefData.target_users || '',
      moment_of_use: briefData.moment_of_use || '',
      first_screen_experience: briefData.first_screen_experience || '',
      core_action: briefData.core_action || '',
      expected_outcome: briefData.expected_outcome || '',
      emotional_ux_feel: briefData.emotional_ux_feel || [],
      visual_direction: briefData.visual_direction || '',
      anti_patterns: briefData.anti_patterns || [],
      business_impact: briefData.business_impact || '',
      current_workflow: briefData.current_workflow || '',
      v1_essential_features: briefData.v1_essential_features || [],
      future_horizon: briefData.future_horizon || '',
      target_platform: briefData.target_platform || null,
      user_roles: briefData.user_roles || null,
      auth_requirements: briefData.auth_requirements || null,
      payments_integrations: briefData.payments_integrations || null,
      notifications_channels: briefData.notifications_channels || null,
      hardware_capabilities: briefData.hardware_capabilities || null,
      data_readiness: briefData.data_readiness || null,
      target_timeline: briefData.target_timeline || null,
      budget_range: briefData.budget_range || null,
      concept_image_url: null,
      concept_image_feedback: null,
      concept_image_notes: null,
      infrastructure_preference: briefData.infrastructure_preference || 'Unspecified',
      additional_notes: briefData.additional_notes || '',
      raw_json: briefData,
    };

    const { data: savedBrief, error: briefSaveError } = await supabase
      .from('app_briefs')
      .upsert(briefRecord, { onConflict: 'session_id' })
      .select()
      .single();

    if (briefSaveError) {
      console.error('Error saving brief:', briefSaveError);
      return NextResponse.json({ error: briefSaveError.message }, { status: 500 });
    }

    // 5. Update session status to Completed only when finalized
    if (finalize) {
      await supabase
        .from('sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);
    }

    return NextResponse.json({ brief: savedBrief });
  } catch (error: any) {
    console.error('Brief Generation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate app brief' },
      { status: 500 }
    );
  }
}
