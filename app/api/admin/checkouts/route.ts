import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getAbandonedCheckouts, getOrders } from '@/lib/orders';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try {
    await getAdminAuth().verifySessionCookie(session, true);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [checkouts, orders] = await Promise.all([getAbandonedCheckouts(), getOrders()]);

  // A checkout counts as "recovered" if the same customer later completed
  // an order for the same product (via a fresh session — Stripe sessions
  // can't be un-expired, so any completion necessarily comes from a new one).
  const enriched = checkouts.map((c) => ({
    ...c,
    recovered: orders.some(
      (o) =>
        o.customerEmail === c.customerEmail &&
        o.productId === c.productId &&
        new Date(o.createdAt).getTime() >= new Date(c.createdAt).getTime(),
    ),
  }));

  return NextResponse.json(enriched);
}
