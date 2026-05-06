import { NextRequest, NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(getProducts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const products = getProducts();
  const newProduct = {
    id: uuid(),
    title: body.title || '',
    hook: body.hook || '',
    description: body.description || '',
    price: Number(body.price) || 0,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    coverImage: body.coverImage || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    checkoutUrl: body.checkoutUrl || '#',
    featured: Boolean(body.featured),
    category: body.category || 'Geral',
    tags: Array.isArray(body.tags) ? body.tags : [],
  };
  products.push(newProduct);
  saveProducts(products);
  return NextResponse.json(newProduct, { status: 201 });
}
