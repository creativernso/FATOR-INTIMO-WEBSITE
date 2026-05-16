import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import StarRating from '@/components/StarRating';
import { getProducts, getTestimonials } from '@/lib/db';
import { createT } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Produtos & Materiais',
  description: 'Ebooks e materiais exclusivos sobre psicologia das relações, apego, atração e inteligência emocional. Ferramentas para transformar sua vida amorosa.',
  path: '/products',
  keywords: ['ebook relacionamento', 'curso psicologia', 'material amor', 'fator íntimo produtos'],
});

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const t = createT('pt');

  const [products, allTestimonials] = await Promise.all([
    getProducts(),
    getTestimonials(true),
  ]);

  // Aggregate rating per product (keyed by product title because that's how
  // Testimonial.productPurchased references it today)
  const ratingsByProduct = new Map<string, { avg: number; count: number }>();
  for (const product of products) {
    const rated = allTestimonials.filter(
      (t) => t.productPurchased === product.title && typeof t.rating === 'number' && t.rating! > 0,
    );
    if (rated.length === 0) continue;
    const avg = rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length;
    ratingsByProduct.set(product.title, { avg, count: rated.length });
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-20 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.07) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-2xl lg:max-w-5xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">
              {t('products.label')}
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-6xl font-light text-text-primary mb-6 leading-[1.05] lg:whitespace-nowrap">
              {t('products.heading1')}{' '}
              <span style={{ color: '#fe0050' }}>{t('products.heading2')}</span>
            </h1>
            <p className="text-text-muted text-sm tracking-wide max-w-md mx-auto leading-relaxed lg:max-w-none lg:whitespace-nowrap">
              {t('products.desc')}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Product grid */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-text-muted text-sm tracking-wide">{t('products.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {products.map((product, i) => {
                const discount = product.originalPrice
                  ? Math.round((1 - product.price / product.originalPrice) * 100)
                  : null;
                const rating = ratingsByProduct.get(product.title);

                return (
                  <AnimateOnScroll key={product.id} delay={i * 60}>
                    <div className="group rounded-2xl border border-white/5 bg-surface p-3 transition-all duration-500 hover:border-accent/20 flex flex-col h-full">
                      {/* Cover, portrait, clickable */}
                      <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-surface">
                        <Image
                          src={product.coverImage}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        {discount && (
                          <div className="absolute top-3 right-3 bg-accent text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-full tracking-wide">
                            {discount}% OFF
                          </div>
                        )}
                      </Link>

                      {/* Info below image */}
                      <div className="px-1 pb-1 flex flex-col flex-1">
                        {/* Stars in the spot where the category badge used to live */}
                        <div className="mb-1.5 min-h-[18px]">
                          {rating && (
                            <StarRating rating={rating.avg} count={rating.count} size={11} showCount={false} />
                          )}
                        </div>
                        <h2 className="font-heading text-sm md:text-base font-medium text-text-primary leading-snug mb-3 line-clamp-2">
                          {product.title}
                        </h2>

                        {/* Price + CTA stack vertically, never overflow */}
                        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {product.originalPrice && (
                              <span className="text-accent/70 text-xs line-through">
                                R${product.originalPrice}
                              </span>
                            )}
                            <span className="font-heading text-lg font-medium text-text-primary leading-none">
                              R${product.price}<span className="text-sm">,00</span>
                            </span>
                          </div>
                          <Link
                            href={`/products/${product.slug}`}
                            className="inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3.5 py-2 rounded-full transition-all whitespace-nowrap self-start sm:self-auto"
                          >
                            {t('products.see_product')} <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Guarantee strip */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="rounded-2xl border border-white/5 bg-surface p-10 text-center">
              <div className="w-12 h-12 rounded-full border border-accent/20 bg-accent/5 flex items-center justify-center mx-auto mb-4 text-lg">
                🛡️
              </div>
              <h2 className="font-heading text-2xl font-medium text-text-primary mb-2">
                Garantia incondicional de 7 dias
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
                Se por qualquer motivo o produto não transformar sua perspectiva, devolvemos 100% do valor. Sem perguntas, sem burocracia.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
