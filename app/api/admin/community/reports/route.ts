import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getCommunityReports, upsertCommunityReport } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getCommunityReports());
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, status } = await req.json();
  const reports = await getCommunityReports();
  const report = reports.find((r) => r.id === id);
  if (!report) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  await upsertCommunityReport({ ...report, status });
  return NextResponse.json({ ok: true });
}
