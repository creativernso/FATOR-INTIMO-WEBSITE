import { NextRequest, NextResponse } from 'next/server';
import { getPosts, upsertPost, getLeads, createNotification } from '@/lib/db';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { newArticleHtml, newArticleText } from '@/lib/email-template';
import { sendAdminAlert } from '@/lib/admin-notifications';
import { v4 as uuid } from 'uuid';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  return NextResponse.json(await getPosts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawSlug = body.slug || body.title || uuid();
  const newPost = {
    id: uuid(),
    title: body.title || '',
    slug: slugify(rawSlug),
    excerpt: body.excerpt || '',
    content: body.content || '',
    category: body.category || 'Geral',
    coverImage: body.coverImage || 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&q=80',
    publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
    readTime: Number(body.readTime) || 5,
    featured: Boolean(body.featured),
  };
  await upsertPost(newPost);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
  const articleUrl = `${baseUrl}/blog/${newPost.slug}`;

  // Admin dashboard notification
  await createNotification(
    'comment',
    'Novo artigo publicado',
    `"${newPost.title}" foi publicado.`,
    { slug: newPost.slug, category: newPost.category },
  );

  // Admin email alert (fire and forget)
  sendAdminAlert({
    subject: `Novo artigo publicado: ${newPost.title}`,
    title: `Novo artigo: ${newPost.title}`,
    body: newPost.excerpt || 'Um novo artigo foi publicado no blog.',
    ctaLabel: 'Ver artigo',
    ctaUrl: articleUrl,
    meta: { Categoria: newPost.category, 'Leitura': `${newPost.readTime}min` },
  });

  // Broadcast to email subscribers (fire and forget)
  if (resend && body.broadcastToSubscribers !== false) {
    broadcastArticle(newPost.title, newPost.excerpt, articleUrl, newPost.coverImage);
  }

  return NextResponse.json(newPost, { status: 201 });
}

async function broadcastArticle(title: string, excerpt: string, url: string, coverImage?: string) {
  if (!resend) return;
  try {
    const leads = await getLeads();
    const emailLeads = leads.filter((l) => l.email);
    if (emailLeads.length === 0) return;

    // Batch in chunks of 50 to avoid rate limits
    const chunks: typeof emailLeads[] = [];
    for (let i = 0; i < emailLeads.length; i += 50) {
      chunks.push(emailLeads.slice(i, i + 50));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map((lead) =>
          resend!.emails.send({
            from: FROM_EMAIL,
            to: lead.email!,
            subject: `Novo artigo: ${title}`,
            html: newArticleHtml({ name: lead.name, articleTitle: title, articleExcerpt: excerpt, articleUrl: url, coverImage }),
            text: newArticleText({ articleTitle: title, articleExcerpt: excerpt, articleUrl: url }),
          }),
        ),
      );
    }
  } catch (err) {
    console.error('[broadcast] article email failed:', err);
  }
}
