import { NextRequest, NextResponse } from 'next/server';
import { getCartRecoverySettings, saveCartRecoverySettings } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await requireAdmin(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getCartRecoverySettings());
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await saveCartRecoverySettings(body);
  return NextResponse.json(await getCartRecoverySettings());
}
