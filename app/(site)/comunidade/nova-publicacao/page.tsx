import type { Metadata } from 'next';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import CreatePostForm from './CreatePostForm';

export const metadata: Metadata = {
  title: 'Nova publicação — Comunidade Íntima',
  description: 'Compartilhe sua história, reflexão ou pergunta com a Comunidade Íntima.',
};

export default function NovaPublicacaoPage() {
  return (
    <>
      <section className="pt-36 pb-10 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-2xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">
              Comunidade Íntima
            </span>
            <h1 className="font-heading text-5xl font-light text-text-primary mb-5 leading-[1.05]">
              Compartilhe algo <span style={{ color: '#fe0050' }}>real</span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-lg mx-auto">
              Este espaço é seguro. Escreva com autenticidade. Sua publicação será revisada antes de aparecer na comunidade.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <AnimateOnScroll>
        <CreatePostForm />
      </AnimateOnScroll>
    </>
  );
}
