import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import { generateAppBriefFromTranscript } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { token, feedbackNotes } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Fetch Session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
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

    // 4. Upsert into app_briefs table
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

    // 5. Update session status to Completed
    await supabase
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    // 6. Optional: Trigger Discord webhook alert to Every Nation GG
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: `✨ New VISIEN App Brief: ${savedBrief.project_title}`,
                description: `**Client:** ${session.client_name}${session.company ? ` (${session.company})` : ''}\n**Vision:** ${savedBrief.vision_summary}`,
                color: 0x7C3AED, // Violet
                fields: [
                  {
                    name: 'Core Action',
                    value: savedBrief.core_action || 'N/A',
                    inline: true,
                  },
                  {
                    name: 'Infrastructure Choice',
                    value: savedBrief.infrastructure_preference || 'ENGG Managed',
                    inline: true,
                  },
                ],
                footer: {
                  text: 'VISIEN by Every Nation GG',
                },
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
      } catch (webhookErr) {
        console.warn('Discord webhook notification failed (non-critical):', webhookErr);
      }
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
