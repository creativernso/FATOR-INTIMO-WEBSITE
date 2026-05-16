import { NextRequest, NextResponse } from 'next/server';
import {
  getProducts,
  getGuideBySlug,
  getTestimonials,
  upsertTestimonial,
  createNotification,
  getLeads,
} from '@/lib/db';
import { getOrders } from '@/lib/orders';
import { alertNewTestimonial } from '@/lib/admin-notifications';
import type { Testimonial } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

interface Target {
  type: 'product' | 'guide';
  matchKey: (t: Testimonial) => boolean;
  label: string;
}

async function resolveTarget(productSlug?: string | null, guideSlug?: string | null): Promise<Target | null> {
  if (productSlug) {
    const products = await getProducts();
    const product = products.find((p) => p.slug === productSlug);
    if (!product) return null;
    return {
      type: 'product',
      matchKey: (t) => t.productPurchased === product.title,
      label: product.title,
    };
  }
  if (guideSlug) {
    const guide = await getGuideBySlug(guideSlug);
    if (!guide) return null;
    return {
      type: 'guide',
      matchKey: (t) => t.guideSlug === guideSlug,
      label: guide.title,
    };
  }
  return null;
}

// GET /api/reviews?productSlug=xxx  OR  ?guideSlug=xxx
export async function GET(req: NextRequest) {
  const productSlug = req.nextUrl.searchParams.get('productSlug');
  const guideSlug = req.nextUrl.searchParams.get('guideSlug');
  const target = await resolveTarget(productSlug, guideSlug);
  if (!target) return NextResponse.json({ reviews: [], aggregate: null });

  const all = await getTestimonials(false);
  let reviews = all.filter(target.matchKey);
  reviews = reviews.filter((t) => t.status === 'approved' || !t.status);

  // Aggregate
  const rated = reviews.filter((r) => typeof r.rating === 'number' && r.rating! > 0);
  const avg = rated.length > 0 ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : 0;
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
    aggregate: { avg, count: rated.length, total: reviews.length, distribution: dist },
  });
}

// POST /api/reviews
// Body: { productSlug?, guideSlug?, name, email, location, content, rating, headline, photoUrl, anonymous }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const productSlug: string | undefined = body.productSlug?.trim() || undefined;
  const guideSlug: string | undefined = body.guideSlug?.trim() || undefined;
  if (!productSlug && !guideSlug) {
    return NextResponse.json({ error: 'Produto ou guia não informado.' }, { status: 400 });
  }
  if (!body.name?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'Nome e conteúdo obrigatórios.' }, { status: 400 });
  }
  if (!body.rating) {
    return NextResponse.json({ error: 'Selecione uma nota de 1 a 5 estrelas.' }, { status: 400 });
  }
  const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));

  // Resolve the review target (product or guide)
  const target = await resolveTarget(productSlug, guideSlug);
  if (!target) return NextResponse.json({ error: 'Alvo não encontrado.' }, { status: 404 });

  // Verified-purchase check
  // - For products: any paid order matching email + productId
  // - For guides: any lead with guideSlug + email + guideDownloaded
  let verifiedPurchase = false;
  const email = body.email?.trim().toLowerCase();
  if (email) {
    try {
      if (target.type === 'product' && productSlug) {
        const [orders, products] = await Promise.all([getOrders(), getProducts()]);
        const product = products.find((p) => p.slug === productSlug);
        verifiedPurchase = orders.some(
          (o) => o.productId === product?.id && o.customerEmail?.toLowerCase() === email,
        );
      } else if (target.type === 'guide' && guideSlug) {
        const leads = await getLeads();
        verifiedPurchase = leads.some(
          (l) =>
            l.email?.toLowerCase() === email &&
            (l.guideSlug === guideSlug || l.source === 'free-guide' || l.guideDownloaded),
        );
      }
    } catch {
      // ignore, fall back to non-verified
    }
  }

  const review: Testimonial = {
    id: uuid(),
    name: body.name.trim().slice(0, 80),
    content: body.content.trim().slice(0, 2000),
    headline: body.headline?.trim()?.slice(0, 120) || undefined,
    rating,
    productPurchased: target.type === 'product' ? target.label : undefined,
    guideSlug: target.type === 'guide' ? guideSlug : undefined,
    email: email || undefined,
    location: body.location?.trim()?.slice(0, 80) || undefined,
    photoUrl: body.photoUrl || undefined,
    anonymous: !!body.anonymous,
    verifiedPurchase,
    helpfulCount: 0,
    status: verifiedPurchase ? 'approved' : 'pending',
    submittedAt: new Date().toISOString(),
  };

  await upsertTestimonial(review);
  await createNotification(
    'testimonial',
    verifiedPurchase ? 'Nova avaliação verificada' : 'Nova avaliação aguardando aprovação',
    `${review.name} avaliou "${target.label}" com ${rating}★.`,
    { name: review.name, target: target.label },
  );
  alertNewTestimonial(review.name);

  return NextResponse.json({ ok: true, verifiedPurchase, status: review.status }, { status: 201 });
}
