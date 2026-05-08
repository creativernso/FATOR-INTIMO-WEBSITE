import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { getLeads } from '@/lib/db';
import { campaignHtml, campaignText } from '@/lib/email-template';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await getAdminAuth().verifySessionCookie(session, true);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!resend) return NextResponse.json({ error: 'Email não configurado.' }, { status: 503 });

  const { subject, body, segment } = await req.json();
  if (!subject?.trim() || !body?.trim())
    return NextResponse.json({ error: 'Assunto e corpo obrigatórios.' }, { status: 400 });

  const allLeads = await getLeads();
  let targets = allLeads.filter((l) => !!l.email);
  if (segment === 'email') targets = allLeads.filter((l) => !!l.email && !l.whatsapp);
  if (segment === 'whatsapp') targets = allLeads.filter((l) => !!l.whatsapp);

  let sent = 0;
  let failed = 0;

  for (const lead of targets) {
    if (!lead.email) continue;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: lead.email,
        subject,
        html: campaignHtml({ subject, body, recipientName: lead.name }),
        text: campaignText({ subject, body, recipientName: lead.name }),
      });
      sent++;
    } catch {
      failed++;
    }
    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 100));
  }

  return NextResponse.json({ sent, failed, total: targets.length });
}
