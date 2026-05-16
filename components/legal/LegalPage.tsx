import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface Props {
  label: string;
  title: React.ReactNode;
  intro: React.ReactNode;
  lastUpdated: string;
  sections: LegalSection[];
  contactEmail?: string;
  contactSubject?: string;
  contactCta?: string;
}

export default function LegalPage({
  label,
  title,
  intro,
  lastUpdated,
  sections,
  contactEmail = 'contato@fatorintimo.com',
  contactSubject,
  contactCta = 'Falar com a equipe Fator Íntimo',
}: Props) {
  const mailtoHref = contactSubject
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(contactSubject)}`
    : `mailto:${contactEmail}`;

  return (
    <article className="relative">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-32 sm:pt-36 pb-12 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-3xl mx-auto">
          <AnimateOnScroll>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-muted hover:text-text-secondary text-xs tracking-wide mb-8 transition-colors"
            >
              <ArrowLeft size={13} /> Voltar ao site
            </Link>
            <span className="text-xs text-accent tracking-[0.4em] uppercase mb-5 block">
              {label}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-light text-text-primary leading-[1.05] mb-6 tracking-tight">
              {title}
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6 max-w-2xl">
              {intro}
            </p>
            <p className="text-text-muted text-xs tracking-wide">
              Última atualização: {lastUpdated}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── TABLE OF CONTENTS ───────────────────────────────── */}
      <section className="px-6 pb-6">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <nav
              aria-label="Sumário"
              className="rounded-2xl border border-white/[0.06] bg-surface/60 p-5 sm:p-6"
            >
              <p className="text-[10px] text-text-muted tracking-[0.3em] uppercase mb-4">
                Sumário
              </p>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 list-none">
                {sections.map((s, i) => (
                  <li key={s.id} className="flex items-baseline gap-3">
                    <span className="font-heading text-accent/40 text-xs font-medium tabular-nums w-5 flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <a
                      href={`#${s.id}`}
                      className="text-text-secondary hover:text-accent text-sm transition-colors leading-snug"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-3xl mx-auto">
          {sections.map((s, i) => (
            <AnimateOnScroll key={s.id}>
              <section
                id={s.id}
                className="scroll-mt-28 py-10 border-t border-white/[0.05] first:border-t-0"
              >
                <div className="flex items-baseline gap-4 mb-5">
                  <span className="font-heading text-accent/40 text-sm font-medium tabular-nums w-7 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-light text-text-primary leading-tight tracking-tight">
                    {s.title}
                  </h2>
                </div>
                <div className="legal-body pl-0 sm:pl-11 text-text-secondary text-[15px] leading-[1.75] space-y-4">
                  {s.body}
                </div>
              </section>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ── CONTACT CTA ──────────────────────────────────────── */}
      <section className="px-6 pb-28 pt-4">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="relative rounded-2xl border border-white/[0.06] bg-surface p-8 sm:p-10 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-accent" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-medium text-text-primary mb-1.5">
                    Alguma dúvida sobre este documento?
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Nossa equipe responde dúvidas, solicitações de direitos e pedidos formais com seriedade e em tempo hábil.
                  </p>
                </div>
                <a
                  href={mailtoHref}
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap"
                >
                  {contactCta}
                </a>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </article>
  );
}

/* ── Tiny content helpers ─────────────────────────────────────── */

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-text-secondary">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-none space-y-2.5 my-2">
      {children}
    </ul>
  );
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-5 text-text-secondary">
      <span
        className="absolute left-0 top-[0.7em] w-1.5 h-1.5 rounded-full bg-accent/60"
        aria-hidden
      />
      {children}
    </li>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-lg font-medium text-text-primary tracking-tight mt-6 mb-1">
      {children}
    </h3>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="text-text-primary font-medium">{children}</strong>;
}
