import { NextRequest, NextResponse } from 'next/server';
import {
  getLeads,
  getEmailAutomations,
  upsertEmailAutomation,
  getProducts,
  getGuides,
  getReviewSettings,
  markLeadReviewRequestSent,
} from '@/lib/db';
import { getOrders, markOrderReviewRequestSent } from '@/lib/orders';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { campaignHtml, campaignText } from '@/lib/email-template';

// Vercel cron, runs daily at 09:00 UTC
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/automations", "schedule": "0 9 * * *" }] }

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

function buildReviewEmail(opts: {
  subject: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  vars: Record<string, string>;
}) {
  const subject = fillTemplate(opts.subject, opts.vars);
  const bodyText = fillTemplate(opts.body, opts.vars);
  // Append the CTA in the campaign template body
  const fullBody = `${bodyText}\n\n→ ${opts.ctaLabel}: ${opts.ctaUrl}`;
  return {
    subject,
    html: campaignHtml({ subject, body: bodyText + `\n\n<a href="${opts.ctaUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:600;margin-top:14px;">${opts.ctaLabel} →</a>`, recipientName: opts.vars.nome }),
    text: campaignText({ subject, body: fullBody, recipientName: opts.vars.nome }),
  };
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!resend) return NextResponse.json({ skipped: 'no resend' });

  const [automations, leads, settings] = await Promise.all([
    getEmailAutomations(),
    getLeads(),
    getReviewSettings(),
  ]);
  const activeAutomations = automations.filter((a) => a.active);
  const results: Record<string, number> = {};

  for (const auto of activeAutomations) {
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
        await resend.emails.send({
          from: FROM_EMAIL,
          to: lead.email,
          subject: auto.subject,
          html: campaignHtml({ subject: auto.subject, body: auto.body, recipientName: lead.name }),
          text: campaignText({ subject: auto.subject, body: auto.body, recipientName: lead.name }),
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
        const email = buildReviewEmail({
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
        const email = buildReviewEmail({
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

  return NextResponse.json({
    ran: activeAutomations.length,
    results,
    productReviewRequestsSent,
    guideReviewRequestsSent,
  });
}
