import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, Eye, Heart, Zap } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { getLocale, createT } from '@/lib/i18n';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sobre o Fator Íntimo',
  description: 'A história, a visão e o método por trás do Fator Íntimo — uma plataforma de psicologia das relações fundada por Rafael Moreira para ajudar pessoas a entender, transformar e dominar a forma como se conectam.',
  path: '/about',
  keywords: ['sobre fator íntimo', 'rafael moreira psicólogo', 'método fator íntimo'],
});

const PERSON_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Rafael Moreira',
  url: `${SITE_URL}/about`,
  jobTitle: 'Especialista em Psicologia das Relações',
  worksFor: { '@type': 'Organization', name: 'Fator Íntimo', url: SITE_URL },
  sameAs: [
    'https://www.instagram.com/fatorintimo/',
    'https://www.youtube.com/@fatorintimo',
  ],
};

export default async function AboutPage() {
  const locale = await getLocale();
  const t = createT(locale);

  const pillars = [
    { icon: '🧠', title: t('about.pillar1_title'), desc: t('about.pillar1_desc') },
    { icon: '⚡', title: t('about.pillar2_title'), desc: t('about.pillar2_desc') },
    { icon: '🔍', title: t('about.pillar3_title'), desc: t('about.pillar3_desc') },
    { icon: '🌱', title: t('about.pillar4_title'), desc: t('about.pillar4_desc') },
  ];

  const problems = [
    t('about.problem1'),
    t('about.problem2'),
    t('about.problem3'),
    t('about.problem4'),
    t('about.problem5'),
  ];

  const values = [
    { icon: Target, title: t('about.value1_title'), desc: t('about.value1_desc') },
    { icon: Eye,    title: t('about.value2_title'), desc: t('about.value2_desc') },
    { icon: Heart,  title: t('about.value3_title'), desc: t('about.value3_desc') },
    { icon: Zap,    title: t('about.value4_title'), desc: t('about.value4_desc') },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSONLD) }}
      />
      {/* ── HERO ── */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="max-w-4xl mx-auto text-center">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-widest uppercase mb-5 block">{t('about.label')}</span>
            <h1 className="font-heading font-light text-text-primary mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: '1.05' }}>
              {t('about.heading1')} <span style={{ color: '#fe0050' }}>{t('about.heading2')}</span>
            </h1>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              {t('about.desc')}
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
                <span className="text-xs text-accent tracking-widest uppercase mb-4 block">{t('about.origin_label')}</span>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-tight mb-6">
                  {t('about.origin_heading1')}
                  <span style={{ color: '#fe0050' }}> {t('about.origin_heading2')}</span>
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">{t('about.origin_p1')}</p>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">{t('about.origin_p2')}</p>
                <p className="text-text-secondary text-sm leading-relaxed">{t('about.origin_p3')}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right">
              <div className="space-y-3">
                <p className="text-text-muted text-xs tracking-widest uppercase mb-4">{t('about.problems_label')}</p>
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
              <span className="text-xs text-accent tracking-widest uppercase mb-4 block">{t('about.purpose_label')}</span>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary">
                {t('about.purpose_heading')} <span style={{ color: '#fe0050' }}>{t('about.purpose_heading2')}</span>
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimateOnScroll direction="left" delay={0}>
              <div className="relative p-8 rounded-2xl border border-white/5 bg-surface overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                <span className="text-xs text-accent tracking-widest uppercase mb-4 block">{t('about.mission_label')}</span>
                <h3 className="font-heading text-2xl font-medium text-text-primary mb-4">{t('about.mission_heading')}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{t('about.mission_desc')}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right" delay={100}>
              <div className="relative p-8 rounded-2xl border border-white/5 bg-surface overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                <span className="text-xs text-text-muted tracking-widest uppercase mb-4 block">{t('about.vision_label')}</span>
                <h3 className="font-heading text-2xl font-medium text-text-primary mb-4">{t('about.vision_heading')}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{t('about.vision_desc')}</p>
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
              <span className="text-xs text-accent tracking-widest uppercase mb-4 block">{t('about.pillars_label')}</span>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary">
                {t('about.pillars_heading1')} <span style={{ color: '#fe0050' }}>{t('about.pillars_heading2')}</span>
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
              <span className="text-xs text-accent tracking-widest uppercase mb-4 block">{t('about.values_label')}</span>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary">
                {t('about.values_heading1')} <span style={{ color: '#fe0050' }}>{t('about.values_heading2')}</span>
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
              <span className="text-xs text-accent tracking-widest uppercase mb-5 block">{t('about.founder_label')}</span>
              <blockquote className="font-heading text-2xl md:text-3xl font-light italic text-text-primary leading-relaxed mb-8">
                {t('about.founder_quote')}
              </blockquote>
              <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-heading text-accent text-lg">R</span>
              </div>
              <p className="text-text-primary text-sm font-medium">{t('about.founder_name')}</p>
              <p className="text-text-muted text-xs mt-1">{t('about.founder_role')}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 pb-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="font-heading text-3xl md:text-4xl font-light text-text-primary mb-4">
              {t('about.cta_heading')}
            </h2>
            <p className="text-text-secondary text-sm mb-8 leading-relaxed">{t('about.cta_desc')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/guia"
                className="group inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all">
                {t('about.cta_guides')} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/blog"
                className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-7 py-3.5 rounded-full text-sm transition-all">
                {t('about.cta_blog')}
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
