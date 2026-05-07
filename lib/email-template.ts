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
