import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getCommunityPost, upsertCommunityPost, deleteCommunityPost, incrementCommunityPostStat } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const post = await getCommunityPost(id);
  if (!post) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  if (post.status !== 'approved') return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  // increment view count
  await incrementCommunityPostStat(id, 'viewCount', 1);
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const post = await getCommunityPost(id);
  if (!post) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  const data = await req.json();
  await upsertCommunityPost({ ...post, ...data, id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await deleteCommunityPost(id);
  return NextResponse.json({ ok: true });
}
