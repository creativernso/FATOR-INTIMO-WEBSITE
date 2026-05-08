import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getCommunityComments, upsertCommunityComment, getCommunityUser, getCommunityPost, incrementCommunityPostStat } from '@/lib/db';
import { CommunityComment } from '@/lib/types';
import { v4 as uuid } from 'uuid';

async function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try { return await getAdminAuth().verifyIdToken(auth.slice(7)); }
  catch { return null; }
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const comments = await getCommunityComments(id);
  return NextResponse.json(comments.filter((c) => c.status === 'approved'));
}

export async function POST(req: NextRequest, { params }: Params) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { id: postId } = await params;
  const post = await getCommunityPost(postId);
  if (!post || post.status !== 'approved') return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 });

  const { content, anonymous } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Conteúdo obrigatório.' }, { status: 400 });

  const user = await getCommunityUser(decoded.uid);
  if (!user) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 403 });
  if (user.banned) return NextResponse.json({ error: 'Conta suspensa.' }, { status: 403 });

  const comment: CommunityComment = {
    id: uuid(),
    postId,
    authorUid: decoded.uid,
    authorName: anonymous ? 'Anônimo' : user.name,
    authorAvatar: anonymous ? undefined : user.avatar,
    authorRole: user.role,
    anonymous: !!anonymous,
    content: content.trim(),
    status: 'approved',
    createdAt: new Date().toISOString(),
  };

  await upsertCommunityComment(comment);
  await incrementCommunityPostStat(postId, 'commentCount', 1);

  return NextResponse.json(comment, { status: 201 });
}
