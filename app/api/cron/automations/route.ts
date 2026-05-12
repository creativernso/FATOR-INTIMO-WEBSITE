import { NextRequest, NextResponse } from 'next/server';
import { getLeads, getEmailAutomations, upsertEmailAutomation } from '@/lib/db';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { campaignHtml, campaignText } from '@/lib/email-template';

// Vercel cron — runs daily at 09:00 UTC
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/automations", "schedule": "0 9 * * *" }] }

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!resend) return NextResponse.json({ skipped: 'no resend' });

  const [automations, leads] = await Promise.all([getEmailAutomations(), getLeads()]);
  const activeAutomations = automations.filter((a) => a.active);
  const results: Record<string, number> = {};

  for (const auto of activeAutomations) {
    let targets: typeof leads = [];
    const cutoff = new Date(Date.now() - auto.delayDays * 86400000).toISOString();
    const lastRun = auto.lastRunAt || '1970-01-01T00:00:00Z';

    if (auto.trigger === 'signup') {
      // Send to leads who signed up `delayDays` days ago (within a 24h window)
      const from = new Date(Date.now() - (auto.delayDays + 1) * 86400000).toISOString();
      targets = leads.filter((l) => l.email && l.createdAt >= from && l.createdAt < cutoff);
    } else if (auto.trigger === 'guide_download') {
      const from = new Date(Date.now() - (auto.delayDays + 1) * 86400000).toISOString();
      targets = leads.filter((l) => l.email && l.guideDownloaded && l.createdAt >= from && l.createdAt < cutoff);
    } else if (auto.trigger === 'inactive_30d') {
      const inactive = new Date(Date.now() - 30 * 86400000).toISOString();
      targets = leads.filter((l) => l.email && l.createdAt < inactive && (!auto.lastRunAt || l.createdAt > lastRun));
    } else if (auto.trigger === 'inactive_60d') {
      const inactive = new Date(Date.now() - 60 * 86400000).toISOString();
      targets = leads.filter((l) => l.email && l.createdAt < inactive && (!auto.lastRunAt || l.createdAt > lastRun));
    }

    let sent = 0;
    for (const lead of targets) {
      if (!lead.email) continue;
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: lead.email,
          subject: auto.subject,
          html: campaignHtml({ subject: auto.subject, body: auto.body, recipientName: lead.name }),
          text: campaignText({ subject: auto.subject, body: auto.body, recipientName: lead.name }),
        });
        sent++;
      } catch {
        // silent
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    if (sent > 0) {
      await upsertEmailAutomation({ ...auto, totalSent: auto.totalSent + sent, lastRunAt: new Date().toISOString() });
    }
    results[auto.name] = sent;
  }

  return NextResponse.json({ ran: activeAutomations.length, results });
}
