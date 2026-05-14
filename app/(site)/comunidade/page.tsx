import type { Metadata } from 'next';
import Link from 'next/link';
import { PenLine, ArrowRight, TrendingUp, BookOpen, Users, MessageSquare } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import CategoryBadge from '@/components/community/CategoryBadge';
import FeedClient from '@/components/community/FeedClient';
import { getCommunityPosts } from '@/lib/db';
import { COMMUNITY_CATEGORIES } from '@/lib/community';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Comunidade Íntima',
  description: 'Conversas reais sobre relacionamentos, emoções e autoconhecimento. Junte-se a milhares de pessoas que estão entendendo a fundo o próprio amor e suas relações.',
  path: '/comunidade',
  keywords: ['comunidade psicologia das relações', 'fórum amor', 'grupo autoconhecimento', 'comunidade íntima'],
});

export const dynamic = 'force-dynamic';

export default async function ComunidadePage() {
  const allPosts = await getCommunityPosts({ status: 'approved' });

  const trending = [...allPosts]
    .sort((a, b) => b.reactionCount + b.commentCount - (a.reactionCount + a.commentCount))
    .slice(0, 5);

  return (
    <>
      {/* ── Compact Hero ───────────────────────────────────────── */}
      <section className="relative pt-32 pb-10 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] text-accent tracking-[0.35em] uppercase mb-3 block">
                  Comunidade Íntima
                </span>
                <h1 className="font-heading text-4xl sm:text-5xl font-light text-text-primary leading-[1.05] sm:whitespace-nowrap">
                  {'Um espaço para '}
                  <br className="sm:hidden" />
                  <span style={{ color: '#fe0050' }}>conversas reais</span>
                </h1>
                <p className="text-text-secondary text-sm leading-relaxed mt-3 max-w-md sm:max-w-none sm:whitespace-nowrap">
                  Sem julgamentos. Pessoas reais compartilhando o que vivem, sentem e aprendem.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 flex-shrink-0">
                <Link
                  href="/comunidade/nova-publicacao"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
                >
                  <PenLine size={14} /> Nova publicação
                </Link>
                <Link
                  href="/comunidade/nova-publicacao?anonymous=true"
                  className="inline-flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/20 text-text-muted hover:text-text-secondary px-5 py-2.5 rounded-full text-xs transition-all whitespace-nowrap"
                >
                  Publicar anonimamente
                </Link>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-5 mt-8 text-text-muted text-xs">
              <div className="flex items-center gap-1.5">
                <MessageSquare size={12} />
                <span>{allPosts.length} discussões ativas</span>
              </div>
              <span className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <Users size={12} />
                <span>Comunidade em crescimento</span>
              </div>
              <span className="w-px h-3 bg-white/10 hidden sm:block" />
              <span className="hidden sm:block">Moderação humana</span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Three-column layout ────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-6 items-start">

            {/* ── Left sidebar ───────────────────────────────── */}
            <aside className="hidden lg:flex flex-col gap-4 w-52 flex-shrink-0 sticky top-24">

              {/* New post CTA */}
              <Link
                href="/comunidade/nova-publicacao"
                className="flex items-center gap-2 bg-accent/10 hover:bg-accent/15 border border-accent/20 text-accent px-4 py-3 rounded-xl text-sm font-medium transition-all"
              >
                <PenLine size={14} /> Nova publicação
              </Link>

              {/* Categories */}
              <div className="rounded-xl border border-white/5 bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase font-medium">Categorias</p>
                </div>
                <div className="p-2">
                  {COMMUNITY_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/comunidade/categoria/${cat.slug}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/4 text-text-muted hover:text-text-primary text-xs transition-all group"
                    >
                      <span className="opacity-60 group-hover:opacity-90 text-sm">{cat.icon}</span>
                      <span className="leading-snug">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Anon note */}
              <div className="rounded-xl border border-white/5 bg-surface p-4">
                <p className="text-[10px] text-accent tracking-widest uppercase mb-2 font-medium">Anônimo</p>
                <p className="text-text-muted text-xs leading-relaxed">
                  Você pode publicar anonimamente a qualquer momento. Sem exposição.
                </p>
                <Link
                  href="/comunidade/nova-publicacao?anonymous=true"
                  className="mt-3 text-[11px] text-accent hover:underline flex items-center gap-1"
                >
                  Publicar anonimamente <ArrowRight size={10} />
                </Link>
              </div>
            </aside>

            {/* ── Main feed ──────────────────────────────────── */}
            <main className="flex-1 min-w-0">

              {/* Mobile: category pills */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-1 px-1">
                {COMMUNITY_CATEGORIES.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/comunidade/categoria/${cat.slug}`}
                    className="flex items-center gap-1.5 bg-white/4 border border-white/8 hover:border-accent/20 text-text-muted hover:text-text-primary px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all flex-shrink-0"
                  >
                    <span className="text-sm">{cat.icon}</span>
                    {cat.label}
                  </Link>
                ))}
                <Link
                  href="/comunidade/nova-publicacao"
                  className="flex items-center gap-1 bg-accent/15 border border-accent/25 text-accent px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap flex-shrink-0 font-medium"
                >
                  <PenLine size={10} /> Publicar
                </Link>
              </div>

              {/* Feed */}
              {allPosts.length === 0 ? (
                <AnimateOnScroll>
                  <div className="text-center py-32 border border-white/5 rounded-2xl bg-surface">
                    <p className="text-5xl mb-5 opacity-20">◎</p>
                    <h2 className="font-heading text-2xl font-light text-text-primary mb-3">O espaço está pronto.</h2>
                    <p className="text-text-muted text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                      Seja o primeiro a trazer uma conversa real para a Comunidade Íntima.
                    </p>
                    <Link
                      href="/comunidade/nova-publicacao"
                      className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full text-sm font-medium transition-all"
                    >
                      <PenLine size={14} /> Iniciar uma conversa
                    </Link>
                  </div>
                </AnimateOnScroll>
              ) : (
                <FeedClient posts={allPosts} />
              )}
            </main>

            {/* ── Right sidebar ──────────────────────────────── */}
            <aside className="hidden xl:flex flex-col gap-4 w-60 flex-shrink-0 sticky top-24">

              {/* Trending */}
              {trending.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-surface overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                    <TrendingUp size={11} className="text-accent" />
                    <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase font-medium">Em alta agora</p>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    {trending.map((post, i) => (
                      <Link
                        key={post.id}
                        href={`/comunidade/${post.id}`}
                        className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/4 transition-all group"
                      >
                        <span className="text-[10px] text-text-muted font-heading mt-0.5 w-4 flex-shrink-0 text-center">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-text-secondary group-hover:text-text-primary transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <CategoryBadge slug={post.category} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Rafael card */}
              <div className="rounded-xl border border-accent/10 bg-surface p-4 relative overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top right, rgba(254,0,80,0.06) 0%, transparent 60%)' }}
                />
                <div className="relative">
                  <p className="text-[10px] text-accent tracking-widest uppercase mb-3 font-medium">Rafael Moreira</p>
                  <p className="text-text-secondary text-xs leading-relaxed italic mb-3">
                    "A sua história pode ser o espelho de alguém que ainda não encontrou palavras para o que sente."
                  </p>
                  <p className="text-text-muted text-[11px]">Acompanha a comunidade diretamente.</p>
                </div>
              </div>

              {/* Guides CTA */}
              <div className="rounded-xl border border-white/5 bg-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={12} className="text-text-muted" />
                  <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase font-medium">Guias gratuitos</p>
                </div>
                <p className="text-text-muted text-xs leading-relaxed mb-3">
                  Aprofunde o que você lê na comunidade com guias de psicologia emocional.
                </p>
                <Link
                  href="/guia"
                  className="flex items-center gap-1.5 text-[11px] text-accent hover:underline"
                >
                  Explorar guias <ArrowRight size={10} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
