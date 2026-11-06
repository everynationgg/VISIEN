/**
 * VISIEN Discord Webhook Notifier
 * Automatically notifies Every Nation GG on Discord when a new client discovery brief is finalized.
 */

interface BriefNotificationPayload {
  client_name: string;
  company?: string | null;
  project_title: string;
  vision_summary: string;
  v1_essential_features?: string[];
  infrastructure_preference?: string;
  target_timeline?: string | null;
  budget_range?: string | null;
  token?: string;
}

export async function sendDiscordBriefNotification(brief: BriefNotificationPayload): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

  // If webhook is not configured, exit silently without disrupting client flow
  if (!webhookUrl) {
    console.log('[Discord] No DISCORD_WEBHOOK_URL configured, skipping notification.');
    return false;
  }

  try {
    const featuresList = (brief.v1_essential_features || [])
      .slice(0, 5)
      .map((f) => `• ${f}`)
      .join('\n');

    const clientDisplay = brief.company
      ? `**${brief.client_name}** (${brief.company})`
      : `**${brief.client_name}**`;

    const embed = {
      title: `🚀 New Blueprint: ${brief.project_title || 'Untitled Project'}`,
      description: brief.vision_summary
        ? brief.vision_summary.length > 500
          ? `${brief.vision_summary.slice(0, 500)}...`
          : brief.vision_summary
        : 'Client completed application discovery session.',
      color: 0x7C3AED, // VISIEN signature violet
      fields: [
        {
          name: '👤 Client & Company',
          value: clientDisplay,
          inline: true,
        },
        {
          name: '⏱️ Target Timeline',
          value: brief.target_timeline || 'Not specified',
          inline: true,
        },
        {
          name: '💰 Budget Range',
          value: brief.budget_range || 'Not specified',
          inline: true,
        },
        {
          name: '✨ Essential V1 Features',
          value: featuresList || 'Detailed in full specification.',
          inline: false,
        },
        {
          name: '🛠️ Architecture Preference',
          value: brief.infrastructure_preference || 'Full-Stack Modern Web',
          inline: true,
        },
      ],
      footer: {
        text: 'VISIEN Discovery Platform • Every Nation GG',
      },
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'VISIEN Intelligence',
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      console.warn(`[Discord] Webhook returned status ${res.status}: ${await res.text().catch(() => '')}`);
      return false;
    }

    console.log('[Discord] Successfully dispatched client blueprint notification to Discord.');
    return true;
  } catch (err: any) {
    // Non-blocking: Catch and log so client brief saving never fails because of Discord
    console.error('[Discord] Failed to send Discord notification:', err?.message || err);
    return false;
  }
}
