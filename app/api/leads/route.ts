import { NextRequest, NextResponse } from 'next/server';
import { getLeads, upsertLead, getGuideConfig } from '@/lib/db';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { guideDeliveryHtml, guideDeliveryText } from '@/lib/email-template';
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

  // Auto-send guide delivery email if email provided
  if (resend && newLead.email) {
    try {
      const config = await getGuideConfig();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
      const downloadUrl = config.guideFilePath
        ? `${baseUrl}/api/guide-download`
        : undefined;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: newLead.email,
        subject: 'Seu guia gratuito chegou.',
        html: guideDeliveryHtml({ name: newLead.name, downloadUrl, guideTitle: config.title }),
        text: guideDeliveryText({ name: newLead.name, downloadUrl, guideTitle: config.title }),
      });
      await upsertLead({ ...newLead, guideDownloaded: true });
    } catch (err) {
      console.error('[leads] failed to send guide email:', err);
    }
  }

  return NextResponse.json(newLead, { status: 201 });
}
