import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, PenLine, Users } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import PostCard from '@/components/community/PostCard';
import CategoryBadge from '@/components/community/CategoryBadge';
import { getCommunityPosts } from '@/lib/db';
import { COMMUNITY_CATEGORIES } from '@/lib/community';
import CommunityHeroButtons from './CommunityHeroButtons';

export const metadata: Metadata = {
  title: 'Comunidade Íntima',
  description: 'Um espaço seguro para conversas profundas sobre relacionamentos, emoções e autoconhecimento.',
};

export const dynamic = 'force-dynamic';

export default async function CommunidadePage() {
  const allPosts = await getCommunityPosts({ status: 'approved' });
  const featured = allPosts.filter((p) => p.featured || p.pinned).slice(0, 2);
  const recent = allPosts.filter((p) => !p.pinned).slice(0, 9);
  const totalMembers = 'alguns'; // placeholder until user count is real

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.07) 0%, transparent 60%)' }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(254,0,80,0.03) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,200,120,0.02) 0%, transparent 40%)',
        }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">
              Comunidade Íntima
            </span>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-light text-text-primary mb-6 leading-[1.0]">
              Um espaço para<br />
              <span style={{ color: '#fe0050' }}>conversas reais</span>
            </h1>

            <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Aqui não há julgamentos. Apenas pessoas reais compartilhando o que vivem, sentem e aprendem sobre relacionamentos, emoções e autoconhecimento.
            </p>

            <CommunityHeroButtons />

            <div className="flex items-center justify-center gap-6 mt-10 text-text-muted text-sm">
              <div className="flex items-center gap-1.5">
                <Users size={13} />
                <span>Comunidade em crescimento</span>
              </div>
              <span className="w-px h-3 bg-white/15" />
              <span>{allPosts.length} discussões ativas</span>
              <span className="w-px h-3 bg-white/15" />
              <span>Moderação humana</span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">

          {/* ── Categories ─────────────────────────────────── */}
          <AnimateOnScroll>
            <div className="mb-16">
              <p className="text-xs text-accent tracking-[0.3em] uppercase mb-6">Espaços de conversa</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {COMMUNITY_CATEGORIES.map((cat, i) => (
                  <AnimateOnScroll key={cat.slug} delay={i * 40}>
                    <Link
                      href={`/comunidade/categoria/${cat.slug}`}
                      className="group relative rounded-xl border border-white/5 bg-surface hover:border-accent/20 hover:bg-accent/4 p-4 text-center transition-all duration-300 block"
                    >
                      <span className="block text-2xl mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        {cat.icon}
                      </span>
                      <p className="text-text-primary text-xs font-medium leading-snug group-hover:text-accent transition-colors">
                        {cat.label}
                      </p>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {/* ── Featured ───────────────────────────────────── */}
          {featured.length > 0 && (
            <div className="mb-14">
              <AnimateOnScroll>
                <p className="text-xs text-accent tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
                  <span className="text-sm">✦</span> Conversas em destaque
                </p>
              </AnimateOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {featured.map((post, i) => (
                  <AnimateOnScroll key={post.id} delay={i * 80}>
                    <PostCard post={post} featured />
                  </AnimateOnScroll>
                ))}
              </div>
              {recent.length > 0 && <div className="border-t border-white/5 mt-12 mb-12" />}
            </div>
          )}

          {/* ── Recent posts ───────────────────────────────── */}
          {recent.length > 0 && (
            <div>
              <AnimateOnScroll>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs text-text-muted tracking-[0.3em] uppercase">Discussões recentes</p>
                  <Link href="/comunidade/nova-publicacao" className="text-xs text-accent hover:underline flex items-center gap-1">
                    <PenLine size={11} /> Nova discussão
                  </Link>
                </div>
              </AnimateOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recent.map((post, i) => (
                  <AnimateOnScroll key={post.id} delay={i * 50}>
                    <PostCard post={post} />
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          )}

          {/* ── Empty state ────────────────────────────────── */}
          {allPosts.length === 0 && (
            <AnimateOnScroll>
              <div className="text-center py-24">
                <p className="text-5xl mb-6 opacity-40">◎</p>
                <h2 className="font-heading text-2xl font-light text-text-primary mb-3">O espaço está pronto.</h2>
                <p className="text-text-muted text-sm mb-8 max-w-sm mx-auto">
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
          )}

          {/* ── CTA Section ────────────────────────────────── */}
          <AnimateOnScroll>
            <div className="mt-20 relative rounded-2xl border border-white/5 bg-surface p-10 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at bottom, rgba(254,0,80,0.04) 0%, transparent 60%)' }}
              />
              <div className="relative">
                <p className="text-xs text-accent tracking-widest uppercase mb-4">Rafael Moreira</p>
                <h2 className="font-heading text-3xl font-light text-text-primary mb-4">
                  Sua história pode ser<br />o espelho de alguém.
                </h2>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed max-w-lg mx-auto">
                  A Comunidade Íntima existe para que o que você viveu, sentiu e aprendeu não fique só dentro de você. Partilhe com cuidado.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/comunidade/nova-publicacao"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all"
                  >
                    <PenLine size={14} /> Compartilhar algo
                  </Link>
                  <Link
                    href="/free-guide"
                    className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-7 py-3.5 rounded-full text-sm transition-all"
                  >
                    Guia gratuito <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
