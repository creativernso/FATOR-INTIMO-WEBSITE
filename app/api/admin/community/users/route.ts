import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getAllCommunityUsers, getCommunityUser, upsertCommunityUser } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getAllCommunityUsers());
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { uid, ...data } = await req.json();
  const user = await getCommunityUser(uid);
  if (!user) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  await upsertCommunityUser({ ...user, ...data, uid });
  return NextResponse.json({ ok: true });
}
