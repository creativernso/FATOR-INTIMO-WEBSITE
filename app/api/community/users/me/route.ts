import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getCommunityUser, upsertCommunityUser, createNotification } from '@/lib/db';
import { CommunityUser } from '@/lib/types';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { communityWelcomeHtml, communityWelcomeText } from '@/lib/email-template';

async function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try { return await getAdminAuth().verifyIdToken(auth.slice(7)); }
  catch { return null; }
}

export async function GET(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const user = await getCommunityUser(decoded.uid);
  return NextResponse.json(user ?? null);
}

export async function POST(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const existing = await getCommunityUser(decoded.uid);
  if (existing) return NextResponse.json(existing);

  const body = await req.json();
  const userEmail: string | undefined = decoded.email ?? undefined;

  const user: CommunityUser = {
    uid: decoded.uid,
    name: body.name ?? decoded.name ?? 'Participante',
    email: userEmail,
    bio: '',
    avatar: decoded.picture ?? '',
    role: 'user',
    joinedAt: new Date().toISOString(),
    postCount: 0,
  };

  await upsertCommunityUser(user);
  await createNotification(
    'community_join',
    'Novo membro na Comunidade',
    `${user.name} entrou na Comunidade Íntima.`,
    { name: user.name }
  );

  if (resend && userEmail) {
    resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Bem-vindo à Comunidade Íntima.',
      html: communityWelcomeHtml({ name: user.name }),
      text: communityWelcomeText({ name: user.name }),
    }).catch(() => {/* non-fatal */});
  }

  return NextResponse.json(user, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const user = await getCommunityUser(decoded.uid);
  if (!user) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });

  const { name, bio, avatar } = await req.json();
  const updated: CommunityUser = {
    ...user,
    ...(name ? { name: name.trim() } : {}),
    ...(bio !== undefined ? { bio: bio.trim() } : {}),
    ...(avatar !== undefined ? { avatar } : {}),
  };

  await upsertCommunityUser(updated);
  return NextResponse.json(updated);
}
