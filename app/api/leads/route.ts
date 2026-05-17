import { NextRequest, NextResponse } from 'next/server';
import { getLeads, upsertLead, getGuideConfig, createNotification, getEmailAutomations } from '@/lib/db';
import { resend, FROM_EMAIL, sendTransactional } from '@/lib/resend';
import { guideDeliveryHtml, guideDeliveryText, campaignHtml, campaignText } from '@/lib/email-template';
import { alertNewLead } from '@/lib/admin-notifications';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(await getLeads());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newLead = {
    id: uuid(),
    name: body.name || '',
    email: body.email || undefined,
    whatsapp: body.whatsapp || undefined,
    source: body.source || 'unknown',
    createdAt: new Date().toISOString(),
    guideDownloaded: false,
  };
  await upsertLead(newLead);
  await createNotification(
    'guide_download',
    'Novo download do guia',
    `${newLead.name || 'Alguém'} baixou o guia gratuito.`,
    { name: newLead.name, email: newLead.email ?? '', source: newLead.source }
  );
  alertNewLead(newLead.name, newLead.email, newLead.source);

  // Trigger immediate (delayDays=0) signup automations
  if (resend && newLead.email) {
    try {
      const automations = await getEmailAutomations();
      const immediateAutos = automations.filter((a) => a.active && a.trigger === 'signup' && a.delayDays === 0);
      for (const auto of immediateAutos) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: newLead.email!,
          subject: auto.subject,
          html: campaignHtml({ subject: auto.subject, body: auto.body, recipientName: newLead.name }),
          text: campaignText({ subject: auto.subject, body: auto.body, recipientName: newLead.name }),
        });
      }
    } catch {}
  }

  // Auto-send guide delivery email if email provided (transactional)
  if (resend && newLead.email) {
    try {
      const config = await getGuideConfig();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
      const downloadUrl = config.guideFilePath
        ? `${baseUrl}/api/guide-download`
        : undefined;

      await sendTransactional({
        to: newLead.email,
        subject: `Seu guia chegou: ${config.title}`,
        html: guideDeliveryHtml({ name: newLead.name, downloadUrl, guideTitle: config.title }),
        text: guideDeliveryText({ name: newLead.name, downloadUrl, guideTitle: config.title }),
        tag: `guide-free-${newLead.id}`,
      });
      await upsertLead({ ...newLead, guideDownloaded: true });
    } catch (err) {
      console.error('[leads] failed to send guide email:', err);
    }
  }

  return NextResponse.json(newLead, { status: 201 });
}
