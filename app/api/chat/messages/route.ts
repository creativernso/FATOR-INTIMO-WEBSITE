import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get('visitorId');
  if (!visitorId) return NextResponse.json({ messages: [] });
  try {
    const db = getAdminDb();
    const snap = await db
      .collection('chatSessions')
      .doc(visitorId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(200)
      .get();
    const messages = snap.docs.map((d) => {
      const data = d.data();
      const ts = data.createdAt;
      let iso = new Date().toISOString();
      if (ts && typeof ts.toDate === 'function') iso = ts.toDate().toISOString();
      return {
        id: d.id,
        text: data.text as string,
        from: data.from as 'visitor' | 'admin',
        createdAt: iso,
      };
    });
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[chat/messages] error:', err);
    return NextResponse.json({ messages: [] });
  }
}
