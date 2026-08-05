import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getPosts, upsertPost, deletePost } from '@/lib/db';

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

// The dynamic param is named `slug` for Next.js routing consistency, but the
// admin dashboard passes a post id here. We look up by id first, then by slug.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug: idOrSlug } = await params;
  const posts = await getPosts();
  const existing = posts.find((p) => p.id === idOrSlug) || posts.find((p) => p.slug === idOrSlug);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deletePost(existing.id);
  return NextResponse.json({ success: true });
}
