interface EmailData {
  productTitle: string;
  customerName?: string;
  downloadUrl?: string;
}

export function purchaseConfirmationHtml({ productTitle, customerName, downloadUrl }: EmailData): string {
  const name = customerName || 'você';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu acesso chegou.</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0a04;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0a04;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#1a1410;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

          <!-- Header line -->
          <tr>
            <td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td>
          </tr>

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:40px 40px 0;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
            </td>
          </tr>

          <!-- Main heading -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <h1 style="margin:0;font-size:32px;font-weight:300;color:#f5f0eb;letter-spacing:-0.5px;line-height:1.2;">
                Seu acesso chegou.
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(255,255,255,0.06);margin:16px 0;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#9a8f85;">
                Olá${customerName ? `, ${customerName}` : ''},
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#9a8f85;">
                A sua compra de <strong style="color:#f5f0eb;">${productTitle}</strong> foi confirmada.
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#9a8f85;">
                Este material foi criado para quem decide parar de repetir padrões e começa a entender, de verdade, como funciona o mundo das relações. Você fez essa escolha. Agora é o momento de ir fundo.
              </p>
            </td>
          </tr>

          <!-- Download button -->
          ${downloadUrl ? `
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <a href="${downloadUrl}"
                style="display:inline-block;background:#fe0050;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;letter-spacing:0.5px;padding:16px 40px;border-radius:50px;">
                Baixar meu ebook →
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#6b6055;">
                O link estará disponível por 72 horas. Faça o download e guarde em local seguro.
              </p>
            </td>
          </tr>
          ` : `
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:rgba(254,0,80,0.05);border:1px solid rgba(254,0,80,0.15);border-radius:12px;padding:20px;">
                <p style="margin:0;font-size:13px;color:#9a8f85;line-height:1.7;">
                  📚 O seu link de download será enviado em um segundo email nas próximas horas. Se não encontrar, verifique a pasta de spam.
                </p>
              </div>
            </td>
          </tr>
          `}

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 40px;">
              <p style="margin:0 0 8px;font-size:12px;color:#6b6055;">
                Garantia de 7 dias. Se não ficou satisfeito, basta responder este email.
              </p>
              <p style="margin:0;font-size:12px;color:#6b6055;">
                © Fator Íntimo — fatorintimo.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function purchaseConfirmationText({ productTitle, customerName, downloadUrl }: EmailData): string {
  return `Seu acesso chegou.

Olá${customerName ? `, ${customerName}` : ''},

A sua compra de "${productTitle}" foi confirmada.

${downloadUrl ? `Baixe seu ebook aqui: ${downloadUrl}` : 'Seu link de download será enviado em breve.'}

Garantia de 7 dias. Qualquer dúvida, responda este email.

— Fator Íntimo`;
}

// ─── Guide delivery email ───────────────────────────────────────────────────

interface GuideEmailData {
  name?: string;
  downloadUrl?: string;
  guideTitle?: string;
}

export function guideDeliveryHtml({ name, downloadUrl, guideTitle }: GuideEmailData): string {
  const displayName = name || 'você';
  const title = guideTitle || '7 Erros que Fazem Alguém Perder o Interesse';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu guia gratuito chegou.</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
          <tr>
            <td align="center" style="padding:36px 40px 0;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 8px;">
              <h1 style="margin:0;font-size:28px;font-weight:400;color:#dcdcdc;line-height:1.3;">
                Seu guia gratuito chegou.
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(255,255,255,0.06);margin:16px 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 14px;font-size:15px;line-height:1.8;color:#a0a0a0;">Olá${name ? `, ${displayName}` : ''},</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.8;color:#a0a0a0;">
                O seu guia <strong style="color:#dcdcdc;">${title}</strong> está pronto para download.
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#a0a0a0;">
                Clique no botão abaixo para acessar o material.
              </p>
              ${downloadUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" style="display:inline-block;background:#fe0050;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                      Baixar Guia Gratuito →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:12px;color:#666666;text-align:center;">
                O link expira em 7 dias. Salve o arquivo após o download.
              </p>` : `
              <p style="margin:0;font-size:14px;color:#a0a0a0;">Seu link de acesso será enviado em breve.</p>`}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:12px;color:#555555;text-align:center;">
                Fator Íntimo · Psicologia das Relações<br/>
                <a href="https://fatorintimo.com" style="color:#fe0050;text-decoration:none;">fatorintimo.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function guideDeliveryText({ name, downloadUrl, guideTitle }: GuideEmailData): string {
  const title = guideTitle || '7 Erros que Fazem Alguém Perder o Interesse';
  return `Seu guia gratuito chegou.

Olá${name ? `, ${name}` : ''},

O seu guia "${title}" está pronto para download.

${downloadUrl ? `Clique aqui para baixar: ${downloadUrl}` : 'Seu link será enviado em breve.'}

— Fator Íntimo
fatorintimo.com`;
}

// ─── Campaign / newsletter email ────────────────────────────────────────────

interface CampaignEmailData {
  subject: string;
  body: string;
  recipientName?: string;
}

export function campaignHtml({ subject, body, recipientName }: CampaignEmailData): string {
  const bodyHtml = body.replace(/\n/g, '<br/>');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
          <tr>
            <td align="center" style="padding:36px 40px 0;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 8px;">
              <h1 style="margin:0;font-size:26px;font-weight:400;color:#dcdcdc;line-height:1.3;">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;"><div style="height:1px;background:rgba(255,255,255,0.06);margin:16px 0;"></div></td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              ${recipientName ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#a0a0a0;">Olá, ${recipientName},</p>` : ''}
              <p style="margin:0;font-size:15px;line-height:1.9;color:#a0a0a0;">${bodyHtml}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:12px;color:#555555;text-align:center;">
                Fator Íntimo · <a href="https://fatorintimo.com" style="color:#fe0050;text-decoration:none;">fatorintimo.com</a><br/>
                <a href="https://fatorintimo.com/unsubscribe" style="color:#444444;text-decoration:none;font-size:11px;">Cancelar inscrição</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function campaignText({ subject, body, recipientName }: CampaignEmailData): string {
  return `${subject}\n\n${recipientName ? `Olá, ${recipientName},\n\n` : ''}${body}\n\n— Fator Íntimo\nfatorintimo.com`;
}
