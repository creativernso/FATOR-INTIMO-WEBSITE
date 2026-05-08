import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, PenLine, Star } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import TestimonialCard from '@/components/TestimonialCard';
import { getTestimonials } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Histórias',
  description: 'Transformações reais de quem aplicou a psicologia do Fator Íntimo.',
};

export const dynamic = 'force-dynamic';

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials(true);
  const featured = testimonials.filter((t) => t.featured);
  const rest = testimonials.filter((t) => !t.featured);
  const avgRating = testimonials.filter((t) => t.rating).reduce((acc, t) => acc + (t.rating ?? 0), 0) / (testimonials.filter((t) => t.rating).length || 1);

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
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">Histórias Reais</span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5 leading-[1.05]">
              <span style={{ color: '#fe0050' }}>Transformações</span> que aconteceram
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mb-8">
              Estas são histórias de pessoas que decidiram entender seus padrões e mudaram o rumo dos seus relacionamentos.
            </p>
            <Link
              href="/testimonials/submit"
              className="inline-flex items-center gap-2 border border-accent/30 hover:bg-accent/10 text-accent px-6 py-3 rounded-full text-sm font-medium transition-all"
            >
              <PenLine size={14} />
              Compartilhe sua história
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-10 px-6 pb-28">
        <div className="max-w-5xl mx-auto">

          {testimonials.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-sm mb-8">Seja o primeiro a compartilhar sua transformação.</p>
              <Link href="/testimonials/submit"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full text-sm font-medium transition-all">
                <PenLine size={14} /> Contar minha história
              </Link>
            </div>
          ) : (
            <>
              {/* Stats */}
              <AnimateOnScroll>
                <div className="grid grid-cols-3 gap-4 mb-14">
                  {[
                    { value: `${testimonials.length}+`, label: 'Histórias compartilhadas' },
                    { value: `⭐ ${avgRating.toFixed(1)}`, label: 'Avaliação média' },
                    { value: '10k+', label: 'Pessoas impactadas' },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-surface p-5 text-center">
                      <p className="font-heading text-2xl md:text-3xl font-medium text-text-primary">{stat.value}</p>
                      <p className="text-text-muted text-xs mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

              {/* All stories — unified 3-col grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <p className="text-xs text-accent tracking-widest uppercase mb-4">Comunidade</p>
              <h2 className="font-heading text-3xl font-light text-text-primary mb-3">
                A sua história importa.
              </h2>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed max-w-md mx-auto">
                Cada transformação compartilhada inspira outra pessoa a dar o primeiro passo. Conte a sua.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/testimonials/submit"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all"
                >
                  <PenLine size={14} />
                  Contar minha história
                </Link>
                <Link
                  href="/guia"
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-7 py-3.5 rounded-full text-sm transition-all"
                >
                  Explorar Guias <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
