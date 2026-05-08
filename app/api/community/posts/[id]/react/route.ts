import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { toggleCommunityPostReaction, getCommunityPost } from '@/lib/db';

async function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try { return await getAdminAuth().verifyIdToken(auth.slice(7)); }
  catch { return null; }
}

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id } = await params;
  const post = await getCommunityPost(id);
  if (!post || post.status !== 'approved') return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 });

  const result = await toggleCommunityPostReaction(id, decoded.uid);
  const updated = await getCommunityPost(id);
  return NextResponse.json({ action: result, reactionCount: updated?.reactionCount ?? 0 });
}
