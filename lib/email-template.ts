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
                © Fator Íntimo · fatorintimo.com
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

Fator Íntimo`;
}

// ─── Guide delivery email ───────────────────────────────────────────────────

interface GuideEmailData {
  name?: string;
  downloadUrl?: string;
  guideTitle?: string;
  guideSubtitle?: string;
}

export function guideDeliveryHtml({ name, downloadUrl, guideTitle, guideSubtitle }: GuideEmailData): string {
  const displayName = name || 'você';
  const title = guideTitle || '7 Erros que Fazem Alguém Perder o Interesse';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu guia chegou.</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

          <!-- Accent line -->
          <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>

          <!-- Brand -->
          <tr>
            <td align="center" style="padding:36px 40px 0;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding:28px 40px 8px;">
              <h1 style="margin:0;font-size:28px;font-weight:300;color:#dcdcdc;line-height:1.3;">
                Seu guia chegou.
              </h1>
              ${guideSubtitle ? `<p style="margin:8px 0 0;font-size:14px;color:#666666;font-style:italic;">${guideSubtitle}</p>` : ''}
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
            <td style="padding:0 40px 28px;">
              <p style="margin:0 0 14px;font-size:15px;line-height:1.85;color:#a0a0a0;">
                Olá${name ? `, <strong style="color:#dcdcdc;">${displayName}</strong>` : ''},
              </p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.85;color:#a0a0a0;">
                O seu guia <strong style="color:#dcdcdc;">${title}</strong> está pronto para download.
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.85;color:#a0a0a0;">
                Este material foi criado para quem quer entender, de verdade, o que acontece dentro das relações e dentro de si mesmo.
              </p>

              ${downloadUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}"
                      style="display:inline-block;background:#fe0050;color:#ffffff;text-decoration:none;padding:15px 44px;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                      Baixar Guia Gratuito →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:12px;color:#555555;text-align:center;">
                O link expira em 24 horas. Salve o arquivo após o download.
              </p>` : `
              <p style="margin:0;font-size:14px;color:#a0a0a0;">Seu link de acesso será enviado em breve.</p>`}
            </td>
          </tr>

          <!-- Community CTA -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:rgba(254,0,80,0.04);border:1px solid rgba(254,0,80,0.12);border-radius:12px;padding:22px;">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#fe0050;">Comunidade Íntima</p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#888888;">
                  Junte-se à comunidade onde pessoas reais partilham o que vivem, sentem e aprendem sobre relacionamentos.
                </p>
                <a href="https://fatorintimo.com/comunidade"
                  style="display:inline-block;color:#fe0050;text-decoration:none;font-size:13px;font-weight:500;border:1px solid rgba(254,0,80,0.3);padding:8px 20px;border-radius:50px;">
                  Conhecer a Comunidade →
                </a>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(255,255,255,0.05);"></div>
            </td>
          </tr>

          <!-- Footer links -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 10px;font-size:12px;color:#555555;">Explore também:</p>
              <p style="margin:0 0 6px;font-size:12px;">
                ✦ &nbsp;<a href="https://fatorintimo.com/blog" style="color:#777777;text-decoration:none;">Artigos sobre psicologia das relações</a>
              </p>
              <p style="margin:0 0 6px;font-size:12px;">
                ✦ &nbsp;<a href="https://fatorintimo.com/products" style="color:#777777;text-decoration:none;">Materiais e e-books</a>
              </p>
              <p style="margin:0;font-size:12px;">
                ✦ &nbsp;<a href="https://www.instagram.com/fatorintimo/" style="color:#777777;text-decoration:none;">Instagram @fatorintimo</a>
              </p>
            </td>
          </tr>

          <!-- Footer brand -->
          <tr>
            <td style="padding:20px 40px 36px;border-top:1px solid rgba(255,255,255,0.04);">
              <p style="margin:0;font-size:12px;color:#444444;text-align:center;">
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
  return `Seu guia chegou.

Olá${name ? `, ${name}` : ''},

O seu guia "${title}" está pronto para download.

${downloadUrl ? `Clique aqui para baixar: ${downloadUrl}` : 'Seu link será enviado em breve.'}

Junte-se à Comunidade Íntima: https://fatorintimo.com/comunidade

Explore mais:
- Artigos: https://fatorintimo.com/blog
- Materiais: https://fatorintimo.com/products

Fator Íntimo
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
  return `${subject}\n\n${recipientName ? `Olá, ${recipientName},\n\n` : ''}${body}\n\nFator Íntimo\nfatorintimo.com`;
}

// ─── Community welcome email ─────────────────────────────────────────────────

interface CommunityWelcomeData {
  name?: string;
}

export function communityWelcomeHtml({ name }: CommunityWelcomeData): string {
  const displayName = name || 'você';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo à Comunidade Íntima.</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

          <!-- Accent line -->
          <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>

          <!-- Brand -->
          <tr>
            <td align="center" style="padding:40px 40px 0;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding:28px 40px 8px;">
              <h1 style="margin:0;font-size:30px;font-weight:300;color:#dcdcdc;line-height:1.25;letter-spacing:-0.3px;">
                Você chegou ao lugar certo.
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(255,255,255,0.06);margin:18px 0;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.85;color:#a0a0a0;">
                Olá${name ? `, <strong style="color:#dcdcdc;">${displayName}</strong>` : ''},
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.85;color:#a0a0a0;">
                Seja bem-vindo à <strong style="color:#dcdcdc;">Comunidade Íntima</strong>, um espaço construído para conversas reais sobre relacionamentos, emoções, autoconhecimento e o que ninguém costuma falar em voz alta.
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.85;color:#a0a0a0;">
                Aqui você pode compartilhar o que vive, aprender com quem passou pelo mesmo e crescer com pessoas que estão, como você, em busca de algo mais profundo.
              </p>
            </td>
          </tr>

          <!-- What you can do -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:rgba(254,0,80,0.04);border:1px solid rgba(254,0,80,0.12);border-radius:12px;padding:24px;">
                <p style="margin:0 0 14px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#fe0050;">O que você pode fazer</p>
                <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#a0a0a0;">◦ &nbsp;Publicar discussões em 10 categorias temáticas</p>
                <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#a0a0a0;">◦ &nbsp;Comentar e reagir a publicações da comunidade</p>
                <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#a0a0a0;">◦ &nbsp;Publicar de forma anônima quando quiser</p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#a0a0a0;">◦ &nbsp;Acessar conteúdos exclusivos do Rafael Moreira</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 40px 36px;">
              <a href="https://fatorintimo.com/comunidade"
                style="display:inline-block;background:#fe0050;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px;padding:15px 44px;border-radius:50px;">
                Entrar na Comunidade →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(255,255,255,0.05);"></div>
            </td>
          </tr>

          <!-- Secondary links -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 12px;font-size:13px;color:#666666;">Explore também:</p>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:#666666;">
                ✦ &nbsp;<a href="https://fatorintimo.com/blog" style="color:#a0a0a0;text-decoration:none;">Artigos sobre psicologia das relações</a>
              </p>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:#666666;">
                ✦ &nbsp;<a href="https://fatorintimo.com/products" style="color:#a0a0a0;text-decoration:none;">Materiais e e-books</a>
              </p>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#666666;">
                ✦ &nbsp;<a href="https://www.instagram.com/fatorintimo/" style="color:#a0a0a0;text-decoration:none;">Instagram @fatorintimo</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 36px;border-top:1px solid rgba(255,255,255,0.04);">
              <p style="margin:20px 0 0;font-size:12px;color:#555555;text-align:center;">
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

export function communityWelcomeText({ name }: CommunityWelcomeData): string {
  return `Bem-vindo à Comunidade Íntima.

