import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProducts, markCheckoutStarted, getLeadByVisitorId } from '@/lib/db';
import { extractFbCookies } from '@/lib/meta-capi';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Pagamentos não configurados.' }, { status: 503 });
  }

  const allowed = await checkRateLimit(`checkout_create:${getClientIp(req)}`, 15, 300);
  if (!allowed) return NextResponse.json({ error: 'Muitas tentativas. Aguarde um pouco.' }, { status: 429 });

  const { productId, visitorId, affiliateCode, utmSource, utmMedium, utmCampaign, utmContent } = await req.json();
  const products = await getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  // If this browser already gave us an email (popup, free guide, community...)
  // pre-fill it on the Checkout Session. This means Stripe has an email to
  // report back even if the shopper closes the tab before typing anything,
  // which is otherwise the main gap in abandoned-checkout recovery.
  let knownEmail: string | undefined;
  let knownName: string | undefined;
  if (typeof visitorId === 'string' && visitorId) {
    markCheckoutStarted(visitorId).catch(() => {});
    try {
      const lead = await getLeadByVisitorId(visitorId);
      if (lead?.email) knownEmail = lead.email;
      if (lead?.name) knownName = lead.name;
    } catch (err) {
      console.error('[checkout] lead lookup failed:', err);
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Capture Meta CAPI matching signals now, while this is still a genuine
  // customer-originated request — the Stripe webhook that later fires the
  // server-side Purchase event is a Stripe-to-server call with no access to
  // the customer's cookies/IP/UA, so these have to be stashed in session
  // metadata here and read back at webhook time.
  const { fbp, fbc } = extractFbCookies(req.headers.get('cookie'));
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const userAgent = req.headers.get('user-agent') || '';

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
      ...(knownEmail ? { customer_email: knownEmail } : {}),
      metadata: {
        productId: product.id,
        productSlug: product.slug,
        ...(knownName ? { leadName: knownName } : {}),
        ...(typeof utmSource === 'string' && utmSource ? { utmSource } : {}),
        ...(typeof utmMedium === 'string' && utmMedium ? { utmMedium } : {}),
        ...(typeof utmCampaign === 'string' && utmCampaign ? { utmCampaign } : {}),
        ...(typeof utmContent === 'string' && utmContent ? { utmContent } : {}),
        // Meta CAPI matching signals, forwarded to the webhook's Purchase event.
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
        ...(clientIp ? { clientIp } : {}),
        ...(userAgent ? { userAgent: userAgent.slice(0, 500) } : {}),
        // Affiliate attribution, validated and turned into a commission by the webhook.
        ...(typeof affiliateCode === 'string' && affiliateCode.trim() ? { affiliateCode: affiliateCode.trim() } : {}),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/products/${product.slug}`,
      locale: 'pt-BR',
      // Shorter than Stripe's 24h default so abandoned checkouts are
      // detected (and can be followed up on) same-day rather than tomorrow.
      expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('[checkout] Stripe error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
