import { NextRequest, NextResponse } from 'next/server';
import {
  getLeads,
  getEmailAutomations,
  upsertEmailAutomation,
  getProducts,
  getGuides,
  getReviewSettings,
  markLeadReviewRequestSent,
  getCartRecoverySettings,
  getYoutubeWatcherState,
  saveYoutubeWatcherState,
  upsertEmailCampaign,
  createNotification,
} from '@/lib/db';
import { getOrders, markOrderReviewRequestSent, getAbandonedCheckouts, markAbandonedCheckoutRecoveryEmailSent, markAbandonedCheckoutSecondEmailSent, AbandonedCheckout } from '@/lib/orders';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { campaignHtml, campaignText, cartRecoveryHtml, cartRecoveryText, fillTemplate } from '@/lib/email-template';
import { getLatestVideos } from '@/lib/youtube';
import { alertNewYoutubeVideo } from '@/lib/admin-notifications';
import { EmailCampaign } from '@/lib/types';
import { v4 as uuid } from 'uuid';

// Vercel cron, runs daily at 09:00 UTC
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/automations", "schedule": "0 9 * * *" }] }

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';

function buildCtaEmail(opts: {
  subject: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  vars: Record<string, string>;
}) {
  const subject = fillTemplate(opts.subject, opts.vars);
  const bodyText = fillTemplate(opts.body, opts.vars);
  // Append the CTA in the campaign template body. recipientName is NOT
  // passed here — the body/subject templates already carry their own
  // {nome} greeting, and campaignHtml would otherwise prepend a second,
  // redundant "Olá, Nome," line above it.
  const fullBody = `${bodyText}\n\n→ ${opts.ctaLabel}: ${opts.ctaUrl}`;
  return {
    subject,
    html: campaignHtml({ subject, body: bodyText + `\n\n<a href="${opts.ctaUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:600;margin-top:14px;">${opts.ctaLabel} →</a>` }),
    text: campaignText({ subject, body: fullBody }),
  };
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!resend) return NextResponse.json({ skipped: 'no resend' });

  const [automations, leads, settings, orders] = await Promise.all([
    getEmailAutomations(),
    getLeads(),
    getReviewSettings(),
    getOrders(),
  ]);
  const activeAutomations = automations.filter((a) => a.active);
  const results: Record<string, number> = {};

  for (const auto of activeAutomations) {
    // Purchase-triggered automations (upsell/bonus sequences, etc.) are
    // sourced from orders, not leads, and delayDays === 0 ones already fired
    // immediately from the Stripe webhook — handled in its own block below.
    if (auto.trigger === 'purchase') continue;

    // Same reasoning for signup: delayDays===0 ones are sent immediately in
    // app/api/leads/route.ts. Without this, the very lead that just got the
    // immediate email is also inside today's window (createdAt < now), so
    // the next cron run resent it to every new signup.
    if (auto.trigger === 'signup' && auto.delayDays === 0) continue;

    let targets: typeof leads = [];
    const cutoff = new Date(Date.now() - auto.delayDays * 86400000).toISOString();
    const lastRun = auto.lastRunAt || '1970-01-01T00:00:00Z';

    if (auto.trigger === 'signup') {
      const from = new Date(Date.now() - (auto.delayDays + 1) * 86400000).toISOString();
      targets = leads.filter((l) => l.email && l.createdAt >= from && l.createdAt < cutoff);
    } else if (auto.trigger === 'guide_download') {
      const from = new Date(Date.now() - (auto.delayDays + 1) * 86400000).toISOString();
      targets = leads.filter((l) => l.email && l.guideDownloaded && l.createdAt >= from && l.createdAt < cutoff);
    } else if (auto.trigger === 'inactive_30d') {
      const inactive = new Date(Date.now() - 30 * 86400000).toISOString();
      targets = leads.filter((l) => l.email && l.createdAt < inactive && (!auto.lastRunAt || l.createdAt > lastRun));
    } else if (auto.trigger === 'inactive_60d') {
      const inactive = new Date(Date.now() - 60 * 86400000).toISOString();
      targets = leads.filter((l) => l.email && l.createdAt < inactive && (!auto.lastRunAt || l.createdAt > lastRun));
    }

    let sent = 0;
    for (const lead of targets) {
      if (!lead.email) continue;
      try {
        const vars = { nome: lead.name?.split(' ')[0] || '' };
        const subject = fillTemplate(auto.subject, vars);
        const body = fillTemplate(auto.body, vars);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: lead.email,
          subject,
          html: campaignHtml({ subject, body }),
          text: campaignText({ subject, body }),
        });
        sent++;
      } catch {
        // silent
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    if (sent > 0) {
      await upsertEmailAutomation({ ...auto, totalSent: auto.totalSent + sent, lastRunAt: new Date().toISOString() });
    }
    results[auto.name] = sent;
  }

  // ── Purchase-triggered automations, delayed (day 1+ upsell/bonus emails) ──
  const purchaseAutomations = activeAutomations.filter((a) => a.trigger === 'purchase' && a.delayDays > 0);
  if (purchaseAutomations.length > 0) {
    const products = await getProducts();
    const productById = new Map(products.map((p) => [p.id, p]));

    for (const auto of purchaseAutomations) {
      const cutoff = new Date(Date.now() - auto.delayDays * 86400000).toISOString();
      const from = new Date(Date.now() - (auto.delayDays + 1) * 86400000).toISOString();
      const targets = orders.filter((o) => o.customerEmail && o.createdAt >= from && o.createdAt < cutoff);

      let sent = 0;
      for (const order of targets) {
        try {
          const product = productById.get(order.productId);
          const vars = {
            nome: order.customerName?.split(' ')[0] || '',
            produto: order.productTitle,
            link: product?.slug ? `${BASE_URL}/products/${product.slug}` : BASE_URL,
          };
          const subject = fillTemplate(auto.subject, vars);
          const body = fillTemplate(auto.body, vars);
          await resend.emails.send({
            from: FROM_EMAIL,
            to: order.customerEmail,
            subject,
            html: campaignHtml({ subject, body }),
            text: campaignText({ subject, body }),
          });
          sent++;
        } catch {
          // silent
        }
        await new Promise((r) => setTimeout(r, 100));
      }

      if (sent > 0) {
        await upsertEmailAutomation({ ...auto, totalSent: auto.totalSent + sent, lastRunAt: new Date().toISOString() });
      }
      results[auto.name] = sent;
    }
  }

  // ── Review request emails, products ────────────────────────────────────
  let productReviewRequestsSent = 0;
  if (settings.productEnabled) {
    try {
      const [orders, products] = await Promise.all([getOrders(), getProducts()]);
      const productById = new Map(products.map((p) => [p.id, p]));
      const cutoffMs = Date.now() - settings.productDelayDays * 86400000;

      for (const order of orders) {
        if (order.reviewRequestSentAt) continue;
        if (!order.customerEmail) continue;
        if ((order.amountTotal ?? 0) <= 0) continue;
        if (new Date(order.createdAt).getTime() > cutoffMs) continue;

        const product = productById.get(order.productId);
        if (!product) continue;
        const ctaUrl = `${BASE_URL}/products/${product.slug}?review=1&name=${encodeURIComponent(order.customerName || '')}&email=${encodeURIComponent(order.customerEmail)}#avaliacoes`;
        const email = buildCtaEmail({
          subject: settings.productSubject,
          body: settings.productBody,
          ctaLabel: settings.ctaLabel,
          ctaUrl,
          vars: {
            nome: order.customerName?.split(' ')[0] || '',
            produto: order.productTitle,
            link: ctaUrl,
          },
        });
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: order.customerEmail,
            subject: email.subject,
            html: email.html,
            text: email.text,
          });
          await markOrderReviewRequestSent(order.id);
          productReviewRequestsSent++;
        } catch {
          // silent, retried next day
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (err) {
      console.error('[cron/automations] product review requests failed:', err);
    }
  }

  // ── Review request emails, guides ──────────────────────────────────────
  let guideReviewRequestsSent = 0;
  if (settings.guideEnabled) {
    try {
      const guides = await getGuides();
      const guideBySlug = new Map(guides.map((g) => [g.slug, g]));
      const cutoffMs = Date.now() - settings.guideDelayDays * 86400000;

      for (const lead of leads) {
        if (lead.reviewRequestSentAt) continue;
        if (!lead.email) continue;
        if (!lead.guideDownloaded) continue;
        if (!lead.guideSlug) continue;
        if (new Date(lead.createdAt).getTime() > cutoffMs) continue;

        const guide = guideBySlug.get(lead.guideSlug);
        if (!guide) continue;
        const ctaUrl = `${BASE_URL}/guia/${guide.slug}?review=1&name=${encodeURIComponent(lead.name || '')}&email=${encodeURIComponent(lead.email)}#avaliacoes`;
        const email = buildCtaEmail({
          subject: settings.guideSubject,
          body: settings.guideBody,
          ctaLabel: settings.ctaLabel,
          ctaUrl,
          vars: {
            nome: lead.name?.split(' ')[0] || '',
            guia: guide.title,
            link: ctaUrl,
          },
        });
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: lead.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
          });
          await markLeadReviewRequestSent(lead.id);
          guideReviewRequestsSent++;
        } catch {
          // silent, retried next day
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (err) {
      console.error('[cron/automations] guide review requests failed:', err);
    }
  }

  // ── Abandoned checkout recovery emails (2-step sequence) ─────────────────
  let cartRecoveryEmailsSent = 0;
  let cartSecondEmailsSent = 0;
  try {
    const cartSettings = await getCartRecoverySettings();
    if (cartSettings.enabled || cartSettings.secondEnabled) {
      const [checkouts, orders, cartProducts] = await Promise.all([getAbandonedCheckouts(), getOrders(), getProducts()]);
      const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';

      const isAlreadyRecovered = (checkout: AbandonedCheckout) =>
        orders.some(
          (o) =>
            o.customerEmail === checkout.customerEmail &&
            o.productId === checkout.productId &&
            new Date(o.createdAt).getTime() >= new Date(checkout.createdAt).getTime(),
        );

      const sendCartEmail = (checkout: AbandonedCheckout, subjectTpl: string, bodyTpl: string, ctaLabel: string) => {
        const product = cartProducts.find((p) => p.id === checkout.productId);
        const ctaUrl = checkout.productSlug ? `${BASE}/products/${checkout.productSlug}` : BASE;
        const vars = {
          nome: checkout.customerName?.split(' ')[0] || '',
          produto: checkout.productTitle || 'seu produto',
          link: ctaUrl,
        };
        const subject = fillTemplate(subjectTpl, vars);
        const introMessage = fillTemplate(bodyTpl, vars);
        const emailData = {
          name: checkout.customerName,
          introMessage,
          productTitle: checkout.productTitle || 'seu produto',
          productPrice: checkout.amountTotal,
          originalPrice: product?.originalPrice,
          coverImage: product?.coverImage,
          ctaUrl,
          ctaLabel,
        };
        return resend!.emails.send({
          from: FROM_EMAIL,
          to: checkout.customerEmail,
          subject,
          html: cartRecoveryHtml(emailData),
          text: cartRecoveryText(emailData),
        });
      };

      // First email
      if (cartSettings.enabled) {
        const cutoffMs = Date.now() - cartSettings.delayHours * 3600000;
        for (const checkout of checkouts) {
          if (checkout.recoveryEmailSentAt) continue;
          if (!checkout.customerEmail) continue;
          if (new Date(checkout.createdAt).getTime() > cutoffMs) continue;
          if (isAlreadyRecovered(checkout)) continue;

          try {
            await sendCartEmail(checkout, cartSettings.subject, cartSettings.body, cartSettings.ctaLabel);
            await markAbandonedCheckoutRecoveryEmailSent(checkout.id);
            cartRecoveryEmailsSent++;
          } catch {
            // silent, retried next day
          }
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      // Second, more urgent follow-up — only after the first one already went out
      if (cartSettings.secondEnabled) {
        for (const checkout of checkouts) {
          if (!checkout.recoveryEmailSentAt) continue;
          if (checkout.secondEmailSentAt) continue;
          if (!checkout.customerEmail) continue;
          const dueAtMs = new Date(checkout.recoveryEmailSentAt).getTime() + cartSettings.secondDelayHours * 3600000;
          if (dueAtMs > Date.now()) continue;
          if (isAlreadyRecovered(checkout)) continue;

          try {
            await sendCartEmail(checkout, cartSettings.secondSubject, cartSettings.secondBody, cartSettings.secondCtaLabel);
            await markAbandonedCheckoutSecondEmailSent(checkout.id);
            cartSecondEmailsSent++;
          } catch {
            // silent, retried next day
          }
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    }
  } catch (err) {
    console.error('[cron/automations] cart recovery emails failed:', err);
  }

  // ── YouTube: new-upload detection (drafts an email, doesn't auto-send) ───
  let youtubeVideoDetected = false;
  try {
    const [latest, watcher] = await Promise.all([getLatestVideos(1), getYoutubeWatcherState()]);
    const video = latest[0];
    if (video?.id && video.id !== watcher.lastVideoId) {
      // Only draft a campaign once we already had a baseline — otherwise the
      // very first run after this feature ships would treat the channel's
      // existing latest video as "new" and draft an email for old content.
      if (watcher.lastVideoId) {
        const subject = `Novo vídeo no canal: ${video.title}`;
        const body = `Saiu vídeo novo no canal do Fator Íntimo!\n\n${video.title}\n\nAssista aqui: https://www.youtube.com/watch?v=${video.id}`;
        const campaign: EmailCampaign = {
          id: uuid(),
          subject,
          body,
          segment: 'all',
          status: 'draft',
          sentCount: 0,
          failedCount: 0,
          totalRecipients: 0,
          createdAt: new Date().toISOString(),
        };
        await upsertEmailCampaign(campaign);
        await createNotification(
          'youtube_video',
          'Novo vídeo detectado no YouTube',
          `"${video.title}" foi publicado. Um rascunho de email já está pronto em Emails > Campanhas, revise e envie quando quiser.`,
          { videoTitle: video.title, videoUrl: `https://www.youtube.com/watch?v=${video.id}` }
        );
        alertNewYoutubeVideo(video.title, `https://www.youtube.com/watch?v=${video.id}`);
        youtubeVideoDetected = true;
      }
      await saveYoutubeWatcherState({ lastVideoId: video.id, lastCheckedAt: new Date().toISOString() });
    }
  } catch (err) {
    console.error('[cron/automations] youtube watch failed:', err);
  }

  return NextResponse.json({
    ran: activeAutomations.length,
    results,
    productReviewRequestsSent,
    guideReviewRequestsSent,
    cartRecoveryEmailsSent,
    cartSecondEmailsSent,
    youtubeVideoDetected,
  });
}