Olá${name ? `, ${name}` : ''},

Seja bem-vindo à Comunidade Íntima, um espaço para conversas reais sobre relacionamentos, emoções e autoconhecimento.

Aqui você pode compartilhar o que vive, aprender com quem passou pelo mesmo e crescer com pessoas que buscam algo mais profundo.

Acesse a comunidade: https://fatorintimo.com/comunidade

Explore também:
- Artigos: https://fatorintimo.com/blog
- Materiais: https://fatorintimo.com/products
- Instagram: https://www.instagram.com/fatorintimo/

Fator Íntimo
fatorintimo.com`;
}

// ── New article broadcast ─────────────────────────────────────────────────────

interface NewArticleData {
  name?: string;
  articleTitle: string;
  articleExcerpt: string;
  articleUrl: string;
  coverImage?: string;
}

export function newArticleHtml({ name, articleTitle, articleExcerpt, articleUrl, coverImage }: NewArticleData): string {
  const greeting = name ? `Olá, ${name.split(' ')[0]}.` : 'Olá.';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0705;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0705;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#1a1410;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
        <tr><td align="center" style="padding:36px 40px 0;">
          <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
        </td></tr>
        ${coverImage ? `
        <tr><td style="padding:24px 40px 0;">
          <img src="${coverImage}" alt="${articleTitle}" style="width:100%;border-radius:10px;display:block;" />
        </td></tr>` : ''}
        <tr><td style="padding:28px 40px 8px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Novo artigo</p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#f5f0eb;line-height:1.3;">${articleTitle}</h1>
        </td></tr>
        <tr><td style="padding:8px 40px 28px;">
          <p style="margin:0;font-size:14px;color:#a09080;line-height:1.7;font-style:italic;">${articleExcerpt}</p>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 36px;">
          <a href="${articleUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Ler artigo completo</a>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:#605040;">${greeting} Você recebeu este email por fazer parte da lista Fator Íntimo.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function newArticleText({ articleTitle, articleExcerpt, articleUrl }: NewArticleData): string {
  return `Novo artigo: ${articleTitle}

