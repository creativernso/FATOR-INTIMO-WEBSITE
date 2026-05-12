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

// The dynamic param is named `slug` for Next.js routing consistency, but the
// admin dashboard passes a post id here. We look up by id first, then by slug.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: idOrSlug } = await params;
  const body = await req.json();
  const posts = await getPosts();
  const existing = posts.find((p) => p.id === idOrSlug) || posts.find((p) => p.slug === idOrSlug);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = {
    ...existing,
    ...body,
    id: existing.id,
    slug: slugify(body.slug || existing.slug),
  };
  await upsertPost(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: idOrSlug } = await params;
  const posts = await getPosts();
  const existing = posts.find((p) => p.id === idOrSlug) || posts.find((p) => p.slug === idOrSlug);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deletePost(existing.id);
  return NextResponse.json({ success: true });
}
