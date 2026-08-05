import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getPosts, upsertPost, getLeads, createNotification } from '@/lib/db';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { newArticleHtml, newArticleText } from '@/lib/email-template';
import { sendAdminAlert } from '@/lib/admin-notifications';
import { v4 as uuid } from 'uuid';

async function verifyAdmin() {
  const session = (await cookies()).get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

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
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    publishedAt: body.publishedAt || new Date().toISOString(),
    readTime: Number(body.readTime) || 5,
    featured: Boolean(body.featured),
  };
  await upsertPost(newPost);

  // A future publishedAt means the post is scheduled: lib/db's getPosts(true)
  // keeps it hidden from every public read until that moment, and none of
  // the "new article" notifications below should fire until it's actually live.
  const isDue = new Date(newPost.publishedAt).getTime() <= Date.now();

  if (isDue) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
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
