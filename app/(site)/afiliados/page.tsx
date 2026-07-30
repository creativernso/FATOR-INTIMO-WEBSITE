import type { Metadata } from 'next';
import { Link2, Megaphone, Wallet, Sparkles } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import AffiliateApplyForm from './AffiliateApplyForm';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Programa de Afiliados',
  description: 'Indique o Fator Íntimo e ganhe comissão em cada venda. Cadastre-se gratuitamente e receba seu link de afiliado.',
  path: '/afiliados',
  keywords: ['programa de afiliados', 'ganhar dinheiro indicando', 'afiliado fator íntimo'],
});

const STEPS = [
  {
    icon: Link2,
    title: 'Receba seu link',
    desc: 'Após aprovação, você recebe um link único de afiliado para compartilhar onde quiser.',
  },
  {
    icon: Megaphone,
    title: 'Divulgue',
    desc: 'Compartilhe nas redes, no WhatsApp, no blog: qualquer lugar onde sua audiência esteja.',
  },
  {
    icon: Wallet,
    title: 'Ganhe comissão',
    desc: 'A cada venda feita pelo seu link, você recebe uma comissão. Acompanhe tudo no seu painel.',
  },
];

export default function AffiliatesPage() {
  return (
    <>
      <section className="pt-36 pb-16 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-2xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">Programa de Afiliados</span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5 leading-[1.05]">
              Indique e <span style={{ color: '#fe0050' }}>ganhe</span>.
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mb-8">
              Se você já fala sobre relacionamentos, psicologia ou autoconhecimento para sua audiência, transforme isso em renda. Indique o Fator Íntimo e receba comissão em cada venda.
            </p>
            <div className="inline-flex items-center gap-2 border border-accent/30 bg-accent/5 text-accent px-5 py-2.5 rounded-full text-sm font-medium">
              <Sparkles size={14} /> 20% de comissão por venda
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-2xl border border-white/5 bg-surface p-6 text-center relative">
                  <div className="absolute top-4 right-5 text-text-muted/30 font-heading text-3xl">{i + 1}</div>
                  <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                    <step.icon size={18} className="text-accent" />
                  </div>
                  <h3 className="text-text-primary font-medium text-sm mb-1.5">{step.title}</h3>
                  <p className="text-text-muted text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll>
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl font-light text-text-primary mb-2">Quero participar</h2>
              <p className="text-text-muted text-sm">Preencha os dados abaixo. Sua solicitação é analisada manualmente.</p>
            </div>
            <AffiliateApplyForm />
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
