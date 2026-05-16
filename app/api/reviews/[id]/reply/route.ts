import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getTestimonials, upsertTestimonial } from '@/lib/db';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

// POST /api/reviews/[id]/reply, admin replies to a review.
// Body: { text }, empty string removes the reply.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { text } = await req.json();
  const all = await getTestimonials(false);
  const existing = all.find((t) => t.id === id);
  if (!existing) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });

  const adminReply = text?.trim()
    ? { text: text.trim().slice(0, 1000), repliedAt: new Date().toISOString() }
    : undefined;

  await upsertTestimonial({ ...existing, adminReply });
  return NextResponse.json({ ok: true });
}
