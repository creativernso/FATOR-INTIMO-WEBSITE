import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getOrderBySession } from '@/lib/orders';
import { getSignedDownloadUrl } from '@/lib/firebase-admin';
import { getProducts } from '@/lib/db';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId || !stripe) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Verify Stripe session is paid
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not confirmed' }, { status: 403 });
  }

  const productId = session.metadata?.productId;
  const allProducts = await getProducts();
  const product = productId ? allProducts.find((p) => p.id === productId) : null;

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const shouldRedirect = req.nextUrl.searchParams.get('redirect') === '1';

  // Try Firebase Storage signed URL, fall back to stored downloadUrl
  const filePath = `products/${productId}/ebook.pdf`;
  let resolvedUrl: string | null = null;

  try {
    resolvedUrl = await getSignedDownloadUrl(filePath, 60 * 60 * 1000);
  } catch {
    const order = await getOrderBySession(sessionId);
    resolvedUrl = order?.downloadUrl || product.downloadUrl || null;
  }

  if (!resolvedUrl) {
    return NextResponse.json({ error: 'Download not available yet' }, { status: 404 });
  }

  if (shouldRedirect) {
    return NextResponse.redirect(resolvedUrl);
  }
  return NextResponse.json({ url: resolvedUrl });
}
