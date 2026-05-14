import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getTestimonials, upsertTestimonial } from '@/lib/db';
import type { Testimonial } from '@/lib/types';
import { v4 as uuid } from 'uuid';

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
  const all = await getTestimonials(false);
  return NextResponse.json(
    all.sort((a, b) => new Date(b.submittedAt ?? '').getTime() - new Date(a.submittedAt ?? '').getTime())
  );
}

// Admin-created testimonial: auto-approved, all fields supported.
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const testimonial: Testimonial = {
    id: uuid(),
    name: (body.name || '').trim(),
    role: body.role?.trim() || undefined,
    age: body.age ? Number(body.age) : undefined,
    headline: body.headline?.trim() || undefined,
    content: (body.content || '').trim(),
    transformation: body.transformation?.trim() || undefined,
    rating: body.rating ? Math.max(1, Math.min(5, Number(body.rating))) : 5,
    avatar: body.avatar || undefined,
    productPurchased: body.productPurchased?.trim() || undefined,
    socialHandle: body.socialHandle?.trim() || undefined,
    anonymous: !!body.anonymous,
    featured: !!body.featured,
    status: 'approved',
    submittedAt: new Date().toISOString(),
  };
  if (!testimonial.name || !testimonial.content) {
    return NextResponse.json({ error: 'Nome e conteúdo obrigatórios.' }, { status: 400 });
  }
  await upsertTestimonial(testimonial);
  return NextResponse.json(testimonial, { status: 201 });
}
