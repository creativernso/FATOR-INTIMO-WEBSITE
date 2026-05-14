import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getTestimonials, upsertTestimonial, createNotification } from '@/lib/db';
import { getOrders } from '@/lib/orders';
import { alertNewTestimonial } from '@/lib/admin-notifications';
import type { Testimonial } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

// GET /api/reviews?productSlug=xxx[&status=approved]
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('productSlug');
  const onlyApproved = req.nextUrl.searchParams.get('status') !== 'all';
  if (!slug) return NextResponse.json({ reviews: [], aggregate: null });

  const [products, all] = await Promise.all([getProducts(), getTestimonials(false)]);
  const product = products.find((p) => p.slug === slug);
  if (!product) return NextResponse.json({ reviews: [], aggregate: null });

  let reviews = all.filter((t) => t.productPurchased === product.title);
  if (onlyApproved) reviews = reviews.filter((t) => t.status === 'approved' || !t.status);

  // Aggregate
  const rated = reviews.filter((r) => typeof r.rating === 'number' && r.rating! > 0);
  const avg = rated.length > 0 ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : 0;
  // Distribution
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rated.forEach((r) => {
    const rounded = Math.round(r.rating ?? 0);
    if (rounded >= 1 && rounded <= 5) dist[rounded] = (dist[rounded] || 0) + 1;
  });

  // Strip email from public payload
  const safe = reviews.map(({ email, ...rest }) => {
    void email;
    return rest;
  });

  return NextResponse.json({
    reviews: safe,
    aggregate: {
      avg,
      count: rated.length,
      total: reviews.length,
      distribution: dist,
    },
  });
}

// POST /api/reviews
// Body: { productSlug, name, email, location, content, rating, headline, photoUrl, anonymous }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.productSlug?.trim();
  if (!slug) return NextResponse.json({ error: 'Produto não informado.' }, { status: 400 });
  if (!body.name?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'Nome e conteúdo obrigatórios.' }, { status: 400 });
  }
  const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
  if (!body.rating) {
    return NextResponse.json({ error: 'Selecione uma nota de 1 a 5 estrelas.' }, { status: 400 });
  }

  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

  // Verified purchase check: any paid order under this product with matching email
  let verifiedPurchase = false;
  const email = body.email?.trim().toLowerCase();
  if (email) {
    try {
      const orders = await getOrders();
      verifiedPurchase = orders.some(
        (o) => o.productId === product.id && o.customerEmail?.toLowerCase() === email,
      );
    } catch {
      // ignore — fall back to non-verified
    }
  }

  const review: Testimonial = {
    id: uuid(),
    name: body.name.trim().slice(0, 80),
    content: body.content.trim().slice(0, 2000),
    headline: body.headline?.trim()?.slice(0, 120) || undefined,
    rating,
    productPurchased: product.title,
    email: email || undefined,
    location: body.location?.trim()?.slice(0, 80) || undefined,
    photoUrl: body.photoUrl || undefined,
    anonymous: !!body.anonymous,
    verifiedPurchase,
    helpfulCount: 0,
    // Verified purchases auto-approve; everything else goes to moderation
    status: verifiedPurchase ? 'approved' : 'pending',
    submittedAt: new Date().toISOString(),
  };

  await upsertTestimonial(review);
  await createNotification(
    'testimonial',
    verifiedPurchase ? 'Nova avaliação verificada' : 'Nova avaliação aguardando aprovação',
    `${review.name} avaliou "${product.title}" com ${rating}★.`,
    { name: review.name, product: product.title },
  );
  alertNewTestimonial(review.name);

  return NextResponse.json({ ok: true, verifiedPurchase, status: review.status }, { status: 201 });
}
