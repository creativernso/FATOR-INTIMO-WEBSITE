import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getCommunityPosts, upsertCommunityPost, getCommunityUser, upsertCommunityUser, createNotification } from '@/lib/db';
import { CommunityPost } from '@/lib/types';
import { v4 as uuid } from 'uuid';

async function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try { return await getAdminAuth().verifyIdToken(auth.slice(7)); }
  catch { return null; }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') ?? undefined;
  const featured = searchParams.get('featured') === 'true';
  const posts = await getCommunityPosts({ status: 'approved', category, featured: featured || undefined });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const body = await req.json();
  const { title, body: bodyText, category, tags, anonymous } = body;

  if (!title?.trim() || !bodyText?.trim() || !category) {
    return NextResponse.json({ error: 'Título, conteúdo e categoria são obrigatórios.' }, { status: 400 });
  }

  const user = await getCommunityUser(decoded.uid);
  if (!user) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 403 });
  if (user.banned) return NextResponse.json({ error: 'Conta suspensa.' }, { status: 403 });

  const post: CommunityPost = {
    id: uuid(),
    title: title.trim(),
    body: bodyText.trim(),
    category,
    tags: tags ?? [],
    authorUid: decoded.uid,
    authorName: anonymous ? 'Anônimo' : user.name,
    authorAvatar: anonymous ? undefined : user.avatar,
    authorRole: user.role,
    anonymous: !!anonymous,
    status: 'pending',
    createdAt: new Date().toISOString(),
    commentCount: 0,
    reactionCount: 0,
    viewCount: 0,
  };

  await upsertCommunityPost(post);
  await upsertCommunityUser({ ...user, postCount: (user.postCount ?? 0) + 1 });
  await createNotification(
    'community_post',
    'Nova publicação na Comunidade',
    `${post.anonymous ? 'Anônimo' : user.name} publicou "${post.title}".`,
    { title: post.title, category: post.category }
  );

  return NextResponse.json(post, { status: 201 });
}
