import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PenLine } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import PostCard from '@/components/community/PostCard';
import { getCommunityPosts } from '@/lib/db';
import { getCategoryBySlug } from '@/lib/community';

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const cat = getCategoryBySlug(categoria);
  if (!cat) return { title: 'Categoria | Comunidade Íntima' };
  return { title: `${cat.label} | Comunidade Íntima`, description: cat.description };
}

export const dynamic = 'force-dynamic';

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params;
  const cat = getCategoryBySlug(categoria);
  if (!cat) notFound();

  const posts = await getCommunityPosts({ status: 'approved', category: categoria });

  return (
    <>
      <section className="pt-36 pb-12 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-2xl mx-auto">
          <AnimateOnScroll>
            <Link href="/comunidade" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors mb-8">
              <ArrowLeft size={14} /> Comunidade Íntima
            </Link>
            <p className="text-4xl mb-4 opacity-60">{cat.icon}</p>
            <h1 className="font-heading text-5xl font-light text-text-primary mb-4 leading-tight">
              {cat.label}
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-md mx-auto">
              {cat.description}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          {posts.length === 0 ? (
            <AnimateOnScroll>
              <div className="text-center py-20">
                <p className="text-text-muted text-sm mb-8">Nenhuma discussão ainda nesta categoria.</p>
                <Link
                  href="/comunidade/nova-publicacao"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full text-sm font-medium transition-all"
                >
                  <PenLine size={14} /> Iniciar uma conversa
                </Link>
              </div>
            </AnimateOnScroll>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post, i) => (
                <AnimateOnScroll key={post.id} delay={i * 50}>
                  <PostCard post={post} />
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
