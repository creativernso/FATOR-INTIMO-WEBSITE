import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, Shield, Clock, Star, Download } from 'lucide-react';
import { getProducts, getTestimonials } from '@/lib/db';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BuyButton from './BuyButton';
import FAQAccordion from './FAQAccordion';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await getProducts()).find((p) => p.slug === slug);
  if (!product) notFound();

  const testimonials = (await getTestimonials()).filter(
    (t) => t.productPurchased === product.title
  );

  const stripeReady = !!process.env.STRIPE_SECRET_KEY;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen">
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
            <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/40 aspect-[3/4] lg:aspect-auto lg:h-[560px]">
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
                <span className="text-xs text-accent tracking-widest uppercase mb-3 block">{product.category}</span>
                <h1 className="font-heading text-4xl md:text-5xl font-medium text-text-primary leading-tight mb-3">
                  {product.title}
                </h1>
                <p className="text-text-secondary text-lg leading-relaxed italic">
                  &ldquo;{product.hook}&rdquo;
                </p>
              </div>

              <p className="text-text-secondary text-base leading-relaxed">{product.description}</p>

              {/* Price box */}
              <div className="rounded-2xl border border-white/8 bg-surface p-6 space-y-4">
                <div className="flex items-end gap-3">
                  <div>
                    {product.originalPrice && (
                      <p className="text-text-muted text-sm line-through mb-0.5">
                        R$ {product.originalPrice},00
                      </p>
                    )}
                    <p className="font-heading text-4xl font-medium text-text-primary">
                      R$ {product.price},<span className="text-2xl">00</span>
                    </p>
                  </div>
                  {discount && (
                    <span className="text-accent text-sm font-medium mb-1">Economize {discount}%</span>
                  )}
                </div>

                {stripeReady ? (
                  <BuyButton productId={product.id} />
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 bg-accent/30 border border-accent/20 text-accent/60 font-medium py-4 px-8 rounded-xl text-base cursor-not-allowed">
                    Pagamentos em breve
                  </div>
                )}

                <div className="flex items-center justify-center gap-5 pt-1">
                  <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <Shield size={12} className="text-green-400" />
                    <span>Garantia 7 dias</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <Download size={12} className="text-blue-400" />
                    <span>Acesso imediato</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <Clock size={12} className="text-purple-400" />
                    <span>PDF & Mobile</span>
                  </div>
                </div>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Visa */}
                <div className="h-8 px-3 rounded-lg border border-white/10 bg-white flex items-center justify-center">
                  <svg height="16" viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
                    <path d="M293.2 348.7l33.4-195.6h53.4l-33.4 195.6h-53.4zm246.7-191.1c-10.6-3.9-27.1-8.1-47.8-8.1-52.7 0-89.8 26.4-90.1 64.3-.3 28 26.5 43.6 46.7 52.9 20.7 9.5 27.7 15.6 27.6 24.1-.1 13-16.6 19-31.9 19-21.3 0-32.6-2.9-50.1-10l-6.9-3.1-7.5 43.5c12.4 5.4 35.4 10.1 59.3 10.3 56 0 92.4-26.1 92.8-66.5.2-22.2-14-39.1-44.7-53-18.6-9-30-15-29.9-24.2 0-8.1 9.7-16.8 30.5-16.8 17.4-.3 30 3.5 39.8 7.4l4.8 2.2 7.4-42zm136.9-4.5h-41.2c-12.8 0-22.3 3.5-27.9 16.1l-79.2 178.7h56l11.1-29h68.3l6.5 29h49.5l-43.1-194.8zm-65.7 125.9l20.9-53.5c-.3.5 4.3-11 6.9-18.1l3.5 16.4 12 55.2h-43.3zm-444.9-125.9l-52.3 133.5-5.6-27.2c-9.7-31-40-64.6-73.9-81.4l47.8 171.5 56.5-.1 84-196.3h-56.5z" fill="#1a1f71"/>
                    <path d="M146.9 153.1H58.5l-.7 4c69.1 16.6 114.8 56.7 133.8 104.9l-19.3-92.1c-3.3-12.4-12.7-16.3-25.4-16.8z" fill="#f9a533"/>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="h-8 px-3 rounded-lg border border-white/10 bg-white flex items-center justify-center">
                  <svg height="20" viewBox="0 0 131.39 86.9" xmlns="http://www.w3.org/2000/svg">
                    <rect width="131.39" height="86.9" rx="8" fill="white"/>
                    <circle cx="49.98" cy="43.45" r="30" fill="#EB001B"/>
                    <circle cx="81.41" cy="43.45" r="30" fill="#F79E1B"/>
                    <path d="M65.7 19.67a30 30 0 0 1 0 47.56 30 30 0 0 1 0-47.56z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* PIX */}
                <div className="h-8 px-3 rounded-lg border border-white/10 bg-[#32bcad] flex items-center justify-center gap-1.5">
                  <svg height="14" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="white">
                    <path d="M112.57 391.19a63.67 63.67 0 0 0 45.23 18.71h.49a63.54 63.54 0 0 0 45-18.71l84.44-85.15 84.43 85.15a63.88 63.88 0 0 0 90.46 0l9.55-9.63-107.8-108.7 107.8-108.65-9.55-9.63a63.88 63.88 0 0 0-90.46 0l-84.43 85.15-84.44-85.15a63.88 63.88 0 0 0-90.46 0l-9.55 9.63 107.8 108.65-107.8 108.7z"/>
                  </svg>
                  <span className="text-white text-xs font-bold tracking-wide">PIX</span>
                </div>
                {/* Stripe / Secure */}
                <div className="h-8 px-3 rounded-lg border border-white/10 bg-white flex items-center justify-center gap-1.5">
                  <svg height="14" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h60v25H0z" fill="white"/>
                    <path d="M29.4 7.6c-2 0-3.6.9-3.6 2.7 0 3.4 4.7 2.5 4.7 4.1 0 .6-.6 1-1.5 1-1.3 0-2.8-.5-4-1.3v3c1.3.6 2.7.9 4 .9 2.1 0 3.8-1 3.8-2.8 0-3.5-4.8-2.6-4.8-4.1 0-.6.5-.9 1.3-.9 1.2 0 2.5.4 3.5 1V8.1c-1-.4-2.2-.5-3.4-.5zm-8.8.2L18 17.8h2.5l.5-1.6h3.5l.5 1.6H27L24.4 7.8h-3.8zm1.6 2.4l1.2 3.8h-2.4l1.2-3.8zm-9.5-2.4v10h2.6v-10h-2.6zm-5.7 0H3v10h2.6v-3.3h.9c2.1 0 3.6-1.1 3.6-3.4 0-2.1-1.4-3.3-3.5-3.3zm-.1 2.1c.9 0 1.2.5 1.2 1.2 0 .8-.4 1.2-1.2 1.2H5.6v-2.4h1.3zm29.7 5.7c-1.2 0-1.9-1-1.9-2.5 0-1.6.7-2.5 1.9-2.5s1.9 1 1.9 2.5c0 1.6-.7 2.5-1.9 2.5zm0-7.8c-2.6 0-4.5 1.9-4.5 5.3s1.9 5.3 4.5 5.3 4.5-1.9 4.5-5.3-1.9-5.3-4.5-5.3zm13.2.2h-2.8l-2 3.4-2-3.4h-2.8l3.4 5.2-3.6 4.8H44l2.3-3.7 2.3 3.7h2.8l-3.6-4.8 3.4-5.2z" fill="#635bff"/>
                  </svg>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      {product.forWho && product.forWho.length > 0 && (
        <section className="py-14 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll>
              <h2 className="font-heading text-3xl font-light text-text-primary mb-8">
                Para quem é este <span style={{ color: '#fe0050' }}>ebook?</span>
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.forWho.map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 60}>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-surface">
                    <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={10} className="text-accent" />
                    </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="py-14 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-10">
                <h2 className="font-heading text-3xl font-light text-text-primary">
                  Quem já <span style={{ color: '#fe0050' }}>transformou</span>
                </h2>
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <AnimateOnScroll key={t.id} delay={i * 80}>
                  <div className="p-6 rounded-2xl border border-white/5 bg-surface flex flex-col gap-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <Star key={s} size={13} className="text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed flex-1">&ldquo;{t.content}&rdquo;</p>
                    {t.transformation && (
                      <div className="border-t border-white/5 pt-3">
                        <p className="text-text-muted text-xs italic">{t.transformation}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-text-primary text-sm font-medium">{t.name}</p>
                      <p className="text-text-muted text-xs">{t.role}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

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
