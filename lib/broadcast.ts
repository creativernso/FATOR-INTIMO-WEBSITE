import { getLeads } from './db';
import { resend, FROM_EMAIL } from './resend';
import {
  newArticleHtml,
  newArticleText,
  newProductHtml,
  newProductText,
  newGuideHtml,
  newGuideText,
} from './email-template';

/**
 * Fire-and-forget broadcast helpers. Each one sends to every lead with an
 * email address, in chunks of 50 with a 200 ms pause between chunks to stay
 * inside Resend's rate limit. Errors are swallowed per-lead so a single bad
 * address doesn't kill the run.
 */

async function sendInChunks<T>(
  recipients: T[],
  build: (r: T) => { to: string; subject: string; html: string; text: string },
) {
  if (!resend) return;
  const CHUNK = 50;
  for (let i = 0; i < recipients.length; i += CHUNK) {
    const chunk = recipients.slice(i, i + CHUNK);
    await Promise.all(
      chunk.map(async (r) => {
        try {
          const { to, subject, html, text } = build(r);
          if (!to) return;
          await resend!.emails.send({ from: FROM_EMAIL, to, subject, html, text });
        } catch {
          // ignore per-recipient failures
        }
      }),
    );
    if (i + CHUNK < recipients.length) {
      await new Promise((res) => setTimeout(res, 200));
    }
  }
}

export async function broadcastArticle(args: {
  title: string;
  excerpt: string;
  url: string;
  coverImage?: string;
}) {
  if (!resend) return;
  const leads = (await getLeads()).filter((l) => l.email);
  if (leads.length === 0) return;
  await sendInChunks(leads, (lead) => ({
    to: lead.email!,
    subject: `Novo artigo — ${args.title}`,
    html: newArticleHtml({
      name: lead.name,
      articleTitle: args.title,
      articleExcerpt: args.excerpt,
      articleUrl: args.url,
      coverImage: args.coverImage,
    }),
    text: newArticleText({
      articleTitle: args.title,
      articleExcerpt: args.excerpt,
      articleUrl: args.url,
    }),
  }));
}

export async function broadcastProduct(args: {
  title: string;
  hook?: string;
  price: number;
  originalPrice?: number;
  url: string;
  coverImage?: string;
}) {
  if (!resend) return;
  const leads = (await getLeads()).filter((l) => l.email);
  if (leads.length === 0) return;
  await sendInChunks(leads, (lead) => ({
    to: lead.email!,
    subject: `Novo material — ${args.title}`,
    html: newProductHtml({
      name: lead.name,
      productTitle: args.title,
      productHook: args.hook,
      productPrice: args.price,
      originalPrice: args.originalPrice,
      productUrl: args.url,
      coverImage: args.coverImage,
    }),
    text: newProductText({
      productTitle: args.title,
      productHook: args.hook,
      productPrice: args.price,
      productUrl: args.url,
    }),
  }));
}

export async function broadcastGuide(args: {
  title: string;
  description: string;
  url: string;
  coverImage?: string;
}) {
  if (!resend) return;
  const leads = (await getLeads()).filter((l) => l.email);
  if (leads.length === 0) return;
  await sendInChunks(leads, (lead) => ({
    to: lead.email!,
    subject: `Novo guia gratuito — ${args.title}`,
    html: newGuideHtml({
      name: lead.name,
      guideTitle: args.title,
      guideDescription: args.description,
      guideUrl: args.url,
      coverImage: args.coverImage,
    }),
    text: newGuideText({
      guideTitle: args.title,
      guideDescription: args.description,
      guideUrl: args.url,
    }),
  }));
}
