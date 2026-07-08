import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProducts, markCheckoutStarted } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Pagamentos não configurados.' }, { status: 503 });
  }

  const { productId, visitorId } = await req.json();
  const products = await getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  if (typeof visitorId === 'string' && visitorId) {
    markCheckoutStarted(visitorId).catch(() => {});
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'brl',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: product.price * 100,
            product_data: {
              name: product.title,
              description: product.hook,
              images: [product.coverImage],
            },
          },
          quantity: 1,
        },
      ],
      // Offer card + PIX. Stripe surfaces Apple Pay & Google Pay inside the
      // "card" option automatically for compatible devices/browsers. Each
      // method still has to be turned ON in Stripe Dashboard → Settings →
      // Payment methods — Stripe will reject the session at create-time if
      // a listed method is disabled for this account / currency.
      payment_method_types: ['card', 'pix'],
      metadata: {
        productId: product.id,
        productSlug: product.slug,
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/products/${product.slug}`,
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('[checkout] Stripe error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
