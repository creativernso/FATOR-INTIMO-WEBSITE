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
  const product = productId ? getProducts().find((p) => p.id === productId) : null;

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Try Firebase Storage signed URL first
  const filePath = `products/${productId}/ebook.pdf`;
  try {
    const signedUrl = await getSignedDownloadUrl(filePath, 60 * 60 * 1000); // 1 hour
    return NextResponse.json({ url: signedUrl, source: 'storage' });
  } catch {
    // Fall back to downloadUrl from product data
    const order = getOrderBySession(sessionId);
    const fallbackUrl = order?.downloadUrl || product.downloadUrl;
    if (fallbackUrl) {
      return NextResponse.json({ url: fallbackUrl, source: 'direct' });
    }
    return NextResponse.json({ error: 'Download not available yet' }, { status: 404 });
  }
}
