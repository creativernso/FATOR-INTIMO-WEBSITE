import { NextRequest, NextResponse } from 'next/server';
import { getComments, upsertComment, createNotification } from '@/lib/db';
import { alertNewComment } from '@/lib/admin-notifications';
import { v4 as uuid } from 'uuid';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await getComments(slug);
  const approved = all
    .filter((c) => c.approved)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(approved);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { name, email, content } = await req.json();

  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Nome e comentário obrigatórios.' }, { status: 400 });
  }
  if (content.trim().length < 3) {
    return NextResponse.json({ error: 'Comentário muito curto.' }, { status: 400 });
  }

  await upsertComment({
    id: uuid(),
    postSlug: slug,
    name: name.trim(),
    email: email?.trim() || undefined,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    approved: false,
  });

  await createNotification(
    'comment',
    'Novo comentário no blog',
    `${name.trim()} comentou no artigo "${slug}".`,
    { name: name.trim(), slug }
  );
  alertNewComment(slug, name.trim());

  return NextResponse.json({ ok: true });
}