${articleExcerpt}

Leia agora: ${articleUrl}

Fator Íntimo
fatorintimo.com`;
}

// ── New product broadcast ─────────────────────────────────────────────────────

interface NewProductData {
  name?: string;
  productTitle: string;
  productHook?: string;
  productPrice: number;
  originalPrice?: number;
  productUrl: string;
  coverImage?: string;
}

export function newProductHtml({ name, productTitle, productHook, productPrice, originalPrice, productUrl, coverImage }: NewProductData): string {
  const greeting = name ? `Olá, ${name.split(' ')[0]}.` : 'Olá.';
  const discount = originalPrice && originalPrice > productPrice
    ? `<span style="text-decoration:line-through;color:#666;font-size:13px;margin-right:8px;">R$ ${originalPrice}</span>`
    : '';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0705;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0705;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#1a1410;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
        <tr><td align="center" style="padding:36px 40px 0;">
          <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
        </td></tr>
        ${coverImage ? `
        <tr><td style="padding:24px 40px 0;">
          <img src="${coverImage}" alt="${productTitle}" style="width:100%;border-radius:10px;display:block;" />
        </td></tr>` : ''}
        <tr><td style="padding:28px 40px 8px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Novo material disponível</p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#f5f0eb;line-height:1.3;">${productTitle}</h1>
          ${productHook ? `<p style="margin:8px 0 0;font-size:14px;color:#a09080;font-style:italic;">"${productHook}"</p>` : ''}
        </td></tr>
        <tr><td style="padding:20px 40px 0;">
          <p style="margin:0;font-size:18px;color:#f5f0eb;">${discount}<strong>R$ ${productPrice}</strong></p>
        </td></tr>
        <tr><td align="center" style="padding:28px 40px 36px;">
          <a href="${productUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Ver detalhes →</a>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:12px;color:#605040;">${greeting} Você recebeu este email por fazer parte da lista Fator Íntimo.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function newProductText({ productTitle, productHook, productPrice, productUrl }: NewProductData): string {
  return `Novo material: ${productTitle}
