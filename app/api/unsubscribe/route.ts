import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeLeadByEmail } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
  }
  // Always responds ok, whether or not the email is actually on the list —
  // otherwise this endpoint could be used to check which addresses exist.
  await unsubscribeLeadByEmail(email.trim());
  return NextResponse.json({ ok: true });
}
