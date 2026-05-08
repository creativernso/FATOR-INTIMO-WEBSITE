import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getComments, upsertComment, deleteComment } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try {
    await getAdminAuth().verifySessionCookie(session, true);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const comments = await getComments();
  return NextResponse.json(
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, approved } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  const comments = await getComments();
  const comment = comments.find((c) => c.id === id);
  if (!comment) return NextResponse.json({ error: 'Comentário não encontrado.' }, { status: 404 });
  await upsertComment({ ...comment, approved });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  await deleteComment(id);
  return NextResponse.json({ ok: true });
}
