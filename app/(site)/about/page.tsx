import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, Eye, Heart, Zap } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Fator Íntimo é uma plataforma de psicologia dos relacionamentos, inteligência emocional e comportamento humano.',
};

const pillars = [
  {
    icon: '🧠',
    title: 'Psicologia Profunda',
    desc: 'Conteúdo baseado em teoria do apego, neurociência emocional e psicologia do comportamento. Nada superficial.',
  },
  {
    icon: '⚡',
    title: 'Inteligência Emocional',
    desc: 'Ferramentas reais para reconhecer padrões, regular emoções e tomar decisões melhores no amor.',
  },
  {
    icon: '🔍',
    title: 'Atração e Comportamento',
    desc: 'Entenda os mecanismos invisíveis que governam atração, conexão e afastamento entre pessoas.',
  },
  {
    icon: '🌱',
    title: 'Transformação Real',
    desc: 'Mudança de padrão real. Da raiz, não de comportamento superficial.',
  },
];

const problems = [
  'Pessoas inteligentes que tomam decisões péssimas no amor',
  'Relacionamentos que iniciam com intensidade e terminam em confusão',
  'A incapacidade de comunicar o que realmente se sente',
  'O ciclo de atrair pessoas que não valorizam de volta',
  'A solidão emocional mesmo estando em relacionamentos',
];

const values = [
  {
    icon: Target,
    title: 'Profundidade',
    desc: 'Nunca vamos simplificar o que é complexo por conveniência. A realidade emocional merece respeito intelectual.',
  },
  {
    icon: Eye,
    title: 'Clareza',
    desc: 'Conceitos complexos explicados com precisão e acessibilidade. Sem jargão, sem sensacionalismo.',
  },
  {
    icon: Heart,
    title: 'Humanidade',
    desc: 'Reconhecemos que errar em relacionamentos não é fraqueza. É humano. E é o ponto de partida para a consciência.',
  },
  {
    icon: Zap,
    title: 'Aplicabilidade',
    desc: 'Conhecimento que não se traduz em mudança real não serve. Cada conteúdo tem propósito prático.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="max-w-4xl mx-auto text-center">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-widest uppercase mb-5 block">Sobre a Plataforma</span>
            <h1 className="font-heading font-light text-text-primary mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: '1.05' }}>
              O que é o <span style={{ color: '#fe0050' }}>Fator Íntimo?</span>
            </h1>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Uma plataforma focada em psicologia dos relacionamentos, inteligência emocional, atração
              e comportamento humano, para quem quer entender o amor com profundidade real.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section className="py-20 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimateOnScroll direction="left">
              <div>
                <span className="text-xs text-accent tracking-widest uppercase mb-4 block">A Origem</span>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-tight mb-6">
                  Por que o Fator Íntimo
                  <span style={{ color: '#fe0050' }}> existe</span>
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  Existe um paradoxo moderno: nunca tivemos acesso a tanto conteúdo sobre relacionamentos
                  e nunca estivemos tão perdidos neles. Dicas, técnicas e listas de "o que fazer" se
                  multiplicam, mas a confusão emocional persiste.
                </p>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  O Fator Íntimo nasceu da percepção de que o problema não é falta de informação.
                  É falta de <strong className="text-text-primary">compreensão real</strong>. Compreensão dos
                  mecanismos que governam atração, apego, afastamento e conexão, e de como esses mecanismos
                  operam dentro de cada pessoa.
                </p>
                <p className="text-text-secondary text-sm leading-relaxed">
                  A plataforma foi criada para preencher essa lacuna: não com mais conselhos genéricos,
                  mas com psicologia aplicada, honesta e acessível, para quem leva a vida emocional a sério.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right">
              <div className="space-y-3">
                <p className="text-text-muted text-xs tracking-widest uppercase mb-4">
                  O problema que vimos
                </p>
                {problems.map((p, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-surface">
                    <span className="text-accent/40 font-heading text-xl font-light flex-shrink-0 leading-tight mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-text-secondary text-sm leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── MISSION + VISION ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Propósito</span>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary">
                Missão e <span style={{ color: '#fe0050' }}>Visão</span>
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimateOnScroll direction="left" delay={0}>
              <div className="relative p-8 rounded-2xl border border-white/5 bg-surface overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Missão</span>
                <h3 className="font-heading text-2xl font-medium text-text-primary mb-4">
                  Ajudar pessoas a entenderem o amor com profundidade e construírem relações mais conscientes.
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Acreditamos que consciência emocional não é luxo: é uma necessidade humana. Nossa missão
                  é democratizar o acesso a psicologia real e aplicada, tornando-a acessível a qualquer
                  pessoa disposta a olhar para dentro com honestidade.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right" delay={100}>
              <div className="relative p-8 rounded-2xl border border-white/5 bg-surface overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                <span className="text-xs text-text-muted tracking-widest uppercase mb-4 block">Visão</span>
                <h3 className="font-heading text-2xl font-medium text-text-primary mb-4">
                  Ser a referência em conteúdo de psicologia dos relacionamentos no Brasil.
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Não como mais um canal de dicas. Mas como uma plataforma que genuinamente eleva o nível
                  do que se discute sobre amor, atração e comportamento humano, rigorosa o suficiente para
                  ser confiável, acessível o suficiente para transformar.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── 4 PILLARS ── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Pilares</span>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary">
                Sobre o que <span style={{ color: '#fe0050' }}>falamos</span>
              </h2>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pillars.map((p, i) => (
              <AnimateOnScroll key={i} delay={i * 80}>
                <div className="p-6 rounded-2xl border border-white/5 bg-surface hover:border-accent/15 transition-all duration-300">
                  <span className="text-3xl mb-4 block">{p.icon}</span>
                  <h3 className="font-heading text-xl font-medium text-text-primary mb-2">{p.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{p.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-14">
              <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Valores</span>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary">
                O que nos <span style={{ color: '#fe0050' }}>guia</span>
              </h2>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <AnimateOnScroll key={i} delay={i * 70}>
                <div className="p-6 rounded-2xl border border-white/5 bg-surface text-center">
                  <div className="w-10 h-10 rounded-full border border-accent/20 bg-accent/5 flex items-center justify-center mx-auto mb-4">
                    <v.icon size={16} className="text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-medium text-text-primary mb-2">{v.title}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed">{v.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER NOTE ── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="relative p-10 rounded-3xl border border-white/5 bg-surface text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <span className="text-xs text-accent tracking-widest uppercase mb-5 block">Quem Criou</span>
              <blockquote className="font-heading text-2xl md:text-3xl font-light italic text-text-primary leading-relaxed mb-8">
                &ldquo;Criei o Fator Íntimo porque acredito que entender nossas emoções é o ato mais corajoso
               , e o mais transformador, que um ser humano pode fazer.&rdquo;
              </blockquote>
              <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-heading text-accent text-lg">R</span>
              </div>
              <p className="text-text-primary text-sm font-medium">Rafael Moreira</p>
              <p className="text-text-muted text-xs mt-1">Fundador, Fator Íntimo</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 pb-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="font-heading text-3xl md:text-4xl font-light text-text-primary mb-4">
              Pronto para começar?
            </h2>
            <p className="text-text-secondary text-sm mb-8 leading-relaxed">
              Explore a biblioteca de guias gratuitos. Comece pelo que ressoa com o que você vive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/guia"
                className="group inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all"
              >
                Explorar Guias <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-7 py-3.5 rounded-full text-sm transition-all"
              >
                Ler Artigos
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
