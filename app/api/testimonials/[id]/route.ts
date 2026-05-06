import { NextRequest, NextResponse } from 'next/server';
import { getTestimonials, saveTestimonials } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const testimonials = getTestimonials();
  const idx = testimonials.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  testimonials[idx] = { ...testimonials[idx], ...body, id };
  saveTestimonials(testimonials);
  return NextResponse.json(testimonials[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testimonials = getTestimonials();
  const filtered = testimonials.filter((t) => t.id !== id);
  if (filtered.length === testimonials.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  saveTestimonials(filtered);
  return NextResponse.json({ success: true });
}
