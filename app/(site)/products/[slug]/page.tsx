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
  const product = getProducts().find((p) => p.slug === slug);
  if (!product) notFound();

  const testimonials = getTestimonials().filter(
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
            <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-2xl shadow-black/40 aspect-[4/3] lg:aspect-auto lg:h-[480px]">
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
              <div className="flex flex-wrap gap-3">
                {['PIX', 'Cartão de crédito', 'Pagamento seguro'].map((t) => (
                  <span key={t} className="text-xs text-text-muted border border-white/8 rounded-full px-3 py-1.5">
                    {t}
                  </span>
                ))}
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