${productHook ? `\n"${productHook}"\n` : ''}
Preço: R$ ${productPrice}

Ver detalhes: ${productUrl}

Fator Íntimo
fatorintimo.com`;
}

// ── New guide broadcast ──────────────────────────────────────────────────────

interface NewGuideData {
  name?: string;
  guideTitle: string;
  guideDescription: string;
  guideUrl: string;
  coverImage?: string;
}

export function newGuideHtml({ name, guideTitle, guideDescription, guideUrl, coverImage }: NewGuideData): string {
  const greeting = name ? `Olá, ${name.split(' ')[0]}.` : 'Olá.';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0705;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0705;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#1a1410;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
        <tr><td align="center" style="padding:36px 40px 0;">
          <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
        </td></tr>
        ${coverImage ? `
        <tr><td style="padding:24px 40px 0;">
          <img src="${coverImage}" alt="${guideTitle}" style="width:100%;border-radius:10px;display:block;" />
        </td></tr>` : ''}
        <tr><td style="padding:28px 40px 8px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Novo guia gratuito</p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#f5f0eb;line-height:1.3;">${guideTitle}</h1>
        </td></tr>
        <tr><td style="padding:8px 40px 24px;">
          <p style="margin:0;font-size:14px;color:#a09080;line-height:1.7;">${guideDescription}</p>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 36px;">
          <a href="${guideUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Baixar grátis →</a>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:12px;color:#605040;">${greeting} Você recebeu este email por fazer parte da lista Fator Íntimo.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function newGuideText({ guideTitle, guideDescription, guideUrl }: NewGuideData): string {
  return `Novo guia gratuito: ${guideTitle}

${guideDescription}

Baixar: ${guideUrl}

Fator Íntimo
fatorintimo.com`;
}

// ── Community: post approved ─────────────────────────────────────────────────

interface CommunityPostApprovedData {
  authorName: string;
  postTitle: string;
  postUrl: string;
}

export function communityPostApprovedHtml({ authorName, postTitle, postUrl }: CommunityPostApprovedData): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0705;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0705;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1a1410;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
        <tr><td align="center" style="padding:36px 40px 0;">
          <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">COMUNIDADE ÍNTIMA</p>
        </td></tr>
        <tr><td style="padding:28px 40px 8px;">
          <h1 style="margin:0;font-size:24px;font-weight:300;color:#f5f0eb;line-height:1.3;">Sua publicação foi aprovada! 🎉</h1>
        </td></tr>
        <tr><td style="padding:12px 40px 24px;">
          <p style="margin:0 0 14px;font-size:14px;color:#a09080;line-height:1.7;">Olá, <strong style="color:#f5f0eb;">${authorName.split(' ')[0]}</strong>,</p>
          <p style="margin:0;font-size:14px;color:#a09080;line-height:1.7;">Sua publicação <strong style="color:#f5f0eb;">"${postTitle}"</strong> acaba de ser publicada na Comunidade Íntima. Outros membros já podem ler, comentar e reagir.</p>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 36px;">
          <a href="${postUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:13px 28px;border-radius:50px;font-size:13px;font-weight:600;">Ver minha publicação →</a>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:11px;color:#605040;">Você recebeu este email porque participa da Comunidade Íntima.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function communityPostApprovedText({ authorName, postTitle, postUrl }: CommunityPostApprovedData): string {
  return `Sua publicação foi aprovada!

Olá, ${authorName.split(' ')[0]},

Sua publicação "${postTitle}" acaba de ser publicada na Comunidade Íntima.

Acessar: ${postUrl}

