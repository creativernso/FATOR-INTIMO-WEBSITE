import { Resend } from 'resend';

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Marketing / bulk sender — for campaigns and broadcasts.
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Fator Íntimo <noreply@fatorintimo.com>';

// Transactional sender — receipts, downloads, password resets, etc.
// A personal-feeling display name nudges Gmail toward the Primary tab
// instead of Promotions. Override via env if needed.
export const TRANSACTIONAL_FROM =
  process.env.RESEND_TRANSACTIONAL_FROM || 'Rafael · Fator Íntimo <noreply@fatorintimo.com>';

// Public reply inbox — must be a real mailbox you can actually answer from.
// Setting Reply-To improves deliverability (recipients can reply, which
// teaches Gmail this sender is human, not bulk marketing).
export const REPLY_TO = process.env.REPLY_TO_EMAIL || 'contato@fatorintimo.com';

/**
 * Send a transactional email with all the headers that nudge Gmail toward
 * the Primary inbox: personal From, real Reply-To, RFC 8058 List-Unsubscribe.
 * Failures are logged but do not throw — callers shouldn't have to wrap.
 */
export async function sendTransactional(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
  tag?: string;
}): Promise<void> {
  if (!resend) {
    console.warn('[sendTransactional] no Resend client, skipping:', args.subject);
    return;
  }
  try {
    await resend.emails.send({
      from: TRANSACTIONAL_FROM,
      to: args.to,
      replyTo: REPLY_TO,
      subject: args.subject,
      html: args.html,
      text: args.text,
      headers: {
        'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        ...(args.tag ? { 'X-Entity-Ref-ID': args.tag } : {}),
      },
    });
  } catch (err) {
    console.error('[sendTransactional] failed:', err);
  }
}
