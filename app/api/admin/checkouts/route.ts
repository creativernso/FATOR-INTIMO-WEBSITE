import { NextResponse } from 'next/server';
import { getAbandonedCheckouts, getOrders } from '@/lib/orders';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!(await requireAdmin(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
