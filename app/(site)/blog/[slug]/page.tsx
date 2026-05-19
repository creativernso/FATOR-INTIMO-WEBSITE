import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { getPosts, getComments, getLikes } from '@/lib/db';
import ReactionsBar from './ReactionsBar';
import CommentsSection from './CommentsSection';

export const dynamic = 'force-dynamic';

function formatContent(content: string): string {
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  // Split on any newline (single or double) to create paragraphs
  return content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('');
}

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p.slug === slug);
  if (!post) return { title: 'Artigo não encontrado' };
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url,
      siteName: 'Fator Íntimo',
      publishedTime: post.publishedAt,
      authors: ['Fator Íntimo'],
      tags: [post.category],
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 2);
  const [approvedComments, likes] = await Promise.all([
    getComments(post.slug).then((cs) => cs.filter((c) => c.approved)),
    getLikes(post.slug),
  ]);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'Fator Íntimo', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Fator Íntimo',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/LOGO.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    articleSection: post.category,
    inLanguage: 'pt-BR',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Back */}
      <div className="pt-28 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors mb-10"
          >
            <ArrowLeft size={14} />
            Voltar aos artigos
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="px-6 pb-28">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="mb-8">
            <span className="text-xs text-accent border border-accent/20 rounded-full px-3 py-1 mb-5 inline-block">
              {post.category}
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-tight mb-5">
              {post.title}
            </h1>
            <p className="font-heading text-xl text-text-secondary italic mb-6 leading-relaxed">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-5 text-text-muted text-xs border-t border-b border-white/5 py-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-[10px] font-bold text-accent">FÍ</div>
                <span className="font-medium text-text-secondary">Fator Íntimo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{post.readTime} min de leitura</span>
              </div>
            </div>
          </div>

          {/* Cover image */}
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-12 border border-white/5">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div
            className="prose-dark"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />

          {/* Reactions */}
          <ReactionsBar slug={post.slug} commentCount={approvedComments.length} />

          {/* CTA */}
          <div className="mt-14 rounded-2xl border border-white/5 bg-surface p-8 text-center">
            <h3 className="font-heading text-2xl font-medium text-text-primary mb-3">
              Gostou deste conteúdo?
            </h3>
            <p className="text-text-secondary text-sm mb-5 leading-relaxed">
              Explore a biblioteca de guias psicológicos gratuitos e aprofunde seu entendimento sobre relacionamentos.
            </p>
            <Link
              href="/guia"
              className="inline-block bg-accent hover:bg-accent-hover text-white px-7 py-3 rounded-full font-medium text-sm transition-all"
            >
              Explorar Guias Gratuitos
            </Link>
          </div>

          {/* Comments */}
          <CommentsSection slug={post.slug} />

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-14">
              <h3 className="font-heading text-2xl font-light text-text-primary mb-6">
                Continue lendo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="group p-5 rounded-xl border border-white/5 bg-surface hover:border-white/10 transition-all"
                  >
                    <span className="text-xs text-accent mb-2 block">{p.category}</span>
                    <h4 className="font-heading text-lg font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
                      {p.title}
                    </h4>
                    <p className="text-text-secondary text-xs mt-2 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
