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
    const sessionsSnap = await db.collection('chatSessions').get();

    const summaries: SessionSummary[] = [];

    for (const sessionDoc of sessionsSnap.docs) {
      const visitorId = sessionDoc.id;
      const data = sessionDoc.data() || {};
      const lastSeenTs = data.lastSeen;
      const lastSeen = lastSeenTs && typeof lastSeenTs.toDate === 'function'
        ? lastSeenTs.toDate().toISOString()
        : '';

      // Fetch the most recent message and any unread (admin-side) visitor messages
      const msgsSnap = await db
        .collection('chatSessions')
        .doc(visitorId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      if (msgsSnap.empty) continue;

      const latest = msgsSnap.docs[0].data();
      const latestTs = latest.createdAt;
      const lastAt = latestTs && typeof latestTs.toDate === 'function'
        ? latestTs.toDate().toISOString()
        : new Date().toISOString();

      // Count consecutive visitor messages at the end (i.e. visitor messages
      // after the last admin reply) as "unread from visitor"
      let unreadFromVisitor = 0;
      for (const d of msgsSnap.docs) {
        const m = d.data();
        if (m.from === 'admin') break;
        if (m.from === 'visitor') unreadFromVisitor++;
      }

      summaries.push({
        visitorId,
        lastMessage: latest.text as string,
        lastAt,
        online: !!data.online && lastSeen ? (Date.now() - new Date(lastSeen).getTime() < 3 * 60 * 1000) : false,
        lastSeen,
        unreadFromVisitor,
      });
    }

    summaries.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
    return NextResponse.json({ sessions: summaries });
  } catch (err) {
    console.error('[admin/chat/sessions] error:', err);
    return NextResponse.json({ sessions: [] });
  }
}
