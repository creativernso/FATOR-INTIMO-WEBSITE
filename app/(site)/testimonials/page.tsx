import type { Metadata } from 'next';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import TestimonialCard from '@/components/TestimonialCard';
import { getTestimonials } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Histórias',
  description: 'Transformações reais de quem aplicou a psicologia do Fator Íntimo.',
};

export const dynamic = 'force-dynamic';

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] opacity-5 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Histórias Reais</span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5">
              <span style={{ color: '#fe0050' }}>Transformações</span> reais
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto">
              Estas são histórias de pessoas que decidiram entender seus padrões e mudaram o rumo dos seus relacionamentos.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          {testimonials.length === 0 ? (
            <p className="text-center text-text-muted py-20">Depoimentos em breve.</p>
          ) : (
            <>
              {/* Stats bar */}
              <AnimateOnScroll>
                <div className="grid grid-cols-3 gap-4 mb-14">
                  {[
                    { value: `${testimonials.length}+`, label: 'Depoimentos' },
                    { value: '⭐ 5.0', label: 'Avaliação média' },
                    { value: '10k+', label: 'Pessoas impactadas' },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-surface p-5 text-center">
                      <p className="font-heading text-2xl md:text-3xl font-medium text-text-primary">{stat.value}</p>
                      <p className="text-text-muted text-xs mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {testimonials.map((testimonial, i) => (
                  <AnimateOnScroll key={testimonial.id} delay={i * 70}>
                    <TestimonialCard testimonial={testimonial} />
                  </AnimateOnScroll>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <AnimateOnScroll>
            <div className="mt-16 rounded-2xl border border-white/5 bg-surface p-10 text-center">
              <h2 className="font-heading text-3xl font-light text-text-primary mb-3">
                Pronto para escrever a sua história?
              </h2>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed max-w-md mx-auto">
                Comece com o guia gratuito e dê o primeiro passo em direção a relacionamentos mais conscientes e saudáveis.
              </p>
              <Link
                href="/free-guide"
                className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all"
              >
                Baixar Guia Gratuito
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
