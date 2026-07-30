import { NextRequest, NextResponse } from 'next/server';
import { markReferralPaid } from '@/lib/affiliates';
import { requireAdmin } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  if (body.status !== 'paid') {
    return NextResponse.json({ error: 'Apenas marcar como pago é suportado aqui.' }, { status: 400 });
  }
  await markReferralPaid(id);
  return NextResponse.json({ ok: true });
}