Fator Íntimo`;
}

// ── Community: someone commented on your post ────────────────────────────────

// ── Review request after purchase ─────────────────────────────────────────────

interface ReviewRequestData {
  name?: string;
  productTitle: string;
  productUrl: string;
}

export function reviewRequestHtml({ name, productTitle, productUrl }: ReviewRequestData): string {
  const firstName = name?.split(' ')[0] || '';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0705;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0705;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#1a1410;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
        <tr><td align="center" style="padding:36px 40px 0;">
          <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">FATOR ÍNTIMO</p>
        </td></tr>
        <tr><td style="padding:28px 40px 8px;">
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#f5f0eb;line-height:1.3;">Como foi sua experiência${firstName ? `, ${firstName}` : ''}?</h1>
        </td></tr>
        <tr><td style="padding:8px 40px 24px;">
          <p style="margin:0 0 14px;font-size:14px;color:#a09080;line-height:1.7;">
            Espero que <strong style="color:#f5f0eb;">${productTitle}</strong> esteja tocando algo dentro de você.
          </p>
          <p style="margin:0;font-size:14px;color:#a09080;line-height:1.7;">
            Sua avaliação ajuda outras pessoas a encontrarem o caminho que você acabou de começar. Demora menos de um minuto e faz toda a diferença.
          </p>
        </td></tr>
        <tr><td style="padding:0 40px;text-align:center;">
          <table align="center" cellpadding="0" cellspacing="0">
            <tr>
              ${[1,2,3,4,5].map(() => `<td style="padding:0 4px;color:#fe0050;font-size:30px;">★</td>`).join('')}
            </tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:24px 40px 36px;">
          <a href="${productUrl}#avaliacoes" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Deixar minha avaliação →</a>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:12px;color:#605040;">Obrigado por confiar no Fator Íntimo. Sua voz aqui é o que sustenta o projeto.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function reviewRequestText({ name, productTitle, productUrl }: ReviewRequestData): string {
  const firstName = name?.split(' ')[0] || '';
  return `Como foi sua experiência${firstName ? `, ${firstName}` : ''}?

Espero que "${productTitle}" esteja tocando algo dentro de você.

Sua avaliação ajuda outras pessoas a encontrarem o caminho que você acabou de começar. Demora menos de um minuto e faz toda a diferença.

Deixar avaliação: ${productUrl}

Fator Íntimo`;
}

interface CommunityNewCommentData {
  authorName: string;
  postTitle: string;
  commenterName: string;
  commentExcerpt: string;
  postUrl: string;
}

export function communityNewCommentHtml({ authorName, postTitle, commenterName, commentExcerpt, postUrl }: CommunityNewCommentData): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0705;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0705;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1a1410;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="height:1px;background:linear-gradient(to right,transparent,#fe0050,transparent);"></td></tr>
        <tr><td align="center" style="padding:36px 40px 0;">
          <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#fe0050;">COMUNIDADE ÍNTIMA</p>
        </td></tr>
        <tr><td style="padding:28px 40px 8px;">
          <h1 style="margin:0;font-size:22px;font-weight:300;color:#f5f0eb;line-height:1.3;">${commenterName} comentou na sua publicação</h1>
        </td></tr>
        <tr><td style="padding:12px 40px 8px;">
          <p style="margin:0 0 8px;font-size:13px;color:#888;">Em "${postTitle}":</p>
          <div style="background:rgba(255,255,255,0.04);border-left:2px solid #fe0050;padding:14px 16px;border-radius:6px;">
            <p style="margin:0;font-size:14px;color:#d0c0b0;line-height:1.7;font-style:italic;">"${commentExcerpt.slice(0, 240)}${commentExcerpt.length > 240 ? '...' : ''}"</p>
          </div>
        </td></tr>
        <tr><td align="center" style="padding:24px 40px 36px;">
          <a href="${postUrl}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:13px 28px;border-radius:50px;font-size:13px;font-weight:600;">Responder →</a>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:11px;color:#605040;">Olá ${authorName.split(' ')[0]}, você recebeu este email porque é o autor da publicação.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function communityNewCommentText({ authorName, postTitle, commenterName, commentExcerpt, postUrl }: CommunityNewCommentData): string {
  return `${commenterName} comentou na sua publicação

Olá ${authorName.split(' ')[0]},

Em "${postTitle}":
"${commentExcerpt.slice(0, 240)}"

Responder: ${postUrl}

Fator Íntimo`;
}
