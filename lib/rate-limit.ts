import type { NextRequest } from 'next/server';
import { getAdminDb } from './firebase-admin';

// No Redis/KV is provisioned for this project, so rate limiting is backed by
// Firestore instead — a transaction per check keeps it correct under
// concurrent requests, at the cost of one extra read+write per protected
// call. Fine at this site's traffic; would need a real store (Upstash/KV)
// if that ever becomes the bottleneck.
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const db = getAdminDb();
  const ref = db.collection('rateLimits').doc(key);
  const now = Date.now();

  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? (snap.data() as { count: number; windowStart: number }) : null;

      if (!data || now - data.windowStart > windowSeconds * 1000) {
        tx.set(ref, { count: 1, windowStart: now });
        return true;
      }
      if (data.count >= limit) return false;
      tx.update(ref, { count: data.count + 1 });
      return true;
    });
  } catch (err) {
    // Never let a rate-limit infra hiccup block a legitimate request.
    console.error('[rate-limit] check failed, allowing request:', err);
    return true;
  }
}

// Best-effort client IP from Vercel's forwarded header. Not spoof-proof
// (a client could set x-forwarded-for on a direct request), but Vercel's
// edge overwrites this header with the real chain, so it's trustworthy for
// requests actually routed through Vercel — good enough for abuse-throttling,
// not for anything security-critical like auth decisions.
export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
