import { NextRequest, NextResponse } from 'next/server';
import { getProducts, upsertProduct, deleteProduct } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const products = await getProducts();
  const existing = products.find((p) => p.id === id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = { ...existing, ...body, id };
  await upsertProduct(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getProducts();
  if (!products.find((p) => p.id === id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteProduct(id);
  return NextResponse.json({ success: true });
}
