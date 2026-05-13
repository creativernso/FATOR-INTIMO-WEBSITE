import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getChatSettings } from '@/lib/db';
import { alertNewChatMessage } from '@/lib/admin-notifications';

export async function POST(req: NextRequest) {
  try {
    const { visitorId, text, from } = await req.json();
    if (!visitorId || !text || typeof visitorId !== 'string' || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const cleanText = text.trim().slice(0, 2000);
    if (!cleanText) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

    const sender = from === 'admin' ? 'admin' : 'visitor';
    const db = getAdminDb();

    // Touch the parent session doc (presence + last activity)
    await db.collection('chatSessions').doc(visitorId).set(
      {
        visitorId,
        online: sender === 'visitor' ? true : undefined,
        lastSeen: FieldValue.serverTimestamp(),
        lastMessage: cleanText,
        lastAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Write the message
    const ref = await db.collection('chatSessions').doc(visitorId).collection('messages').add({
      text: cleanText,
      from: sender,
      createdAt: FieldValue.serverTimestamp(),
      visitorId,
    });

    // Email the admin (throttled to 1 alert per visitor per 10 min)
    if (sender === 'visitor') {
      alertNewChatMessage(visitorId, cleanText);
    }

    // If this is the first visitor message, fire auto-welcome
    if (sender === 'visitor') {
      const msgsSnap = await db
        .collection('chatSessions')
        .doc(visitorId)
        .collection('messages')
        .where('from', '==', 'visitor')
        .limit(2)
        .get();
      if (msgsSnap.size === 1) {
        const settings = await getChatSettings();
        // Wait briefly so it feels human, then write the welcome
        setTimeout(async () => {
          try {
            await db.collection('chatSessions').doc(visitorId).collection('messages').add({
              text: settings.welcomeMessage,
              from: 'admin',
              createdAt: FieldValue.serverTimestamp(),
              visitorId,
              auto: true,
            });
          } catch {}
        }, 1500);
      }
    }

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error('[chat/send] error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
