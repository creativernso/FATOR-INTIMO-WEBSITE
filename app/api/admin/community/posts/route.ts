import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getCommunityPosts, upsertCommunityPost, deleteCommunityPost, getCommunityPost } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const posts = await getCommunityPosts();
  return NextResponse.json(posts);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  const post = await getCommunityPost(id);
  if (!post) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  await upsertCommunityPost({ ...post, ...data, id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  await deleteCommunityPost(id);
  return NextResponse.json({ ok: true });
}
