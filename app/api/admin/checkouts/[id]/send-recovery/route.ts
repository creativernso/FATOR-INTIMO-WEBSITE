import { NextRequest, NextResponse } from 'next/server';
import { getAbandonedCheckouts, markAbandonedCheckoutRecoveryEmailSent } from '@/lib/orders';
import { getCartRecoverySettings, getProducts } from '@/lib/db';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { cartRecoveryHtml, cartRecoveryText } from '@/lib/email-template';
import { requireAdmin } from '@/lib/admin-auth';

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!resend) return NextResponse.json({ error: 'E-mail não configurado.' }, { status: 503 });

  const { id } = await params;
  const checkouts = await getAbandonedCheckouts();
  const checkout = checkouts.find((c) => c.id === id);
  if (!checkout) return NextResponse.json({ error: 'Carrinho não encontrado.' }, { status: 404 });
  if (!checkout.customerEmail) return NextResponse.json({ error: 'Sem e-mail para este carrinho.' }, { status: 400 });

  const [settings, products] = await Promise.all([getCartRecoverySettings(), getProducts()]);
  const product = products.find((p) => p.id === checkout.productId);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
  const ctaUrl = checkout.productSlug ? `${baseUrl}/products/${checkout.productSlug}` : baseUrl;
  const vars = { nome: checkout.customerName?.split(' ')[0] || '', produto: checkout.productTitle || 'seu produto', link: ctaUrl };

  const subject = fillTemplate(settings.subject, vars);
  const introMessage = fillTemplate(settings.body, vars);

  const emailData = {
    name: checkout.customerName,
    introMessage,
    productTitle: checkout.productTitle || 'seu produto',
    productPrice: checkout.amountTotal,
    originalPrice: product?.originalPrice,
    coverImage: product?.coverImage,
    ctaUrl,
    ctaLabel: settings.ctaLabel,
  };

  await resend.emails.send({
    from: FROM_EMAIL,
    to: checkout.customerEmail,
    subject,
    html: cartRecoveryHtml(emailData),
    text: cartRecoveryText(emailData),
  });

  await markAbandonedCheckoutRecoveryEmailSent(id);
  return NextResponse.json({ ok: true });
}
