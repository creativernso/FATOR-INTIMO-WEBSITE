import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getAdminUser } from '@/lib/db';

const SESSION_COOKIE = 'fi_session';
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });
  }

  try {
    // This Firebase Auth project is shared with the community login, so a
    // valid ID token alone isn't enough — only allowlisted admins (present
    // in the adminUsers collection) may receive a dashboard session.
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const adminUser = await getAdminUser(decoded.uid);
    if (!adminUser) {
      return NextResponse.json({ error: 'Esta conta não tem acesso ao painel administrativo.' }, { status: 403 });
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: FIVE_DAYS_MS / 1000,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[session] createSessionCookie failed:', err);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
