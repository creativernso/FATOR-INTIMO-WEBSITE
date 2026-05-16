import type { Metadata } from 'next';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import SubmitForm from '../SubmitForm';

export const metadata: Metadata = {
  title: 'Compartilhe sua história | Fator Íntimo',
  description: 'Conte como o Fator Íntimo transformou sua perspectiva sobre relacionamentos.',
};

export default function SubmitTestimonialPage() {
  return (
    <>
      <section className="pt-36 pb-12 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.07) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-2xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">
              Comunidade
            </span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5 leading-[1.05]">
              Compartilhe sua{' '}
              <span style={{ color: '#fe0050' }}>história</span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-lg mx-auto">
              Sua transformação pode ser o espelho que alguém precisa ver para acreditar que também é possível mudar.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <AnimateOnScroll>
        <SubmitForm />
      </AnimateOnScroll>
    </>
  );
}
