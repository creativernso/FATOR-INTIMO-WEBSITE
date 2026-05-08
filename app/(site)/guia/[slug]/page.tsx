import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { getGuideBySlug, getGuides } from '@/lib/db';
import GuideSubscribeForm from './GuideSubscribeForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide?.published) return {};
  return {
    title: `${guide.title} — Biblioteca Emocional`,
    description: guide.subtitle || guide.description.slice(0, 160),
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [guide, allGuides] = await Promise.all([getGuideBySlug(slug), getGuides(true)]);

  if (!guide?.published) notFound();

  const related = allGuides.filter((g) => g.id !== guide.id && g.published).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 55%)' }}
        />
        <div className="relative max-w-6xl mx-auto">
          <AnimateOnScroll>
            <Link
              href="/guia"
              className="inline-flex items-center gap-1.5 text-text-muted text-xs hover:text-accent transition-colors mb-10"
            >
              <ArrowLeft size={11} /> Todos os guias
            </Link>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Left — Content */}
            <AnimateOnScroll>
              <div>
                {guide.tags && guide.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {guide.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-accent border border-accent/20 rounded-full px-2.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <span className="text-xs text-accent tracking-[0.3em] uppercase mb-4 block">
                  Biblioteca Emocional · Gratuito
                </span>

                <h1 className="font-heading text-4xl sm:text-5xl font-light text-text-primary leading-[1.08] mb-5">
                  {guide.title}
                </h1>

                {guide.subtitle && (
                  <p className="text-text-secondary text-lg leading-relaxed mb-6 font-light">
                    {guide.subtitle}
                  </p>
                )}

                {guide.emotionalHook && (
                  <p className="text-text-muted text-base leading-relaxed mb-8 border-l-2 border-accent/30 pl-4 italic">
                    {guide.emotionalHook}
                  </p>
                )}

                {guide.description && (
                  <p className="text-text-secondary text-sm leading-relaxed mb-8">
                    {guide.description}
                  </p>
                )}

                {guide.bullets && guide.bullets.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <p className="text-xs text-text-muted tracking-widest uppercase mb-4">O que você vai aprender</p>
                    {guide.bullets.map((bullet, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={10} className="text-accent" />
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed">{bullet}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-accent/20"
                    style={{ background: 'radial-gradient(circle, rgba(254,0,80,0.15), transparent)' }}
                  >
                    <span className="text-accent text-sm font-semibold">R</span>
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{guide.authorName || 'Rafael Moreira'}</p>
                    <p className="text-text-muted text-xs">{guide.authorRole || 'Especialista em Psicologia das Relações'}</p>
                    {guide.authorQuote && (
                      <p className="text-text-muted text-xs mt-2 leading-relaxed italic">&ldquo;{guide.authorQuote}&rdquo;</p>
                    )}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Right — Cover + Form */}
            <div className="space-y-6">
              <AnimateOnScroll delay={120}>
                {/* Cover image */}
                {guide.coverImage ? (
                  <div className="relative w-full overflow-hidden rounded-2xl border border-white/8" style={{ aspectRatio: '4/3' }}>
                    <img
                      src={guide.coverImage}
                      alt={guide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/30 to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div
                    className="relative w-full rounded-2xl border border-white/6 flex items-center justify-center"
                    style={{ aspectRatio: '4/3', background: 'radial-gradient(ellipse at center, rgba(254,0,80,0.06), transparent)' }}
                  >
                    <BookOpen size={52} className="text-accent/15" />
                  </div>
                )}
              </AnimateOnScroll>

              <AnimateOnScroll delay={180}>
                {/* Form card */}
                <div
                  className="rounded-2xl border border-white/8 bg-surface p-6 sm:p-8"
                  style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
                >
                  <GuideSubscribeForm
                    slug={slug}
                    formTitle={guide.formTitle}
                    formSubtitle={guide.formSubtitle}
                    ctaText={guide.ctaText}
                    successTitle={guide.successTitle}
                    successMessage={guide.successMessage}
                    hasPdf={!!guide.pdfPath}
                  />
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Related guides */}
      {related.length > 0 && (
        <section className="px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="border-t border-white/5 pt-14">
              <AnimateOnScroll>
                <p className="text-xs text-text-muted tracking-[0.3em] uppercase mb-8">Outros guias gratuitos</p>
              </AnimateOnScroll>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((g, i) => (
                  <AnimateOnScroll key={g.id} delay={i * 60}>
                    <Link href={`/guia/${g.slug}`} className="group block">
                      <div className="rounded-xl border border-white/5 bg-surface p-5 h-full transition-all duration-200 hover:border-accent/20 hover:bg-accent/3">
                        {g.coverImage && (
                          <div className="relative w-full overflow-hidden rounded-lg mb-4" style={{ aspectRatio: '16/9' }}>
                            <img src={g.coverImage} alt={g.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h3 className="text-text-primary text-sm font-medium leading-snug group-hover:text-accent transition-colors mb-1">
                          {g.title}
                        </h3>
                        {g.emotionalHook && (
                          <p className="text-text-muted text-xs leading-relaxed line-clamp-2">{g.emotionalHook}</p>
                        )}
                        <div className="flex items-center gap-1 text-accent text-xs mt-3">
                          Acessar <ArrowRight size={10} />
                        </div>
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
