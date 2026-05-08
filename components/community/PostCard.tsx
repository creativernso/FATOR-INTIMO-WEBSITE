import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Heart, Pin, Sparkles } from 'lucide-react';
import { CommunityPost } from '@/lib/types';
import CategoryBadge from './CategoryBadge';
import { ROLE_LABELS } from '@/lib/community';

interface Props {
  post: CommunityPost;
  featured?: boolean;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export default function PostCard({ post, featured }: Props) {
  const roleLabel = post.authorRole ? ROLE_LABELS[post.authorRole] : '';
  const isFounder = post.authorRole === 'founder';

  return (
    <Link href={`/comunidade/${post.id}`} className="block group">
      <article className={`relative rounded-2xl border bg-surface transition-all duration-300 hover:border-white/10 overflow-hidden ${
        featured ? 'border-accent/20 hover:border-accent/30 p-7' : 'border-white/5 p-6'
      }`}>
        {featured && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        )}

        {/* Badges row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <CategoryBadge slug={post.category} />
          {post.pinned && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5">
              <Pin size={9} /> Fixado
            </span>
          )}
          {post.featured && (
            <span className="inline-flex items-center gap-1 text-[11px] text-accent border border-accent/20 rounded-full px-2 py-0.5">
              <Sparkles size={9} /> Destaque
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-heading text-text-primary leading-snug mb-3 group-hover:text-accent transition-colors line-clamp-2 ${
          featured ? 'text-xl font-medium' : 'text-base font-medium'
        }`}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className={`text-text-secondary text-sm leading-relaxed mb-4 ${post.images?.length ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {post.body}
        </p>

        {/* Image strip */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-1.5 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {post.images.map((url, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-white/6" style={{ aspectRatio: '4/3' }}>
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {post.authorAvatar && !post.anonymous ? (
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                <Image src={post.authorAvatar} alt={post.authorName} fill className="object-cover" />
              </div>
            ) : (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isFounder ? 'bg-accent/15 border border-accent/30' : 'bg-white/5 border border-white/10'
              }`}>
                <span className={`text-xs font-heading ${isFounder ? 'text-accent' : 'text-text-muted'}`}>
                  {post.anonymous ? '?' : post.authorName.charAt(0)}
                </span>
              </div>
            )}
            <div className="leading-none">
              <span className={`text-xs font-medium ${isFounder ? 'text-accent' : 'text-text-primary'}`}>
                {post.authorName}
              </span>
              {roleLabel && (
                <span className="block text-[10px] text-text-muted mt-0.5">{roleLabel}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-text-muted">
            <span className="flex items-center gap-1 text-xs">
              <Heart size={11} /> {post.reactionCount}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <MessageCircle size={11} /> {post.commentCount}
            </span>
            <span className="text-[11px] opacity-60">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
