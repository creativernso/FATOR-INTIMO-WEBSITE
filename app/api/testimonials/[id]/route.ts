import { NextRequest, NextResponse } from 'next/server';
import { getTestimonials, upsertTestimonial, deleteTestimonial } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const testimonials = await getTestimonials();
  const existing = testimonials.find((t) => t.id === id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = { ...existing, ...body, id };
  await upsertTestimonial(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testimonials = await getTestimonials();
  if (!testimonials.find((t) => t.id === id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteTestimonial(id);
  return NextResponse.json({ success: true });
}
