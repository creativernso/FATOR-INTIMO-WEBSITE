import { NextRequest, NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  products[idx] = { ...products[idx], ...body, id };
  saveProducts(products);
  return NextResponse.json(products[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  saveProducts(filtered);
  return NextResponse.json({ success: true });
}
