import { NextRequest, NextResponse } from 'next/server';
import { getPosts, upsertPost } from '@/lib/db';
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
  return NextResponse.json(newPost, { status: 201 });
}
