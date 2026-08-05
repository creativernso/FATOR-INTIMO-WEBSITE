import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// POST /api/reviews/[id]/helpful, increments helpfulCount atomically.
// Client-side localStorage prevents double-clicks per visitor (good enough for
// social proof; not anti-fraud).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const allowed = await checkRateLimit(`review_helpful:${getClientIp(req)}`, 30, 300);
  if (!allowed) return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    const db = getAdminDb();
    await db.collection('testimonials').doc(id).update({
      helpfulCount: FieldValue.increment(1),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
