import { resend, FROM_EMAIL } from './resend';

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_FROM_EMAIL || 'rafamoreira.asf@gmail.com';

interface AdminAlertData {
  subject: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  meta?: Record<string, string>;
}

function buildAdminAlertHtml({ title, body, ctaLabel, ctaUrl, meta }: AdminAlertData): string {
  const metaRows = meta
    ? Object.entries(meta)
        .map(([k, v]) => `<tr><td style="padding:4px 0;color:#888;font-size:12px;width:110px">${k}</td><td style="padding:4px 0;color:#ccc;font-size:12px">${v}</td></tr>`)
        .join('')
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0705;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0705;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1a1410;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;">
        <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
        <tr><td align="center" style="padding:32px 36px 0;">
          <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO · ADMIN</p>
        </td></tr>
        <tr><td style="padding:24px 36px 8px;">
          <h1 style="margin:0;font-size:22px;font-weight:400;color:#f5f0eb;line-height:1.3;">${title}</h1>
        </td></tr>
        <tr><td style="padding:8px 36px 24px;">
          <p style="margin:0;font-size:14px;color:#a09080;line-height:1.6;">${body}</p>
        </td></tr>
        ${metaRows ? `<tr><td style="padding:0 36px 24px;"><table>${metaRows}</table></td></tr>` : ''}
        ${ctaLabel && ctaUrl ? `
        <tr><td style="padding:0 36px 32px;">
          <a href="${ctaUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:12px 24px;border-radius:50px;font-size:13px;font-weight:600;letter-spacing:0.5px;">${ctaLabel}</a>
        </td></tr>` : ''}
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:11px;color:#604040;">Esta é uma notificação automática do painel Fator Íntimo.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAdminAlert(data: AdminAlertData): Promise<void> {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[FI Admin] ${data.subject}`,
      html: buildAdminAlertHtml(data),
    });
  } catch (err) {
    console.error('[admin-alert] failed:', err);
  }
}

// ── Pre-built alerts ──────────────────────────────────────────────────────────

export function alertNewLead(name: string, email?: string, source?: string) {
  return sendAdminAlert({
    subject: 'Novo lead captado',
    title: 'Novo lead captado',
    body: `${name} acabou de entrar na sua lista.`,
    ctaLabel: 'Ver leads',
    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com'}/admin/leads`,
    meta: { Nome: name, Email: email || '-', Fonte: source || '-' },
  });
}

export function alertNewTestimonial(name: string) {
  return sendAdminAlert({
    subject: 'Novo depoimento aguardando aprovação',
    title: 'Novo depoimento recebido',
    body: `${name} enviou um depoimento. Acesse o painel para aprovar.`,
    ctaLabel: 'Revisar depoimento',
    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com'}/admin/testimonials`,
    meta: { Nome: name },
  });
}

export function alertNewCommunityPost(title: string, author: string) {
  return sendAdminAlert({
    subject: 'Nova publicação aguardando aprovação',
    title: 'Nova publicação na comunidade',
    body: `"${title}" por ${author} aguarda moderação.`,
    ctaLabel: 'Moderar publicação',
    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com'}/admin/comunidade`,
    meta: { Título: title, Autor: author },
  });
}

export function alertNewOrder(productTitle: string, amount: number, customerEmail: string) {
  return sendAdminAlert({
    subject: `Nova venda: R$ ${(amount / 100).toFixed(2)}`,
    title: 'Nova venda realizada! 🎉',
    body: `${productTitle} foi comprado.`,
    ctaLabel: 'Ver pedido',
    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com'}/admin/orders`,
    meta: { Produto: productTitle, Valor: `R$ ${(amount / 100).toFixed(2)}`, Email: customerEmail },
  });
}

export function alertNewComment(postTitle: string, author: string) {
  return sendAdminAlert({
    subject: 'Novo comentário para aprovar',
    title: 'Novo comentário recebido',
    body: `${author} comentou em "${postTitle}".`,
    ctaLabel: 'Revisar comentários',
    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com'}/admin/comments`,
    meta: { Artigo: postTitle, Autor: author },
  });
}

export function alertNewCommunityComment(postTitle: string, author: string) {
  return sendAdminAlert({
    subject: 'Novo comentário na comunidade',
    title: 'Novo comentário na comunidade',
    body: `${author} comentou em "${postTitle}".`,
    ctaLabel: 'Ver discussão',
    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com'}/admin/comunidade`,
    meta: { Publicação: postTitle, Autor: author },
  });
}

export function alertCommunityReport(reason: string, reporter: string, target: string) {
  return sendAdminAlert({
    subject: '⚠️ Nova denúncia na comunidade',
    title: 'Conteúdo denunciado pela comunidade',
    body: `Motivo: "${reason}". Conteúdo aguarda moderação.`,
    ctaLabel: 'Moderar agora',
    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com'}/admin/comunidade`,
    meta: { Denunciante: reporter, Alvo: target, Motivo: reason },
  });
}

// ── Chat alerts with throttling ───────────────────────────────────────────────
// We don't want one email per visitor message during a fast back-and-forth.
// Instead, send at most one alert per visitor every CHAT_ALERT_COOLDOWN ms.
const CHAT_ALERT_COOLDOWN = 10 * 60 * 1000; // 10 minutes
const lastChatAlertAt = new Map<string, number>();

export function alertNewChatMessage(visitorId: string, firstLineOfMessage: string) {
  const now = Date.now();
  const last = lastChatAlertAt.get(visitorId) ?? 0;
  if (now - last < CHAT_ALERT_COOLDOWN) return Promise.resolve();
  lastChatAlertAt.set(visitorId, now);

  return sendAdminAlert({
    subject: 'Nova mensagem no Live Chat',
    title: 'Visitante iniciou uma conversa',
    body: `"${firstLineOfMessage.slice(0, 140)}"`,
    ctaLabel: 'Responder agora',
    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com'}/admin/chat`,
    meta: { Visitante: visitorId.slice(0, 24), Mensagem: firstLineOfMessage.slice(0, 100) },
  });
}
