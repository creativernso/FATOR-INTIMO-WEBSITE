import { NextRequest, NextResponse } from 'next/server';
import { getProducts, upsertProduct } from '@/lib/db';
import { broadcastProduct } from '@/lib/broadcast';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(await getProducts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slugify = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newProduct = {
    id: uuid(),
    slug: body.slug || slugify(body.title || uuid()),
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
    benefits: Array.isArray(body.benefits) ? body.benefits : [],
    whatYouLearn: Array.isArray(body.whatYouLearn) ? body.whatYouLearn : [],
    forWho: Array.isArray(body.forWho) ? body.forWho : [],
    faq: Array.isArray(body.faq) ? body.faq : [],
    downloadUrl: body.downloadUrl || '',
  };
  await upsertProduct(newProduct);

  // Broadcast to all email leads unless the admin opted out
  if (body.broadcast !== false) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
    broadcastProduct({
      title: newProduct.title,
      hook: newProduct.hook,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice,
      url: `${baseUrl}/products/${newProduct.slug}`,
      coverImage: newProduct.coverImage,
    }).catch((err) => console.error('[products] broadcast failed:', err));
  }

  return NextResponse.json(newProduct, { status: 201 });
}
