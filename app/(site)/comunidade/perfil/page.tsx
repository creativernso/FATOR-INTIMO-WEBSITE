import type { Metadata } from 'next';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Meu Perfil — Comunidade Íntima',
};

export default function PerfilPage() {
  return (
    <>
      <section className="pt-36 pb-10 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">Comunidade Íntima</span>
            <h1 className="font-heading text-4xl font-light text-text-primary mb-4">Meu Perfil</h1>
          </AnimateOnScroll>
        </div>
      </section>
      <AnimateOnScroll>
        <ProfileClient />
      </AnimateOnScroll>
    </>
  );
}
