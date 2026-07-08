import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getLiveOverview } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await getAdminAuth().verifySessionCookie(session, true);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const overview = await getLiveOverview();
  return NextResponse.json(overview);
}
