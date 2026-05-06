import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ received: true });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) return NextResponse.json({ received: true });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { productId, downloadUrl } = session.metadata ?? {};
    const email = session.customer_details?.email;

    // TODO: send download email to `email` with `downloadUrl` for `productId`
    console.log(`Payment confirmed — product: ${productId}, email: ${email}, download: ${downloadUrl}`);
  }

  return NextResponse.json({ received: true });
}
