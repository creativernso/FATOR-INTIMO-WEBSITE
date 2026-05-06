import { NextRequest, NextResponse } from 'next/server';
import { getPosts, savePosts } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(getPosts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const posts = getPosts();
  const newPost = {
    id: uuid(),
    title: body.title || '',
    slug: body.slug || body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || uuid(),
    excerpt: body.excerpt || '',
    content: body.content || '',
    category: body.category || 'Geral',
    coverImage: body.coverImage || 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&q=80',
    publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
    readTime: Number(body.readTime) || 5,
    featured: Boolean(body.featured),
  };
  posts.push(newPost);
  savePosts(posts);
  return NextResponse.json(newPost, { status: 201 });
}
