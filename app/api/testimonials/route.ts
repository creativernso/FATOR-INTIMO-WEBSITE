import { NextRequest, NextResponse } from 'next/server';
import { getTestimonials, saveTestimonials } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(getTestimonials());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const testimonials = getTestimonials();
  const newItem = {
    id: uuid(),
    name: body.name || '',
    role: body.role || '',
    content: body.content || '',
    transformation: body.transformation || '',
    rating: Number(body.rating) || 5,
    productPurchased: body.productPurchased || '',
  };
  testimonials.push(newItem);
  saveTestimonials(testimonials);
  return NextResponse.json(newItem, { status: 201 });
}
