import { NextRequest, NextResponse } from 'next/server';
import { getLeads, upsertLead, getLeadByEmail, getGuideConfig, createNotification, getEmailAutomations } from '@/lib/db';
import { resend, FROM_EMAIL, sendTransactional } from '@/lib/resend';
import { guideDeliveryHtml, guideDeliveryText, campaignHtml, campaignText, fillTemplate } from '@/lib/email-template';
import { alertNewLead } from '@/lib/admin-notifications';
import { sendMetaEvent, extractFbCookies } from '@/lib/meta-capi';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(await getLeads());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Merge into an existing lead by email instead of always creating a new
  // doc — a resubmission (double-click, retry) used to create a second lead
  // with a fresh createdAt, which independently qualified for the immediate
  // signup automation below, sending the welcome email twice.
  const existing = body.email ? await getLeadByEmail(body.email) : null;
  const newLead = {
    id: existing?.id ?? uuid(),
    name: body.name || existing?.name || '',
    email: body.email || existing?.email || undefined,
    whatsapp: body.whatsapp || existing?.whatsapp || undefined,
    source: existing?.source ?? (body.source || 'unknown'),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    guideDownloaded: existing?.guideDownloaded ?? false,
    utmSource: existing?.utmSource ?? (body.utmSource || undefined),
    utmMedium: existing?.utmMedium ?? (body.utmMedium || undefined),
    utmCampaign: existing?.utmCampaign ?? (body.utmCampaign || undefined),
    utmContent: existing?.utmContent ?? (body.utmContent || undefined),
    visitorId: body.visitorId || existing?.visitorId || undefined,
  };
  await upsertLead(newLead);
  await createNotification(
    'guide_download',
    'Novo download do guia',
    `${newLead.name || 'Alguém'} baixou o guia gratuito.`,
    { name: newLead.name, email: newLead.email ?? '', source: newLead.source }
  );
  alertNewLead(newLead.name, newLead.email, newLead.source);

  // Fire Meta CAPI Lead event server-side. The client-side fbq Lead fires
  // with the same event_id (returned in the response) so Meta dedupes.
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || undefined;
    const ua = req.headers.get('user-agent') ?? undefined;
    const { fbp, fbc } = extractFbCookies(req.headers.get('cookie'));
    await sendMetaEvent({
      eventName: 'Lead',
      eventId: `lead-${newLead.id}`,
      userData: {
        email: newLead.email,
        phone: newLead.whatsapp,
        fullName: newLead.name,
        externalId: newLead.id,
        ip,
        userAgent: ua,
        fbp,
        fbc,
      },
      customData: {
        content_name: 'Free Guide Download',
        content_category: 'guide',
        currency: 'BRL',
        value: 0,
      },
      eventSourceUrl: req.headers.get('referer') ?? undefined,
      actionSource: 'website',
    });
  } catch (err) {
    console.error('[leads] Meta CAPI Lead failed:', err);
  }

  // Trigger immediate (delayDays=0) signup automations — only for a lead
  // that's genuinely new, so resubmitting the same email doesn't re-send it.
  if (resend && newLead.email && !existing) {
    try {
      const automations = await getEmailAutomations();
      const immediateAutos = automations.filter((a) => a.active && a.trigger === 'signup' && a.delayDays === 0);
      for (const auto of immediateAutos) {
        const vars = { nome: newLead.name?.split(' ')[0] || '' };
        const subject = fillTemplate(auto.subject, vars);
        const body = fillTemplate(auto.body, vars);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: newLead.email!,
          subject,
          html: campaignHtml({ subject, body }),
          text: campaignText({ subject, body }),
        });
      }
    } catch {}
  }

  // Auto-send guide delivery email if email provided (transactional)
  if (resend && newLead.email) {
    try {
      const config = await getGuideConfig();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
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

  return NextResponse.json(
    { ...newLead, metaEventId: `lead-${newLead.id}` },
    { status: 201 },
  );
}
