import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProducts } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Pagamentos não configurados.' }, { status: 503 });
  }

  const { productId } = await req.json();
  const products = getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'pix'],
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
    metadata: {
      productId: product.id,
      productSlug: product.slug,
      downloadUrl: product.downloadUrl || '',
    },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/products/${product.slug}`,
    locale: 'pt-BR',
  });

  return NextResponse.json({ url: session.url });
}
