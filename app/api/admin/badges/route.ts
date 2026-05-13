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

export async function GET() {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const [testimonialsSnap, communityPostsSnap, commentsSnap, leadsSnap, chatSessionsSnap] =
      await Promise.all([
        db.collection('testimonials').where('status', '==', 'pending').count().get(),
        db.collection('community_posts').where('status', '==', 'pending').count().get(),
        db.collection('comments').where('approved', '==', false).count().get(),
        db.collection('leads').where('createdAt', '>=', since48h).count().get(),
        db.collection('chatSessions').count().get(),
      ]);

    return NextResponse.json({
      testimonials: testimonialsSnap.data().count,
      comunidade: communityPostsSnap.data().count,
      comments: commentsSnap.data().count,
      leads: leadsSnap.data().count,
      chat: chatSessionsSnap.data().count,
    });
  } catch (err) {
    console.error('[admin/badges] error:', err);
    return NextResponse.json({ testimonials: 0, comunidade: 0, comments: 0, leads: 0, chat: 0 });
  }
}
