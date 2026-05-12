import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getChatSettings, saveChatSettings } from '@/lib/db';
import { ChatSettings } from '@/lib/types';

async function assertAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) throw new Error('Unauthorized');
  await getAdminAuth().verifySessionCookie(session, true);
}

export async function GET() {
  try { await assertAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  return NextResponse.json(await getChatSettings());
}

export async function POST(req: NextRequest) {
  try { await assertAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const body = await req.json() as Partial<ChatSettings>;
  const current = await getChatSettings();
  const updated: ChatSettings = {
    welcomeMessage: body.welcomeMessage ?? current.welcomeMessage,
    offlineMessage: body.offlineMessage ?? current.offlineMessage,
    quickReplies: Array.isArray(body.quickReplies) ? body.quickReplies : current.quickReplies,
  };
  await saveChatSettings(updated);
  return NextResponse.json(updated);
}
