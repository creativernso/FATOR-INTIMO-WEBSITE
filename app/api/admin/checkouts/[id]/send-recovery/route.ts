import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getAbandonedCheckouts, markAbandonedCheckoutRecoveryEmailSent } from '@/lib/orders';
import { getCartRecoverySettings } from '@/lib/db';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { campaignHtml, campaignText } from '@/lib/email-template';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try {
    await getAdminAuth().verifySessionCookie(session, true);
    return true;
  } catch {
    return false;
  }
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!resend) return NextResponse.json({ error: 'E-mail não configurado.' }, { status: 503 });

  const { id } = await params;
  const checkouts = await getAbandonedCheckouts();
  const checkout = checkouts.find((c) => c.id === id);
  if (!checkout) return NextResponse.json({ error: 'Carrinho não encontrado.' }, { status: 404 });
  if (!checkout.customerEmail) return NextResponse.json({ error: 'Sem e-mail para este carrinho.' }, { status: 400 });

  const settings = await getCartRecoverySettings();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
  const ctaUrl = checkout.productSlug ? `${baseUrl}/products/${checkout.productSlug}` : baseUrl;
  const vars = { nome: checkout.customerName?.split(' ')[0] || '', produto: checkout.productTitle || 'seu produto', link: ctaUrl };

  const subject = fillTemplate(settings.subject, vars);
  const bodyText = fillTemplate(settings.body, vars);
  const ctaHtml = `<a href="${ctaUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:600;margin-top:14px;">${settings.ctaLabel} →</a>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: checkout.customerEmail,
    subject,
    html: campaignHtml({ subject, body: `${bodyText}\n\n${ctaHtml}`, recipientName: vars.nome }),
    text: campaignText({ subject, body: `${bodyText}\n\n→ ${settings.ctaLabel}: ${ctaUrl}`, recipientName: vars.nome }),
  });

  await markAbandonedCheckoutRecoveryEmailSent(id);
  return NextResponse.json({ ok: true });
}
