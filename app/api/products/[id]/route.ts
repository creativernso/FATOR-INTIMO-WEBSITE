import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getProducts, upsertProduct, deleteProduct } from '@/lib/db';

async function verifyAdmin() {
  const session = (await cookies()).get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const products = await getProducts();
  if (!products.find((p) => p.id === id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteProduct(id);
  return NextResponse.json({ success: true });
}
