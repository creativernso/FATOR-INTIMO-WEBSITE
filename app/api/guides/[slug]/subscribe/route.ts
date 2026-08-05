import { NextRequest, NextResponse } from 'next/server';
import { getGuideBySlug, upsertLead, getLeadByEmail, createNotification, incrementGuideDownloads } from '@/lib/db';
import { Lead } from '@/lib/types';
import { resend, sendTransactional } from '@/lib/resend';
import { guideDeliveryHtml, guideDeliveryText } from '@/lib/email-template';
import { alertGuideDownload } from '@/lib/admin-notifications';
import { sendMetaEvent, extractFbCookies } from '@/lib/meta-capi';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const guide = await getGuideBySlug(slug);
  if (!guide?.published) return NextResponse.json({ error: 'Guia não encontrado.' }, { status: 404 });

  const { name, email, whatsapp, utmSource, utmMedium, utmCampaign, utmContent, visitorId } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório.' }, { status: 400 });
  if (!email?.trim() && !whatsapp?.trim())
    return NextResponse.json({ error: 'E-mail ou WhatsApp obrigatório.' }, { status: 400 });

  // Merge into an existing lead by email instead of always creating a new
  // doc — a repeat download used to create a second lead with a fresh
  // createdAt, independently eligible for the guide_download cron
  // automation's time window and so able to receive it twice.
  const cleanEmail = email?.trim() || undefined;
  const existing = cleanEmail ? await getLeadByEmail(cleanEmail) : null;
  const lead: Lead = {
    id: existing?.id ?? uuid(),
    name: name.trim(),
    email: cleanEmail,
    whatsapp: whatsapp?.trim() || undefined,
    source: `guide/${slug}`,
    guideSlug: slug,
    guideName: guide.title,
    tags: guide.tags ?? [],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    guideDownloaded: existing?.guideDownloaded ?? false,
    utmSource: utmSource || undefined,
    utmMedium: utmMedium || undefined,
    utmCampaign: utmCampaign || undefined,
    utmContent: utmContent || undefined,
    visitorId: visitorId || undefined,
  };

  await upsertLead(lead);
  await createNotification(
    'guide_download',
    'Novo download do guia',
    `${lead.name || 'Alguém'} baixou "${guide.title}".`,
    { guideSlug: slug, name: lead.name, email: lead.email ?? '' }
  );

  let downloadUrl: string | undefined;

  if (resend && lead.email) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
    if (guide.pdfPath) {
      downloadUrl = `${baseUrl}/api/guides/${slug}/download`;
    }

    await sendTransactional({
      to: lead.email,
      subject: `Seu guia chegou: ${guide.title}`,
      html: guideDeliveryHtml({
        name: lead.name,
        downloadUrl,
        guideTitle: guide.title,
        guideSubtitle: guide.subtitle,
      }),
      text: guideDeliveryText({ name: lead.name, downloadUrl, guideTitle: guide.title }),
      tag: `guide-${slug}-${lead.id}`,
    });

    await upsertLead({ ...lead, guideDownloaded: true });
  }

  await incrementGuideDownloads(guide.id);
  alertGuideDownload(lead.name, guide.title, lead.email);

  // Fire Meta CAPI Lead event server-side. Same event_id as the client-side
  // fbq Lead (returned in the metaEventId field below) so Meta dedupes.
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || undefined;
    const ua = req.headers.get('user-agent') ?? undefined;
    const { fbp, fbc } = extractFbCookies(req.headers.get('cookie'));
    await sendMetaEvent({
      eventName: 'Lead',
      eventId: `lead-${lead.id}`,
      userData: {
        email: lead.email,
        phone: lead.whatsapp,
        fullName: lead.name,
        externalId: lead.id,
        ip,
        userAgent: ua,
        fbp,
        fbc,
      },
      customData: {
        content_name: guide.title,
        content_category: 'guide',
        content_ids: [slug],
        currency: 'BRL',
        value: 0,
      },
      eventSourceUrl: req.headers.get('referer') ?? undefined,
      actionSource: 'website',
    });
  } catch (err) {
    console.error('[guide subscribe] Meta CAPI Lead failed:', err);
  }

  return NextResponse.json(
    { ok: true, downloadUrl, metaEventId: `lead-${lead.id}` },
    { status: 201 },
  );
}
