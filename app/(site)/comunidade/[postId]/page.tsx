import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import CategoryBadge from '@/components/community/CategoryBadge';
import { getCommunityPost } from '@/lib/db';
import PostInteractions from './PostInteractions';

type Props = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await getCommunityPost(postId);
  if (!post || post.status !== 'approved') return { title: 'Discussão — Comunidade Íntima' };
  return {
    title: post.title,
    description: post.body.slice(0, 155),
  };
}

export const dynamic = 'force-dynamic';

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function PostPage({ params }: Props) {
  const { postId } = await params;
  const post = await getCommunityPost(postId);
  if (!post || post.status !== 'approved') notFound();

  return (
    <>
      <section className="pt-32 pb-8 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <Link
              href="/comunidade"
              className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Comunidade Íntima
            </Link>

            {/* Category + time */}
            <div className="flex items-center gap-3 mb-5">
              <CategoryBadge slug={post.category} size="md" />
              <span className="text-text-muted text-xs">{timeAgo(post.createdAt)}</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-[1.1] mb-6">
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 pb-8 border-b border-white/5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                post.authorRole === 'founder' ? 'bg-accent/15 border border-accent/30' : 'bg-white/5 border border-white/10'
              }`}>
                <span className={`font-heading text-sm ${post.authorRole === 'founder' ? 'text-accent' : 'text-text-primary'}`}>
                  {post.anonymous ? '?' : post.authorName.charAt(0)}
                </span>
              </div>
              <div>
                <p className={`text-sm font-medium ${post.authorRole === 'founder' ? 'text-accent' : 'text-text-primary'}`}>
                  {post.authorName}
                </p>
                {post.authorRole === 'founder' && (
                  <p className="text-text-muted text-xs">Fundador · Rafael Moreira</p>
                )}
                {post.authorRole === 'moderator' && (
                  <p className="text-text-muted text-xs">Moderador</p>
                )}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Body */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="text-text-secondary text-base leading-[1.8] whitespace-pre-wrap">
              {post.body}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Interactions: reactions + comments (client) */}
      <PostInteractions postId={post.id} initialReactions={post.reactionCount} />
    </>
  );
}
