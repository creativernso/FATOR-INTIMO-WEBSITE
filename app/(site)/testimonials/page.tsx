import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, PenLine, Star, BookOpen, Users } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import TestimonialCard from '@/components/TestimonialCard';
import { getTestimonials } from '@/lib/db';
import { createT } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Histórias de Transformação',
  description: 'Depoimentos reais de quem aplicou a psicologia do Fator Íntimo e transformou suas relações, sua autoestima e sua forma de amar.',
  path: '/testimonials',
  keywords: ['depoimentos fator íntimo', 'histórias transformação', 'avaliações psicologia relações'],
});

export const dynamic = 'force-dynamic';

export default async function TestimonialsPage() {
  const t = createT('pt');

  const testimonials = await getTestimonials(true);
  const avgRating = testimonials.filter((t) => t.rating).reduce((acc, t) => acc + (t.rating ?? 0), 0) / (testimonials.filter((t) => t.rating).length || 1);

  const statsLabels = ['Histórias compartilhadas', 'Avaliação média', 'Pessoas impactadas'];
  const shareCta = 'Contar minha história';
  const exploreGuides = 'Explorar Guias';
  const communityLabel = 'Comunidade';
  const ctaHeading = 'A sua história importa.';
  const ctaDesc = 'Cada transformação compartilhada inspira outra pessoa a dar o primeiro passo. Conte a sua.';
  const emptyText = 'Seja o primeiro a compartilhar sua transformação.';

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-3xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">{t('testimonials.label')}</span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5 leading-[1.05]">
              <span style={{ color: '#fe0050' }}>{t('testimonials.heading1')}</span> {t('testimonials.heading2')}
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mb-8">
              {t('testimonials.desc')}
            </p>
            <Link
              href="/testimonials/submit"
              className="inline-flex items-center gap-2 border border-accent/30 hover:bg-accent/10 text-accent px-6 py-3 rounded-full text-sm font-medium transition-all"
            >
              <PenLine size={14} />
              {t('testimonials.share_cta')}
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-10 px-6 pb-28">
        <div className="max-w-5xl mx-auto">

          {testimonials.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-sm mb-8">{emptyText}</p>
              <Link href="/testimonials/submit"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full text-sm font-medium transition-all">
                <PenLine size={14} /> {shareCta}
              </Link>
            </div>
          ) : (
            <>
              {/* Stats */}
              <AnimateOnScroll>
                <div className="grid grid-cols-3 gap-4 mb-14">
                  {[
                    { Icon: BookOpen, value: `${testimonials.length}+`, label: statsLabels[0] },
                    { Icon: Star,     value: avgRating.toFixed(1),       label: statsLabels[1], fillStar: true },
                    { Icon: Users,    value: '10k+',                     label: statsLabels[2] },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-surface p-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <stat.Icon
                          size={22}
                          className={stat.fillStar ? 'text-accent fill-accent' : 'text-accent'}
                          strokeWidth={1.75}
                        />
                        <p className="font-heading text-2xl md:text-3xl font-medium text-text-primary leading-none">
                          {stat.value}
                        </p>
                      </div>
                      <p className="text-text-muted text-xs mt-2">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

              {/* Mobile: sticky stack */}
              <div className="flex flex-col sm:hidden">
                {testimonials.map((t, i) => (
                  <div key={t.id} className="sticky" style={{ top: `${68 + i * 14}px`, zIndex: 10 + i }}>
                    <div className="mb-3"
                      style={{ transform: `scale(${1 - (testimonials.length - 1 - i) * 0.012})`, transformOrigin: 'top center' }}>
                      <TestimonialCard testimonial={t} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <AnimateOnScroll key={t.id} delay={i * 60}>
                    <TestimonialCard testimonial={t} />
                  </AnimateOnScroll>
                ))}
              </div>
            </>
          )}

          {/* Submit CTA */}
          <AnimateOnScroll>
            <div className="mt-20 relative rounded-2xl border border-white/5 bg-surface p-10 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <p className="text-xs text-accent tracking-widest uppercase mb-4">{communityLabel}</p>
              <h2 className="font-heading text-3xl font-light text-text-primary mb-3">{ctaHeading}</h2>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed max-w-md mx-auto">{ctaDesc}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/testimonials/submit"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all"
                >
                  <PenLine size={14} />
                  {shareCta}
                </Link>
                <Link
                  href="/guia"
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-7 py-3.5 rounded-full text-sm transition-all"
                >
                  {exploreGuides} <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
