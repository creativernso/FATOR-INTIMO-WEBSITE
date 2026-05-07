import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { saveOrder } from '@/lib/orders';
import { getProducts } from '@/lib/db';
import { purchaseConfirmationHtml, purchaseConfirmationText } from '@/lib/email-template';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ received: true });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  if (webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else {
    event = JSON.parse(body);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { productId } = session.metadata ?? {};
    const email = session.customer_details?.email ?? '';
    const name = session.customer_details?.name ?? '';

    const product = productId ? getProducts().find((p) => p.id === productId) : null;
    const rawDownloadUrl = product?.downloadUrl || session.metadata?.downloadUrl || '';

    // Save order
    saveOrder({
      id: uuid(),
      sessionId: session.id,
      productId: productId ?? '',
      productTitle: product?.title ?? '',
      customerEmail: email,
      customerName: name,
      amountTotal: session.amount_total ?? 0,
      currency: session.currency ?? 'brl',
      createdAt: new Date().toISOString(),
      downloadUrl: rawDownloadUrl,
    });

    // Send confirmation email with secure download link
    if (resend && email && product) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
      const secureDownloadUrl = `${baseUrl}/api/download?session_id=${session.id}&redirect=1`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Seu acesso chegou.',
        html: purchaseConfirmationHtml({
          productTitle: product.title,
          customerName: name,
          downloadUrl: secureDownloadUrl,
        }),
        text: purchaseConfirmationText({
          productTitle: product.title,
          customerName: name,
          downloadUrl: secureDownloadUrl,
        }),
      });
    }
  }

  return NextResponse.json({ received: true });
}
