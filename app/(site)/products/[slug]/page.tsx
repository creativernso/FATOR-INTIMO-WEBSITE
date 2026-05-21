import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, Shield, Clock, Star, Download, User } from 'lucide-react';
import { getProducts, getTestimonials } from '@/lib/db';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BuyButton from './BuyButton';
import FAQAccordion from './FAQAccordion';
import CountdownTimer from './CountdownTimer';
import SalesVideo from './SalesVideo';
import ProductEvents from './ProductEvents';
import StarRating from '@/components/StarRating';
import ReviewSection from '@/components/ReviewSection';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProducts()).find((p) => p.slug === slug);
  if (!product) return { title: 'Produto não encontrado' };
  const description = product.hook || product.description || 'Material exclusivo Fator Íntimo.';
  const url = `${SITE_URL}/products/${product.slug}`;
  return {
    title: product.title,
    description: description.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description: description.slice(0, 200),
      url,
      type: 'website',
      siteName: 'Fator Íntimo',
      images: product.coverImage ? [{ url: product.coverImage, width: 1200, height: 630, alt: product.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: description.slice(0, 200),
      images: product.coverImage ? [product.coverImage] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allProducts = await getProducts();
  const product = allProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  // Related products, same category first, then fill with featured/others
  const relatedProducts = (() => {
    const sameCategory = allProducts.filter((p) => p.id !== product.id && p.category === product.category);
    const others = allProducts.filter((p) => p.id !== product.id && p.category !== product.category);
    return [...sameCategory, ...others].slice(0, 3);
  })();

  // Load testimonials before building JSON-LD so the Product schema can
  // include AggregateRating + reviews (eligible for star rich results).
  const testimonials = (await getTestimonials(true)).filter(
    (t) => t.productPurchased === product.title
  );
  const rated = testimonials.filter((t) => typeof t.rating === 'number' && t.rating! > 0);
  const aggregateRating = rated.length > 0
    ? {
        '@type': 'AggregateRating',
        ratingValue: (rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length).toFixed(2),
        reviewCount: rated.length,
        bestRating: 5,
        worstRating: 1,
      }
    : null;
  const reviewsForSchema = testimonials.slice(0, 10).map((t) => ({
    '@type': 'Review',
    reviewRating: t.rating
      ? { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 }
      : undefined,
    author: { '@type': 'Person', name: t.name },
    reviewBody: t.content,
  }));

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.hook || product.description,
    image: product.coverImage,
    brand: { '@type': 'Brand', name: 'Fator Íntimo' },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'BRL',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Fator Íntimo' },
    },
  };
  if (aggregateRating) productJsonLd.aggregateRating = aggregateRating;
  if (reviewsForSchema.length > 0) productJsonLd.review = reviewsForSchema;

  const faqJsonLd = (product.faq?.length ?? 0) > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: product.faq!.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  } : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Produtos', item: `${SITE_URL}/products` },
      { '@type': 'ListItem', position: 3, name: product.title, item: `${SITE_URL}/products/${product.slug}` },
    ],
  };

  const stripeReady = !!process.env.STRIPE_SECRET_KEY;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <ProductEvents productId={product.id} productTitle={product.title} value={product.price} />
      {/* Back */}
      <div className="pt-28 pb-0 px-6 max-w-6xl mx-auto">
        <Link href="/products" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
          <ArrowLeft size={14} /> Todos os produtos
        </Link>
      </div>

      {/* ── HERO ── */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Cover */}
          <AnimateOnScroll>
            <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/40 aspect-[3/4] mx-auto w-full max-w-md lg:max-w-none">
              <Image
                src={product.coverImage}
                alt={product.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {discount && (
                <div className="absolute top-4 right-4 bg-accent text-white text-sm font-bold px-4 py-1.5 rounded-full">
                  {discount}% OFF
                </div>
              )}
            </div>
          </AnimateOnScroll>

          {/* Info + sticky buy box */}
          <AnimateOnScroll delay={100}>
            <div className="flex flex-col gap-6">
              <div>
                {/* Rating sits exactly where the "Relacionamentos" category badge used to be */}
                <div className="mb-3 min-h-[20px]">
                  {aggregateRating && (
                    <StarRating
                      rating={Number(aggregateRating.ratingValue)}
                      count={aggregateRating.reviewCount}
                      size={15}
                    />
                  )}
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-text-primary leading-[1.05] tracking-tight uppercase mb-3">
                  {product.title}
                </h1>
                {product.hook && (
                  <p className="text-accent text-sm sm:text-base font-medium uppercase tracking-wide leading-snug">
                    {product.hook}
                  </p>
                )}
              </div>

              <p className="text-text-secondary text-base leading-relaxed">{product.description}</p>

              {/* Price + Countdown + Buy, single bordered block */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-nowrap items-baseline justify-center sm:justify-start gap-2.5 sm:gap-5 pb-2">
                  {product.originalPrice && (
                    <p className="text-accent/70 text-base sm:text-xl line-through font-medium flex-shrink-0">
                      R$ {product.originalPrice}
                    </p>
                  )}
                  <p className="font-heading text-3xl sm:text-5xl font-semibold text-text-primary leading-none flex-shrink-0 whitespace-nowrap">
                    R$ {product.price},<span className="text-2xl sm:text-4xl">00</span>
                  </p>
                  {discount && (
                    <span className="inline-flex items-center bg-accent text-white text-[11px] sm:text-sm font-semibold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg shadow-accent/20 flex-shrink-0 whitespace-nowrap self-center">
                      Economize {discount}%
                    </span>
                  )}
                </div>

                {/* Countdown timer */}
                {product.countdownEnabled && product.countdownEndsAt && (
                  <CountdownTimer endsAt={product.countdownEndsAt} text={product.countdownText} />
                )}

                {stripeReady ? (
                  <BuyButton productId={product.id} />
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 bg-accent/30 border border-accent/20 text-accent/60 font-medium py-4 px-8 rounded-xl text-base cursor-not-allowed">
                    Pagamentos em breve
                  </div>
                )}

                <div className="grid grid-cols-3 items-start sm:flex sm:justify-center sm:items-center gap-2 sm:gap-6 pt-2">
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 text-text-muted text-[11px] sm:text-xs text-center sm:text-left leading-tight">
                    <Shield size={16} className="text-green-400 sm:w-3 sm:h-3" />
                    <span>Garantia 7 dias</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 text-text-muted text-[11px] sm:text-xs text-center sm:text-left leading-tight">
                    <Download size={16} className="text-blue-400 sm:w-3 sm:h-3" />
                    <span>Acesso imediato</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 text-text-muted text-[11px] sm:text-xs text-center sm:text-left leading-tight">
                    <Clock size={16} className="text-purple-400 sm:w-3 sm:h-3" />
                    <span>PDF & Mobile</span>
                  </div>
                </div>
              </div>

              {/* Trust bar, single line on mobile, slightly shrunken chips */}
              <div className="flex flex-nowrap items-center justify-between sm:justify-start gap-1.5 sm:gap-3 sm:flex-wrap">
                {/* Visa */}
                <div className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg border border-white/10 bg-white flex items-center justify-center flex-shrink-0">
                  <svg height="16" viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
                    <path d="M293.2 348.7l33.4-195.6h53.4l-33.4 195.6h-53.4zm246.7-191.1c-10.6-3.9-27.1-8.1-47.8-8.1-52.7 0-89.8 26.4-90.1 64.3-.3 28 26.5 43.6 46.7 52.9 20.7 9.5 27.7 15.6 27.6 24.1-.1 13-16.6 19-31.9 19-21.3 0-32.6-2.9-50.1-10l-6.9-3.1-7.5 43.5c12.4 5.4 35.4 10.1 59.3 10.3 56 0 92.4-26.1 92.8-66.5.2-22.2-14-39.1-44.7-53-18.6-9-30-15-29.9-24.2 0-8.1 9.7-16.8 30.5-16.8 17.4-.3 30 3.5 39.8 7.4l4.8 2.2 7.4-42zm136.9-4.5h-41.2c-12.8 0-22.3 3.5-27.9 16.1l-79.2 178.7h56l11.1-29h68.3l6.5 29h49.5l-43.1-194.8zm-65.7 125.9l20.9-53.5c-.3.5 4.3-11 6.9-18.1l3.5 16.4 12 55.2h-43.3zm-444.9-125.9l-52.3 133.5-5.6-27.2c-9.7-31-40-64.6-73.9-81.4l47.8 171.5 56.5-.1 84-196.3h-56.5z" fill="#1a1f71"/>
                    <path d="M146.9 153.1H58.5l-.7 4c69.1 16.6 114.8 56.7 133.8 104.9l-19.3-92.1c-3.3-12.4-12.7-16.3-25.4-16.8z" fill="#f9a533"/>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg border border-white/10 bg-white flex items-center justify-center flex-shrink-0">
                  <svg height="20" viewBox="0 0 131.39 86.9" xmlns="http://www.w3.org/2000/svg">
                    <rect width="131.39" height="86.9" rx="8" fill="white"/>
                    <circle cx="49.98" cy="43.45" r="30" fill="#EB001B"/>
                    <circle cx="81.41" cy="43.45" r="30" fill="#F79E1B"/>
                    <path d="M65.7 19.67a30 30 0 0 1 0 47.56 30 30 0 0 1 0-47.56z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* PIX */}
                <div className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg border border-white/10 bg-[#32bcad] flex items-center justify-center gap-1.5 flex-shrink-0">
                  <svg height="14" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="white">
                    <path d="M112.57 391.19a63.67 63.67 0 0 0 45.23 18.71h.49a63.54 63.54 0 0 0 45-18.71l84.44-85.15 84.43 85.15a63.88 63.88 0 0 0 90.46 0l9.55-9.63-107.8-108.7 107.8-108.65-9.55-9.63a63.88 63.88 0 0 0-90.46 0l-84.43 85.15-84.44-85.15a63.88 63.88 0 0 0-90.46 0l-9.55 9.63 107.8 108.65-107.8 108.7z"/>
                  </svg>
                  <span className="hidden sm:inline text-white text-xs font-bold tracking-wide">PIX</span>
                </div>
                {/* Stripe / Secure */}
                <div className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg border border-white/10 bg-white flex items-center justify-center gap-1.5 flex-shrink-0">
                  <svg height="14" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h60v25H0z" fill="white"/>
                    <path d="M29.4 7.6c-2 0-3.6.9-3.6 2.7 0 3.4 4.7 2.5 4.7 4.1 0 .6-.6 1-1.5 1-1.3 0-2.8-.5-4-1.3v3c1.3.6 2.7.9 4 .9 2.1 0 3.8-1 3.8-2.8 0-3.5-4.8-2.6-4.8-4.1 0-.6.5-.9 1.3-.9 1.2 0 2.5.4 3.5 1V8.1c-1-.4-2.2-.5-3.4-.5zm-8.8.2L18 17.8h2.5l.5-1.6h3.5l.5 1.6H27L24.4 7.8h-3.8zm1.6 2.4l1.2 3.8h-2.4l1.2-3.8zm-9.5-2.4v10h2.6v-10h-2.6zm-5.7 0H3v10h2.6v-3.3h.9c2.1 0 3.6-1.1 3.6-3.4 0-2.1-1.4-3.3-3.5-3.3zm-.1 2.1c.9 0 1.2.5 1.2 1.2 0 .8-.4 1.2-1.2 1.2H5.6v-2.4h1.3zm29.7 5.7c-1.2 0-1.9-1-1.9-2.5 0-1.6.7-2.5 1.9-2.5s1.9 1 1.9 2.5c0 1.6-.7 2.5-1.9 2.5zm0-7.8c-2.6 0-4.5 1.9-4.5 5.3s1.9 5.3 4.5 5.3 4.5-1.9 4.5-5.3-1.9-5.3-4.5-5.3zm13.2.2h-2.8l-2 3.4-2-3.4h-2.8l3.4 5.2-3.6 4.8H44l2.3-3.7 2.3 3.7h2.8l-3.6-4.8 3.4-5.2z" fill="#635bff"/>
                  </svg>
                </div>
                {/* Apple Pay */}
                <div className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg border border-white/10 bg-white flex items-center justify-center flex-shrink-0">
                  <svg height="16" className="sm:h-[18px]" viewBox="0 0 64 26" xmlns="http://www.w3.org/2000/svg" aria-label="Apple Pay">
                    {/* Apple logo */}
                    <path d="M13.96 5.86c-.74.88-1.93 1.57-3.12 1.47-.15-1.19.43-2.45 1.11-3.23.74-.9 2.04-1.54 3.1-1.59.12 1.24-.36 2.46-1.09 3.35zm1.08 1.71c-1.72-.1-3.19.98-4.01.98s-2.08-.93-3.44-.9c-1.77.03-3.41 1.03-4.31 2.62-1.85 3.18-.48 7.89 1.32 10.47.88 1.28 1.93 2.69 3.31 2.64 1.31-.05 1.83-.85 3.42-.85s2.05.85 3.44.83c1.43-.02 2.33-1.28 3.2-2.56 1-1.46 1.41-2.88 1.43-2.96-.03-.01-2.75-1.06-2.78-4.17-.03-2.6 2.12-3.85 2.22-3.92-1.21-1.78-3.1-1.97-3.78-2.01z" fill="#000"/>
                    {/* Pay text */}
                    <text x="22" y="20" fontFamily="-apple-system, system-ui, sans-serif" fontSize="16" fontWeight="600" fill="#000" letterSpacing="-0.5">Pay</text>
                  </svg>
                </div>
                {/* Google Pay */}
                <div className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg border border-white/10 bg-white flex items-center justify-center gap-1 flex-shrink-0">
                  <svg height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
                  </svg>
                  <span className="hidden sm:inline text-[10px] font-semibold text-[#5f6368]">Pay</span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── SALES VIDEO ── */}
      {product.videoUrl && (
        <section className="py-10 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll>
              <p className="text-xs text-accent tracking-widest uppercase mb-5 text-center">Apresentação</p>
              <SalesVideo url={product.videoUrl} />
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* ── FOR WHO ── */}
      {product.forWho && product.forWho.length > 0 && (
        <section className="py-14 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll>
              <h2 className="font-heading text-3xl font-light text-text-primary mb-8">
                Para quem é este <span style={{ color: '#fe0050' }}>ebook?</span>
              </h2>
            </AnimateOnScroll>
            {/* Mobile: sticky stack */}
            <div className="flex flex-col sm:hidden">
              {product.forWho.map((item, i) => (
                <div key={i} className="sticky" style={{ top: `${68 + i * 14}px`, zIndex: 10 + i }}>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-surface mb-3"
                    style={{ transform: `scale(${1 - (product.forWho!.length - 1 - i) * 0.018})`, transformOrigin: 'top center' }}>
                    <User size={20} className="text-accent flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <p className="text-text-secondary text-sm leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-3">
              {product.forWho.map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 60}>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-surface">
                    <User size={20} className="text-accent flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <p className="text-text-secondary text-sm leading-relaxed">{item}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHAT YOU LEARN ── */}
      {product.whatYouLearn && product.whatYouLearn.length > 0 && (
        <section className="py-14 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll>
              <div>
                <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Conteúdo</span>
                <h2 className="font-heading text-3xl font-light text-text-primary mb-4">
                  O que você vai <span style={{ color: '#fe0050' }}>descobrir</span>
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Cada capítulo foi construído para levar você de um ponto de confusão a um ponto de clareza e ação.
                </p>
              </div>
            </AnimateOnScroll>
            <div className="space-y-3">
              {product.whatYouLearn.map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 60}>
                  <div className="flex items-start gap-3">
                    <span className="font-heading text-accent/40 text-sm font-medium w-6 flex-shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-text-secondary text-sm leading-relaxed">{item}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BENEFITS ── */}
      {product.benefits && product.benefits.length > 0 && (
        <section className="py-14 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-10">
                <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Transformação</span>
                <h2 className="font-heading text-3xl font-light text-text-primary">
                  Por que isso <span style={{ color: '#fe0050' }}>muda relações</span>
                </h2>
              </div>
            </AnimateOnScroll>
            {/* Mobile: sticky stack */}
            <div className="flex flex-col md:hidden">
              {product.benefits.map((benefit, i) => (
                <div key={i} className="sticky" style={{ top: `${68 + i * 14}px`, zIndex: 10 + i }}>
                  <div className="p-5 rounded-xl border border-white/5 bg-surface mb-3"
                    style={{ transform: `scale(${1 - (product.benefits!.length - 1 - i) * 0.018})`, transformOrigin: 'top center' }}>
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                      <Check size={14} className="text-accent" />
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.benefits.map((benefit, i) => (
                <AnimateOnScroll key={i} delay={i * 60}>
                  <div className="p-5 rounded-xl border border-white/5 bg-surface hover:border-accent/15 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                      <Check size={14} className="text-accent" />
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">{benefit}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS ── (replaces the static testimonials block, now fully interactive) */}
      <ReviewSection productSlug={product.slug} productTitle={product.title} />

      {/* ── FAQ ── */}
      {product.faq && product.faq.length > 0 && (
        <section className="py-14 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-10">
                <h2 className="font-heading text-3xl font-light text-text-primary mb-3">
                  Perguntas <span style={{ color: '#fe0050' }}>frequentes</span>
                </h2>
              </div>
            </AnimateOnScroll>
            <FAQAccordion items={product.faq} />
          </div>
        </section>
      )}

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <p className="text-xs text-text-muted tracking-[0.3em] uppercase mb-8">Você também pode gostar</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedProducts.map((p) => {
                  const dscnt = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="group rounded-2xl border border-white/8 bg-surface overflow-hidden hover:border-accent/30 transition-all"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden">
                        <Image
                          src={p.coverImage}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {dscnt && (
                          <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {dscnt}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-accent uppercase tracking-widest mb-2">{p.category}</p>
                        <h3 className="font-heading text-lg font-medium text-text-primary uppercase tracking-tight leading-tight mb-2 line-clamp-2">{p.title}</h3>
                        {p.hook && (
                          <p className="text-accent text-xs font-medium uppercase tracking-wide leading-snug line-clamp-2 mb-3">
                            {p.hook}
                          </p>
                        )}
                        <p className="font-heading text-xl font-medium text-text-primary">R$ {p.price}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ── */}
      <section className="py-16 pb-28 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <AnimateOnScroll>
            <div className="relative rounded-2xl border border-white/8 bg-surface p-10 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="w-14 h-14 rounded-full border border-accent/20 bg-accent/5 flex items-center justify-center mx-auto mb-5">
                <Shield size={22} className="text-accent" />
              </div>
              <h2 className="font-heading text-2xl font-medium text-text-primary mb-2">
                Garantia incondicional de 7 dias
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-md mx-auto">
                Se por qualquer motivo o produto não transformar sua perspectiva, devolvemos 100% do valor. Sem perguntas, sem burocracia.
              </p>
              <div className="max-w-xs mx-auto">
                {stripeReady ? (
                  <BuyButton productId={product.id} label={`Investir R$ ${product.price},00`} />
                ) : (
                  <p className="text-text-muted text-sm">Pagamentos em configuração.</p>
                )}
              </div>
              <p className="text-text-muted text-xs mt-4">
                PIX · Cartão de crédito · Acesso imediato
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
