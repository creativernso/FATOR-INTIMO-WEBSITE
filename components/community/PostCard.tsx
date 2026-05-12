'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Heart, Share2, Bookmark, Pin, Sparkles } from 'lucide-react';
import { CommunityPost } from '@/lib/types';
import CategoryBadge from './CategoryBadge';
import { ROLE_LABELS } from '@/lib/community';

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

interface Props {
  post: CommunityPost;
  featured?: boolean;
}

export default function PostCard({ post, featured }: Props) {
  const roleLabel = post.authorRole ? ROLE_LABELS[post.authorRole] : '';
  const isFounder = post.authorRole === 'founder';
  const isMod = post.authorRole === 'moderator';
  const displayName = post.anonymous ? 'Membro Anônimo' : post.authorName;
  const initials = post.anonymous ? '?' : displayName.charAt(0).toUpperCase();

  return (
    <article
      className={`relative rounded-2xl border bg-surface transition-all duration-300 overflow-hidden group ${
        featured
          ? 'border-accent/20 hover:border-accent/35 hover:shadow-xl hover:shadow-accent/5'
          : 'border-white/5 hover:border-white/12 hover:shadow-lg hover:shadow-black/25'
      }`}
    >
      {featured && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      )}

      {/* Main clickable area */}
      <Link href={`/comunidade/${post.id}`} className="block p-5 sm:p-6">

        {/* Author header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {post.authorAvatar && !post.anonymous ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                <Image src={post.authorAvatar} alt={displayName} fill className="object-cover" />
              </div>
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-heading font-medium ${
                  isFounder
                    ? 'bg-accent/15 border border-accent/30 text-accent'
                    : post.anonymous
                    ? 'bg-white/5 border border-white/8 text-text-muted'
                    : 'bg-white/8 border border-white/10 text-text-secondary'
                }`}
              >
                {initials}
              </div>
            )}

            <div className="leading-none">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium ${isFounder ? 'text-accent' : 'text-text-primary'}`}>
                  {displayName}
                </span>
                {roleLabel && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium tracking-wide uppercase ${
                      isFounder
                        ? 'bg-accent/10 border-accent/25 text-accent'
                        : isMod
                        ? 'bg-white/5 border-white/15 text-white/50'
                        : ''
                    }`}
                  >
                    {roleLabel}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-text-muted">{timeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {post.pinned && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5">
                <Pin size={8} /> Fixado
              </span>
            )}
            {post.featured && (
              <span className="inline-flex items-center gap-1 text-[10px] text-accent border border-accent/20 rounded-full px-2 py-0.5">
                <Sparkles size={8} /> Destaque
              </span>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="mb-3">
          <CategoryBadge slug={post.category} />
        </div>

        {/* Title */}
        <h3
          className={`font-heading text-text-primary leading-snug mb-2.5 group-hover:text-accent/90 transition-colors line-clamp-2 ${
            featured ? 'text-xl font-medium' : 'text-base font-medium'
          }`}
        >
          {post.title}
        </h3>

        {/* Body excerpt */}
        <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
          {post.body}
        </p>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div
            className={`grid gap-1.5 mb-2 rounded-xl overflow-hidden ${
              post.images.length === 1
                ? 'grid-cols-1'
                : post.images.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}
          >
            {post.images.slice(0, 3).map((url, i) => (
              <div key={i} style={{ aspectRatio: '4/3' }}>
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </Link>

      {/* Footer — reactions + actions */}
      <div className="px-5 sm:px-6 pb-4 pt-3 border-t border-white/4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-text-muted">
          <span className="flex items-center gap-1.5 text-xs hover:text-red-400 transition-colors cursor-pointer select-none">
            <Heart size={13} />
            <span>{post.reactionCount}</span>
          </span>
          <Link
            href={`/comunidade/${post.id}#comments`}
            className="flex items-center gap-1.5 text-xs hover:text-accent transition-colors"
          >
            <MessageCircle size={13} />
            <span>{post.commentCount}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-text-muted">
          <button
            aria-label="Salvar"
            className="flex items-center gap-1 text-xs hover:text-text-secondary transition-colors"
          >
            <Bookmark size={12} />
          </button>
          <button
            aria-label="Compartilhar"
            className="flex items-center gap-1 text-xs hover:text-text-secondary transition-colors"
          >
            <Share2 size={12} />
          </button>
        </div>
      </div>
    </article>
  );
}
