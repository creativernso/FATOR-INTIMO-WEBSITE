import { NextRequest, NextResponse } from 'next/server';
import { getTestimonials, upsertTestimonial } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(await getTestimonials());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newItem = {
    id: uuid(),
    name: body.name || '',
    role: body.role || '',
    content: body.content || '',
    transformation: body.transformation || '',
    rating: Number(body.rating) || 5,
    productPurchased: body.productPurchased || '',
  };
  await upsertTestimonial(newItem);
  return NextResponse.json(newItem, { status: 201 });
}
