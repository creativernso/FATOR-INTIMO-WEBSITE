import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getAllCommunityUsers } from '@/lib/db';
import { resend, FROM_EMAIL } from '@/lib/resend';
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

  const { subject, body } = await req.json();
  if (!subject?.trim() || !body?.trim())
    return NextResponse.json({ error: 'Assunto e corpo obrigatórios.' }, { status: 400 });

  const users = await getAllCommunityUsers();
  const targets = users.filter((u) => u.email && !u.banned);

  let sent = 0;
  let failed = 0;

  for (const user of targets) {
    if (!user.email) continue;
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject,
        html: campaignHtml({ subject, body, recipientName: user.name }),
        text: campaignText({ subject, body, recipientName: user.name }),
      });
      sent++;
    } catch {
      failed++;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  return NextResponse.json({ sent, failed, total: targets.length });
}
