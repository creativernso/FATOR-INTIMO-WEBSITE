import { cookies } from 'next/headers';
import { getAdminAuth } from './firebase-admin';
import { getAdminUser } from './db';
import type { AdminUser, AdminRole } from './types';

const SESSION_COOKIE = 'fi_session';

/** Resolves the current request's admin, or null if not signed in / not an allowlisted admin. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    return await getAdminUser(decoded.uid);
  } catch {
    return null;
  }
}

/** Same as getCurrentAdmin, but also enforces the caller's role is in allowedRoles when given. */
export async function requireAdmin(allowedRoles?: AdminRole[]): Promise<AdminUser | null> {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  if (allowedRoles && !allowedRoles.includes(admin.role)) return null;
  return admin;
}
