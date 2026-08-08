import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getExchangeRates, saveExchangeRates } from '@/lib/db';

async function verifyAdmin() {
  const session = (await cookies()).get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rates = await getExchangeRates();
  return NextResponse.json(rates);
}

export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { brlPerUsd, brlPerEur } = await req.json();
  if (typeof brlPerUsd !== 'number' || typeof brlPerEur !== 'number' || brlPerUsd <= 0 || brlPerEur <= 0) {
    return NextResponse.json({ error: 'Taxas inválidas.' }, { status: 400 });
  }
  await saveExchangeRates({ brlPerUsd, brlPerEur });
  return NextResponse.json({ brlPerUsd, brlPerEur });
}
