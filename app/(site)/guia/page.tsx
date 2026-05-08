import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { getGuides } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Guias Gratuitos — Fator Íntimo',
  description: 'Materiais psicológicos gratuitos para quem quer entender relacionamentos, emoções e autoconhecimento com profundidade.',
};

export const dynamic = 'force-dynamic';

export default async function GuiaLibraryPage() {
  const guides = await getGuides(true);
  const featured = guides.filter((g) => g.featured);
  const rest = guides.filter((g) => !g.featured);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.07) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">
              Biblioteca Gratuita
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl font-light text-text-primary mb-6 leading-[1.05]">
              Conhecimento que<br />
              <span style={{ color: '#fe0050' }}>transforma relações</span>
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Guias psicológicos gratuitos criados por Rafael Moreira para quem quer entender, de verdade, o que acontece dentro das relações — e dentro de si mesmo.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">

          {/* Featured guides */}
          {featured.length > 0 && (
            <div className="mb-16">
              <AnimateOnScroll>
                <p className="text-xs text-accent tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                  <span>✦</span> Em destaque
                </p>
              </AnimateOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((guide, i) => (
                  <AnimateOnScroll key={guide.id} delay={i * 80}>
                    <Link href={`/guia/${guide.slug}`} className="group block">
                      <div
                        className="relative rounded-2xl border border-white/8 bg-surface overflow-hidden transition-all duration-300 group-hover:border-accent/25 group-hover:shadow-lg group-hover:shadow-accent/5"
                        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
                      >
                        {/* Cover image */}
                        {guide.coverImage ? (
                          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/7' }}>
                            <img
                              src={guide.coverImage}
                              alt={guide.title}
                              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
                          </div>
                        ) : (
                          <div
                            className="relative w-full flex items-center justify-center"
                            style={{ aspectRatio: '16/7', background: 'radial-gradient(ellipse at center, rgba(254,0,80,0.08), transparent)' }}
                          >
                            <BookOpen size={40} className="text-accent/20" />
                          </div>
                        )}

                        <div className="p-6">
                          {guide.tags && guide.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {guide.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] text-text-muted border border-white/8 rounded-full px-2 py-0.5">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <h2 className="font-heading text-xl font-light text-text-primary mb-2 leading-snug group-hover:text-accent transition-colors">
                            {guide.title}
                          </h2>
                          {guide.subtitle && (
                            <p className="text-text-muted text-sm mb-4 leading-relaxed">{guide.subtitle}</p>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-accent text-sm font-medium">
                            Acessar guia <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>

              {rest.length > 0 && <div className="border-t border-white/5 mt-14 mb-14" />}
            </div>
          )}

          {/* All guides */}
          {rest.length > 0 && (
            <div>
              {featured.length > 0 && (
                <AnimateOnScroll>
                  <p className="text-xs text-text-muted tracking-[0.3em] uppercase mb-8">Todos os guias</p>
                </AnimateOnScroll>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((guide, i) => (
                  <AnimateOnScroll key={guide.id} delay={i * 50}>
                    <Link href={`/guia/${guide.slug}`} className="group block h-full">
                      <div className="relative rounded-2xl border border-white/5 bg-surface overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:border-accent/20 group-hover:bg-accent/3">
                        {guide.coverImage ? (
                          <div className="relative w-full overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/9' }}>
                            <img
                              src={guide.coverImage}
                              alt={guide.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 to-transparent" />
                          </div>
                        ) : (
                          <div
                            className="relative w-full flex items-center justify-center flex-shrink-0"
                            style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(254,0,80,0.05) 0%, transparent 60%)' }}
                          >
                            <BookOpen size={28} className="text-accent/15" />
                          </div>
                        )}

                        <div className="p-5 flex flex-col flex-1">
                          {guide.tags && guide.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {guide.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[9px] text-text-muted border border-white/6 rounded-full px-1.5 py-0.5">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <h3 className="font-heading text-base font-light text-text-primary leading-snug mb-1.5 group-hover:text-accent transition-colors flex-1">
                            {guide.title}
                          </h3>
                          {guide.emotionalHook && (
                            <p className="text-text-muted text-xs leading-relaxed mb-3 line-clamp-2">{guide.emotionalHook}</p>
                          )}
                          <div className="flex items-center gap-1 text-accent text-xs font-medium mt-auto">
                            Acessar <ArrowRight size={11} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {guides.length === 0 && (
            <AnimateOnScroll>
              <div className="text-center py-32">
                <BookOpen size={40} className="text-white/10 mx-auto mb-4" />
                <h2 className="font-heading text-2xl font-light text-text-primary mb-3">Em breve.</h2>
                <p className="text-text-muted text-sm max-w-sm mx-auto">
                  Os primeiros guias gratuitos de Rafael Moreira estão sendo preparados.
                </p>
              </div>
            </AnimateOnScroll>
          )}
        </div>
      </section>
    </>
  );
}
