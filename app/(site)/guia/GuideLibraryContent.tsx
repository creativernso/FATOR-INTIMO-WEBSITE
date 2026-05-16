'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Download, TrendingUp, Sparkles, Clock } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { useLocale } from '@/components/LocaleProvider';
import { Locale } from '@/lib/i18n';
import { Guide } from '@/lib/types';

type SortMode = 'recentes' | 'downloads' | 'destaque';

interface Props {
  guides: Guide[];
  locale: Locale;
}

export default function GuideLibraryContent({ guides }: Props) {
  const { t } = useLocale();
  const [activeTag, setActiveTag] = useState<string>('todos');
  const [sort, setSort] = useState<SortMode>('recentes');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    guides.forEach((g) => {
      if (g.category) tags.add(g.category);
      (g.tags ?? []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).slice(0, 10);
  }, [guides]);

  const featured = useMemo(() => guides.filter((g) => g.featured), [guides]);

  const filtered = useMemo(() => {
    let list = guides.filter((g) => !g.featured);
    if (activeTag !== 'todos') {
      list = list.filter(
        (g) => g.category === activeTag || (g.tags ?? []).includes(activeTag)
      );
    }
    if (sort === 'downloads') list = [...list].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0));
    else if (sort === 'destaque') list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [guides, activeTag, sort]);

  const totalDownloads = guides.reduce((s, g) => s + (g.downloadCount ?? 0), 0);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-14 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[560px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 55%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 5% 80%, rgba(254,0,80,0.03), transparent 40%), radial-gradient(circle at 95% 20%, rgba(255,180,100,0.02), transparent 40%)' }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.4em] uppercase mb-6 block">
              {t('library.badge')}
            </span>
            <h1 className="font-heading text-3xl sm:text-6xl md:text-7xl font-light text-text-primary leading-[1.1] sm:leading-[1.0] mb-8 sm:mb-10">
              {t('library.headline_1')}<br />
              <span style={{ color: '#fe0050' }}>{t('library.headline_2')}</span>
            </h1>

            {/* Stats strip */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-text-muted text-sm">
              <div className="flex items-center gap-1.5">
                <BookOpen size={13} />
                <span>{guides.length} {t(guides.length === 1 ? 'library.guide_one' : 'library.guide_other')}</span>
              </div>
              <span className="w-px h-3 bg-white/[0.08] hidden sm:block" />
              {totalDownloads > 0 && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Download size={13} />
                    <span>{totalDownloads.toLocaleString('pt-BR')} downloads</span>
                  </div>
                  <span className="w-px h-3 bg-white/[0.08] hidden sm:block" />
                </>
              )}
              <span>{t('library.stats_free')}</span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Featured guides ───────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll>
              <div className="flex items-center gap-2 mb-8">
                <Sparkles size={12} className="text-accent" />
                <p className="text-xs text-accent tracking-[0.3em] uppercase">{t('library.featured_label')}</p>
              </div>
            </AnimateOnScroll>

            <div className={`grid gap-5 ${featured.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : featured.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {featured.map((guide, i) => (
                <AnimateOnScroll key={guide.id} delay={i * 80}>
                  <GuidePortraitCard guide={guide} large />
                </AnimateOnScroll>
              ))}
            </div>

            <div className="border-t border-white/[0.04] mt-14" />
          </div>
        </section>
      )}

      {/* ── Filter + Sort ─────────────────────────────────────── */}
      <section className="px-6 sticky top-[72px] z-20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto py-2.5 sm:py-4 border-b border-white/[0.04]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">

            {/* Tag filter — horizontal scroll on mobile, wrap on desktop */}
            <div
              className="flex items-center gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {['todos', ...allTags].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTag === tag
                      ? 'bg-accent text-white'
                      : 'bg-white/[0.03] border border-white/[0.06] text-text-muted hover:border-white/[0.1] hover:text-text-secondary'
                  }`}
                >
                  {tag === 'todos' ? t('library.filter_all') : tag}
                </button>
              ))}
            </div>

            {/* Sort — compact on mobile, centered; right-aligned on desktop */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-1 flex-shrink-0 self-center sm:self-auto">
              {[
                { id: 'recentes' as SortMode, icon: Clock, label: t('library.sort_recent') },
                { id: 'downloads' as SortMode, icon: TrendingUp, label: t('library.sort_popular') },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSort(id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all ${
                    sort === id ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Guide grid ────────────────────────────────────────── */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto pt-12">

          {filtered.length === 0 && guides.length === 0 ? (
            <AnimateOnScroll>
              <div className="text-center py-32">
                <BookOpen size={44} className="text-white/8 mx-auto mb-5" />
                <h2 className="font-heading text-2xl font-light text-text-primary mb-3">{t('library.empty_title')}</h2>
                <p className="text-text-muted text-sm max-w-sm mx-auto leading-relaxed">
                  {t('library.empty_text')}
                </p>
              </div>
            </AnimateOnScroll>
          ) : filtered.length === 0 ? (
            <AnimateOnScroll>
              <div className="text-center py-20">
                <p className="text-text-muted text-sm">{t('library.empty_category')}</p>
                <button onClick={() => setActiveTag('todos')} className="mt-4 text-accent text-sm hover:underline">
                  {t('library.empty_category_cta')}
                </button>
              </div>
            </AnimateOnScroll>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filtered.map((guide, i) => (
                  <AnimateOnScroll key={guide.id} delay={i * 40}>
                    <GuidePortraitCard guide={guide} />
                  </AnimateOnScroll>
                ))}
              </div>

              <AnimateOnScroll>
                <p className="text-center text-text-muted text-xs mt-10">
                  {filtered.length} {t(filtered.length === 1 ? 'library.guide_one' : 'library.guide_other')}
                  {activeTag !== 'todos' && ` ${t('library.guide_in')} "${activeTag}"`}
                </p>
              </AnimateOnScroll>
            </>
          )}
        </div>
      </section>
    </>
  );
}

/* ── Portrait Guide Card ─────────────────────────────────── */

function GuidePortraitCard({ guide, large = false }: { guide: Guide; large?: boolean }) {
  const { t } = useLocale();
  return (
    <Link href={`/guia/${guide.slug}`} className="group block h-full">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-surface transition-all duration-300 group-hover:border-accent/25 group-hover:shadow-xl group-hover:shadow-accent/6 flex flex-col h-full">

        {/* Portrait cover — 2:3 ratio */}
        <div
          className="relative w-full flex-shrink-0 overflow-hidden"
          style={{ aspectRatio: '2/3' }}
        >
          {guide.coverImage ? (
            <>
              <img
                src={guide.coverImage}
                alt={guide.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.35) 65%, rgba(0,0,0,0.85) 100%)' }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0 flex items-end justify-center pb-8"
              style={{ background: 'linear-gradient(145deg, rgba(254,0,80,0.08) 0%, rgba(0,0,0,0.6) 100%)' }}
            >
              <BookOpen size={large ? 40 : 28} className="text-accent/20" />
            </div>
          )}

          {/* Tag pill — top left */}
          {(guide.category || (guide.tags ?? []).length > 0) && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] bg-black/60 backdrop-blur-sm text-white/70 border border-white/[0.06] rounded-full px-2 py-0.5">
                {guide.category || guide.tags![0]}
              </span>
            </div>
          )}

          {/* Download count — top right */}
          {(guide.downloadCount ?? 0) > 0 && (
            <div className="absolute top-3 right-3">
              <span className="text-[9px] bg-black/60 backdrop-blur-sm text-white/60 border border-white/[0.06] rounded-full px-2 py-0.5 flex items-center gap-1">
                <Download size={7} /> {guide.downloadCount}
              </span>
            </div>
          )}

          {/* Title overlay — bottom of cover */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className={`font-heading font-light text-white leading-snug ${large ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
              {guide.title}
            </h2>
          </div>
        </div>

        {/* Card footer */}
        <div className={`p-4 flex flex-col flex-1 ${large ? 'p-5' : ''}`}>
          {guide.emotionalHook || guide.subtitle ? (
            <p className={`text-text-muted leading-relaxed mb-3 line-clamp-2 flex-1 ${large ? 'text-sm' : 'text-xs'}`}>
              {guide.emotionalHook || guide.subtitle}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          <div className={`flex items-center gap-1.5 text-accent font-medium mt-auto ${large ? 'text-sm' : 'text-xs'}`}>
            {t('library.access')} <ArrowRight size={large ? 13 : 11} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
