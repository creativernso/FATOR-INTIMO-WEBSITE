import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { resend, FROM_EMAIL, sendTransactional } from '@/lib/resend';
import { saveOrder, saveAbandonedCheckout, getOrderBySession } from '@/lib/orders';
import { getProducts, createNotification, getEmailAutomations, upsertLead, getLeadByEmail } from '@/lib/db';
import { purchaseConfirmationHtml, purchaseConfirmationText, campaignHtml, campaignText, fillTemplate } from '@/lib/email-template';
import { alertNewOrder, alertStripeWebhookFailure } from '@/lib/admin-notifications';
import { sendMetaEvent } from '@/lib/meta-capi';
import { getAffiliateByCode, saveAffiliateReferral } from '@/lib/affiliates';
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
      'A variável STRIPE_WEBHOOK_SECRET não está definida na Vercel. O webhook está rodando sem verificação de assinatura: qualquer um pode forjar pedidos.',
    );
    event = JSON.parse(body);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Stripe redelivers this event on any non-2xx/slow response, and this
    // handler does a lot of awaited work (order save, affiliate commission,
    // automation emails, transactional email) before returning — a transient
    // failure partway through would otherwise cause a redelivery to create a
    // second order, credit the affiliate twice, and resend every email.
    if (await getOrderBySession(session.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const { productId, utmSource, utmMedium, utmCampaign, utmContent, fbp, fbc, clientIp, userAgent, affiliateCode } = session.metadata ?? {};
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
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        utmContent: utmContent || undefined,
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

      // Fire the Purchase event to Meta CAPI server-side. The client-side
      // pixel also fires on the success page with the same event_id, so
      // Meta will deduplicate. This catches every paid order even if the
      // user's browser has an ad-blocker or never reaches /checkout/success.
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
        await sendMetaEvent({
          eventName: 'Purchase',
          eventId: `purchase-${session.id}`,
          userData: {
            email,
            phone: session.customer_details?.phone ?? undefined,
            fullName: name,
            externalId: session.id,
            ip: clientIp,
            userAgent,
            fbp,
            fbc,
          },
          customData: {
            currency: 'BRL',
            value: (session.amount_total ?? 0) / 100,
            content_ids: product?.id ? [product.id] : [],
            content_name: product?.title,
            content_type: 'product',
            content_category: product?.category,
            num_items: 1,
            order_id: session.id,
          },
          eventSourceUrl: product?.slug ? `${baseUrl}/products/${product.slug}` : baseUrl,
          actionSource: 'website',
        });
      } catch (err) {
        console.error('[webhook] Meta CAPI Purchase failed:', err);
      }

      // Attribute the sale to an affiliate, if this checkout carried a
      // referral code and that affiliate is currently approved. Rejecting
      // the code silently (no error to the customer) if the affiliate isn't
      // found or isn't approved keeps a stale/forged ?ref= from blocking
      // a real purchase.
      if (affiliateCode) {
        try {
          const affiliate = await getAffiliateByCode(affiliateCode);
          if (affiliate && affiliate.status === 'approved') {
            const saleAmount = session.amount_total ?? 0;
            const commissionAmount = Math.round((saleAmount * affiliate.commissionRate) / 100);
            await saveAffiliateReferral({
              id: uuid(),
              affiliateId: affiliate.id,
              affiliateCode: affiliate.code,
              orderId: session.id,
              sessionId: session.id,
              productTitle: product?.title ?? '',
              saleAmount,
              commissionAmount,
              status: 'pending',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error('[webhook] affiliate referral attribution failed:', err);
        }
      }

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

    // Trigger purchase automations that fire immediately (delayDays === 0).
    // Anything with a delay is picked up by the daily cron instead
    // (app/api/cron/automations/route.ts), which is what actually respects
    // delayDays — sending it here regardless of delay would fire every
    // active "purchase" automation the instant checkout completes.
    if (email && resend) {
      try {
        const automations = await getEmailAutomations();
        const purchaseAutos = automations.filter((a) => a.active && a.trigger === 'purchase' && a.delayDays === 0);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
        const vars = {
          nome: name?.split(' ')[0] || '',
          produto: product?.title ?? '',
          link: product?.slug ? `${baseUrl}/products/${product.slug}` : baseUrl,
        };
        for (const auto of purchaseAutos) {
          const subject = fillTemplate(auto.subject, vars);
          const body = fillTemplate(auto.body, vars);
          await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject,
            html: campaignHtml({ subject, body }),
            text: campaignText({ subject, body }),
          });
          await new Promise((r) => setTimeout(r, 100));
        }
      } catch {}
    }

    // Send confirmation email (transactional — Primary inbox optimized)
    if (resend && email && product) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
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
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    // Only worth recording if we have an email to recover them with — either
    // they typed one on Stripe's page, or we already knew them (pre-filled
    // via customer_email at session creation) and they never even got there.
    const email = session.customer_details?.email || session.customer_email || '';
    if (email) {
      const { productId, utmSource, utmMedium, utmCampaign, utmContent, leadName } = session.metadata ?? {};
      const name = session.customer_details?.name || leadName || '';
      try {
        const allProducts = await getProducts();
        const product = productId ? allProducts.find((p) => p.id === productId) : null;
        await saveAbandonedCheckout({
          id: uuid(),
          sessionId: session.id,
          productId: productId ?? '',
          productTitle: product?.title ?? '',
          productSlug: product?.slug ?? '',
          customerEmail: email,
          customerName: name,
          amountTotal: session.amount_total ?? 0,
          currency: session.currency ?? 'brl',
          createdAt: new Date().toISOString(),
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
          utmContent: utmContent || undefined,
        });
        const amount = ((session.amount_total ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        await createNotification(
          'checkout_abandoned',
          'Carrinho abandonado',
          `${name || email} não concluiu a compra de "${product?.title ?? 'produto'}" (${amount}).`,
          { name, email, productTitle: product?.title ?? '', amount },
        );
      } catch (err) {
        console.error('[webhook] failed to save abandoned checkout:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
