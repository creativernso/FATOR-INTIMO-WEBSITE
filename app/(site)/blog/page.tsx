import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BlogCard from '@/components/BlogCard';
import { getPosts } from '@/lib/db';
import { getLocale, createT } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Artigos',
  description: 'Psicologia profunda sobre relacionamentos, atração e comportamento humano.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const locale = await getLocale();
  const t = createT(locale);

  const posts = await getPosts();
  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const latest = sorted[0] ?? null;
  const featured = posts.filter((p) => p.featured && p.id !== latest?.id);
  const rest = posts.filter((p) => !p.featured && p.id !== latest?.id);

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-widest uppercase mb-4 block">{t('blog.label')}</span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5">
              <span style={{ color: '#fe0050' }}>{t('blog.heading')}</span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto">
              {t('blog.desc')}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          {posts.length === 0 ? (
            <p className="text-center text-text-muted py-20">{t('blog.empty')}</p>
          ) : (
            <>
              {/* ── LATEST ARTICLE HERO ── */}
              {latest && (
                <AnimateOnScroll>
                  <Link href={`/blog/${latest.slug}`} className="group block mb-14">
                    <article className="relative overflow-hidden rounded-2xl border border-white/5 bg-surface hover:border-white/15 transition-all duration-300">
                      <div className="relative h-72 md:h-96 overflow-hidden">
                        <Image
                          src={latest.coverImage}
                          alt={latest.title}
                          fill
                          priority
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
                        <div className="absolute top-5 left-5 flex items-center gap-2">
                          <span className="text-xs text-white bg-accent px-3 py-1 rounded-full font-medium">
                            {t('blog.featured_label')}
                          </span>
                          <span className="text-xs text-accent border border-accent/30 rounded-full px-3 py-1 bg-background/60 backdrop-blur-sm">
                            {latest.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-7 md:p-9">
                        <div className="flex items-center gap-2 text-text-muted text-xs mb-3">
                          <Clock size={12} />
                          <span>{latest.readTime} {t('blog.min_read')}</span>
                          <span className="mx-1 opacity-40">·</span>
                          <span>{new Date(latest.publishedAt).toLocaleDateString(locale === 'pt' ? 'pt-PT' : locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <h2 className="font-heading text-2xl md:text-3xl font-medium text-text-primary leading-tight mb-3 group-hover:text-accent transition-colors duration-200">
                          {latest.title}
                        </h2>
                        <p className="text-text-secondary text-sm leading-relaxed max-w-2xl mb-5">
                          {latest.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-accent text-sm font-medium">
                          <span>{t('blog.read_article')}</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                </AnimateOnScroll>
              )}

              {/* Featured posts */}
              {featured.length > 0 && (
                <>
                  <AnimateOnScroll>
                    <h2 className="font-heading text-2xl font-light text-text-primary mb-6">
                      {t('blog.featured_label')}
                    </h2>
                  </AnimateOnScroll>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                    {featured.map((post, i) => (
                      <AnimateOnScroll key={post.id} delay={i * 80}>
                        <BlogCard post={post} featured />
                      </AnimateOnScroll>
                    ))}
                  </div>
                  <div className="h-px bg-white/5 mb-14" />
                </>
              )}

              {/* All posts list */}
              {rest.length > 0 && (
                <>
                  <AnimateOnScroll>
                    <h2 className="font-heading text-2xl font-light text-text-primary mb-6">
                      {t('blog.see_all')}
                    </h2>
                  </AnimateOnScroll>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    {rest.map((post, i) => (
                      <AnimateOnScroll key={post.id} delay={i * 50}>
                        <BlogCard post={post} />
                      </AnimateOnScroll>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
