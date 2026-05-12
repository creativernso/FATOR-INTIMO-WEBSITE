import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getEmailAutomations, upsertEmailAutomation, deleteEmailAutomation } from '@/lib/db';
import { EmailAutomation } from '@/lib/types';
import { v4 as uuid } from 'uuid';

async function assertAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) throw new Error('Unauthorized');
  await getAdminAuth().verifySessionCookie(session, true);
}

export async function GET() {
  try { await assertAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  return NextResponse.json(await getEmailAutomations());
}

export async function POST(req: NextRequest) {
  try { await assertAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const body = await req.json();
  const automation: EmailAutomation = {
    id: body.id || uuid(),
    name: body.name || '',
    trigger: body.trigger || 'signup',
    delayDays: Number(body.delayDays) || 0,
    subject: body.subject || '',
    body: body.body || '',
    active: body.active !== false,
    totalSent: body.totalSent || 0,
    lastRunAt: body.lastRunAt,
    createdAt: body.createdAt || new Date().toISOString(),
  };
  await upsertEmailAutomation(automation);
  return NextResponse.json(automation);
}

export async function DELETE(req: NextRequest) {
  try { await assertAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await req.json();
  if (id) await deleteEmailAutomation(id);
  return NextResponse.json({ ok: true });
}
