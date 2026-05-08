import { NextRequest, NextResponse } from 'next/server';
import { getPosts, upsertPost, deletePost } from '@/lib/db';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const posts = await getPosts();
  const existing = posts.find((p) => p.id === id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = {
    ...existing,
    ...body,
    id,
    slug: slugify(body.slug || existing.slug),
  };
  await upsertPost(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const posts = await getPosts();
  if (!posts.find((p) => p.id === id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deletePost(id);
  return NextResponse.json({ success: true });
}
