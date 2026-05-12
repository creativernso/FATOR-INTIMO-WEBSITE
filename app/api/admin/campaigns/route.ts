import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { getLeads, upsertEmailCampaign, getEmailCampaigns, deleteEmailCampaign } from '@/lib/db';
import { campaignHtml, campaignText } from '@/lib/email-template';
import { EmailCampaign } from '@/lib/types';
import { v4 as uuid } from 'uuid';

async function assertAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) throw new Error('Unauthorized');
  await getAdminAuth().verifySessionCookie(session, true);
}

export async function GET() {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getEmailCampaigns());
}

export async function DELETE(req: NextRequest) {
  try { await assertAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await req.json();
  if (id) await deleteEmailCampaign(id);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try { await assertAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!resend) return NextResponse.json({ error: 'Email não configurado.' }, { status: 503 });

  const body = await req.json();
  const { subject, emailBody, segment = 'all', scheduledAt } = body;

  if (!subject?.trim() || !emailBody?.trim()) {
    return NextResponse.json({ error: 'Assunto e corpo obrigatórios.' }, { status: 400 });
  }

  const campaign: EmailCampaign = {
    id: uuid(),
    subject,
    body: emailBody,
    segment,
    status: scheduledAt ? 'scheduled' : 'sending',
    sentCount: 0,
    failedCount: 0,
    totalRecipients: 0,
    scheduledAt: scheduledAt || undefined,
    createdAt: new Date().toISOString(),
  };

  // If scheduled, just save and return
  if (scheduledAt) {
    await upsertEmailCampaign(campaign);
    return NextResponse.json(campaign);
  }

  // Immediate send
  const allLeads = await getLeads();
  let targets = allLeads.filter((l) => !!l.email);
  if (segment === 'guide_downloaded') targets = allLeads.filter((l) => !!l.email && l.guideDownloaded);
  if (segment === 'no_purchase') targets = allLeads.filter((l) => !!l.email);

  campaign.totalRecipients = targets.length;
  await upsertEmailCampaign(campaign);

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const lead = targets[i];
    if (!lead.email) continue;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: lead.email,
        subject,
        html: campaignHtml({ subject, body: emailBody, recipientName: lead.name }),
        text: campaignText({ subject, body: emailBody, recipientName: lead.name }),
      });
      sent++;
    } catch {
      failed++;
    }
    if (i % 10 === 9) await new Promise((r) => setTimeout(r, 200));
  }

  const updated: EmailCampaign = {
    ...campaign,
    status: failed === targets.length ? 'failed' : 'sent',
    sentCount: sent,
    failedCount: failed,
    sentAt: new Date().toISOString(),
  };
  await upsertEmailCampaign(updated);
  return NextResponse.json(updated);
}
