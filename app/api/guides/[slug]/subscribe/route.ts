import { NextRequest, NextResponse } from 'next/server';
import { getGuideBySlug, upsertLead, createNotification, incrementGuideDownloads } from '@/lib/db';
import { Lead } from '@/lib/types';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { guideDeliveryHtml, guideDeliveryText } from '@/lib/email-template';
import { alertGuideDownload } from '@/lib/admin-notifications';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const guide = await getGuideBySlug(slug);
  if (!guide?.published) return NextResponse.json({ error: 'Guia não encontrado.' }, { status: 404 });

  const { name, email, whatsapp } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório.' }, { status: 400 });
  if (!email?.trim() && !whatsapp?.trim())
    return NextResponse.json({ error: 'E-mail ou WhatsApp obrigatório.' }, { status: 400 });

  const lead: Lead = {
    id: uuid(),
    name: name.trim(),
    email: email?.trim() || undefined,
    whatsapp: whatsapp?.trim() || undefined,
    source: `guide/${slug}`,
    guideSlug: slug,
    guideName: guide.title,
    tags: guide.tags ?? [],
    createdAt: new Date().toISOString(),
    guideDownloaded: false,
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
    if (guide.pdfPath) {
      downloadUrl = `${baseUrl}/api/guides/${slug}/download`;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: lead.email,
      subject: `Seu guia chegou: ${guide.title}`,
      html: guideDeliveryHtml({
        name: lead.name,
        downloadUrl,
        guideTitle: guide.title,
        guideSubtitle: guide.subtitle,
      }),
      text: guideDeliveryText({ name: lead.name, downloadUrl, guideTitle: guide.title }),
    });

    await upsertLead({ ...lead, guideDownloaded: true });
  }

  await incrementGuideDownloads(guide.id);
  alertGuideDownload(lead.name, guide.title, lead.email);

  return NextResponse.json({ ok: true, downloadUrl }, { status: 201 });
}
