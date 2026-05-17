import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { resend, FROM_EMAIL, sendTransactional } from '@/lib/resend';
import { saveOrder } from '@/lib/orders';
import { getProducts, createNotification, getEmailAutomations, upsertLead, getLeadByEmail } from '@/lib/db';
import { purchaseConfirmationHtml, purchaseConfirmationText, campaignHtml, campaignText } from '@/lib/email-template';
import { alertNewOrder, alertStripeWebhookFailure } from '@/lib/admin-notifications';
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      console.error('[webhook] signature verification failed:', msg);
      alertStripeWebhookFailure(
        'invalid_signature',
        `STRIPE_WEBHOOK_SECRET na Vercel não corresponde ao signing secret do endpoint na Stripe. Erro original: ${msg}`,
      );
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else {
    console.warn('[webhook] STRIPE_WEBHOOK_SECRET not set — running without signature verification');
    alertStripeWebhookFailure(
      'missing_secret',
      'A variável STRIPE_WEBHOOK_SECRET não está definida na Vercel. O webhook está rodando sem verificação de assinatura — qualquer um pode forjar pedidos.',
    );
    event = JSON.parse(body);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { productId } = session.metadata ?? {};
    const email = session.customer_details?.email ?? '';
    const name = session.customer_details?.name ?? '';

    const allProducts = await getProducts();
    const product = productId ? allProducts.find((p) => p.id === productId) : null;
    const rawDownloadUrl = product?.downloadUrl || '';

    // Save order
    try {
      await saveOrder({
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
      console.log('[webhook] order saved:', session.id);
      const amount = ((session.amount_total ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      await createNotification(
        'purchase',
        'Nova compra realizada',
        `${name || email} comprou "${product?.title ?? 'produto'}" por ${amount}.`,
        { name, email, productTitle: product?.title ?? '', amount }
      );
      alertNewOrder(product?.title ?? 'produto', session.amount_total ?? 0, email);

      // Add (or enrich) the buyer in the leads collection so they receive
      // newsletters, campaigns and post-purchase automations, exactly like
      // someone who downloaded a free guide.
      if (email) {
        try {
          const existing = await getLeadByEmail(email);
          const tags = new Set(existing?.tags ?? []);
          tags.add('buyer');
          if (product?.slug) tags.add(`product:${product.slug}`);
          await upsertLead({
            id: existing?.id ?? uuid(),
            email,
            name: name || existing?.name || '',
            whatsapp: existing?.whatsapp,
            source: existing?.source ?? `purchase:${product?.slug ?? 'product'}`,
            guideSlug: existing?.guideSlug,
            guideName: existing?.guideName,
            tags: Array.from(tags),
            createdAt: existing?.createdAt ?? new Date().toISOString(),
            guideDownloaded: existing?.guideDownloaded,
            reviewRequestSentAt: existing?.reviewRequestSentAt,
          });
        } catch (err) {
          console.error('[webhook] failed to upsert lead for buyer:', err);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      console.error('[webhook] failed to save order:', err);
      alertStripeWebhookFailure(
        'save_order_failed',
        `Não foi possível salvar o pedido para a sessão ${session.id} (cliente ${email}). Erro: ${msg}`,
      );
    }

    // Trigger purchase automations immediately
    if (email && resend) {
      try {
        const automations = await getEmailAutomations();
        const purchaseAutos = automations.filter((a) => a.active && a.trigger === 'purchase');
        for (const auto of purchaseAutos) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: auto.subject,
            html: campaignHtml({ subject: auto.subject, body: auto.body, recipientName: name }),
            text: campaignText({ subject: auto.subject, body: auto.body, recipientName: name }),
          });
          await new Promise((r) => setTimeout(r, 100));
        }
      } catch {}
    }

    // Send confirmation email (transactional — Primary inbox optimized)
    if (resend && email && product) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
      const secureDownloadUrl = `${baseUrl}/api/download?session_id=${session.id}&redirect=1`;

      await sendTransactional({
        to: email,
        subject: `Pedido confirmado: ${product.title}`,
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
        tag: `order-${session.id}`,
      });
      console.log('[webhook] email sent to:', email);
    } else {
      console.warn('[webhook] email skipped, resend:', !!resend, 'email:', email, 'product:', !!product);
    }
  }

  return NextResponse.json({ received: true });
}
