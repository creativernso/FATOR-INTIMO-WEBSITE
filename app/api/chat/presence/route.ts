import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { visitorId, online } = await req.json();
    if (!visitorId) return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
    const db = getAdminDb();
    await db.collection('chatSessions').doc(visitorId).set(
      {
        visitorId,
        online: !!online,
        lastSeen: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
