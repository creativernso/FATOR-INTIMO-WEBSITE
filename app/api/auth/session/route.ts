import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

const SESSION_COOKIE = 'fi_session';
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });
  }

  try {
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
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
