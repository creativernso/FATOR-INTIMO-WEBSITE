import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

async function assertAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) throw new Error('Unauthorized');
  await getAdminAuth().verifySessionCookie(session, true);
}

interface SessionSummary {
  visitorId: string;
  lastMessage: string;
  lastAt: string;
  online: boolean;
  lastSeen: string;
  unreadFromVisitor: number;
}

export async function GET() {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    // lastMessage/lastAt/unreadFromVisitor are denormalized onto the session
    // doc by /api/chat/send, so this is a single collection read — no more
    // per-session message subquery (that used to run once per visitor, every
    // few seconds, for every session including ones with zero messages).
    const sessionsSnap = await db.collection('chatSessions').get();

    const summaries: SessionSummary[] = [];

    for (const sessionDoc of sessionsSnap.docs) {
      const visitorId = sessionDoc.id;
      const data = sessionDoc.data() || {};
      if (!data.lastAt) continue;

      const lastSeenTs = data.lastSeen;
      const lastSeen = lastSeenTs && typeof lastSeenTs.toDate === 'function'
        ? lastSeenTs.toDate().toISOString()
        : '';
      const lastAtTs = data.lastAt;
      const lastAt = lastAtTs && typeof lastAtTs.toDate === 'function'
        ? lastAtTs.toDate().toISOString()
        : new Date().toISOString();

      summaries.push({
        visitorId,
        lastMessage: (data.lastMessage as string) || '',
        lastAt,
        online: !!data.online && lastSeen ? (Date.now() - new Date(lastSeen).getTime() < 3 * 60 * 1000) : false,
        lastSeen,
        unreadFromVisitor: (data.unreadFromVisitor as number) || 0,
      });
    }

    summaries.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
    return NextResponse.json({ sessions: summaries });
  } catch (err) {
    console.error('[admin/chat/sessions] error:', err);
    return NextResponse.json({ sessions: [] });
  }
}
