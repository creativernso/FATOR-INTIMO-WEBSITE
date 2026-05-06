import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import { Post } from '@/lib/types';

interface Props {
  post: Post;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: Props) {
  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-2xl border border-white/5 bg-surface hover:border-white/10 transition-all duration-300 h-full">
          <div className="relative h-56 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            <span className="absolute top-4 left-4 text-xs text-accent border border-accent/30 rounded-full px-3 py-1 bg-background/60 backdrop-blur-sm">
              {post.category}
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-3">
              <Clock size={12} />
              <span>{post.readTime} min de leitura</span>
            </div>
            <h3 className="font-heading text-xl font-medium text-text-primary leading-tight mb-3 group-hover:text-accent transition-colors duration-200">
              {post.title}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-2 mt-5 text-accent text-sm font-medium">
              <span>Ler artigo</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group flex gap-4 py-5 border-b border-white/5 hover:border-white/10 transition-all">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-accent mb-1 block">{post.category}</span>
        <h3 className="font-heading text-base font-medium text-text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-text-muted text-xs">
          <Clock size={11} />
          <span>{post.readTime} min</span>
        </div>
      </div>
    </Link>
  );
}
