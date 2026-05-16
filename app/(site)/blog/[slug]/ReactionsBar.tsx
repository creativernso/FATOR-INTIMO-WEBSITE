'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Copy, Check } from 'lucide-react';

interface Props {
  slug: string;
  commentCount: number;
}

export default function ReactionsBar({ slug, commentCount }: Props) {
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${slug}/reactions`).then((r) => r.json()).then((d) => setLikes(d.likes ?? 0));
    setLiked(!!localStorage.getItem(`liked_${slug}`));
  }, [slug]);

  const handleLike = async () => {
    if (liked) return;
    const res = await fetch(`/api/posts/${slug}/reactions`, { method: 'POST' });
    const data = await res.json();
    setLikes(data.likes);
    setLiked(true);
    localStorage.setItem(`liked_${slug}`, '1');
  };

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const title = typeof document !== 'undefined' ? document.title : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToComments = () => {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex items-center justify-between py-5 border-t border-b border-white/6 my-10">
      <div className="flex items-center gap-4">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            liked
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'border-white/8 text-text-muted hover:border-accent/30 hover:text-accent'
          }`}
        >
          <Heart size={15} className={liked ? 'fill-accent text-accent' : ''} />
          <span>{likes ?? 0}</span>
        </button>

        {/* Comments */}
        <button
          onClick={scrollToComments}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-white/8 text-text-muted hover:border-white/20 hover:text-text-primary transition-all"
        >
          <MessageCircle size={15} />
          <span>{commentCount}</span>
        </button>
      </div>

      {/* Share */}
      <div className="relative">
        <button
          onClick={() => setShareOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-white/8 text-text-muted hover:border-white/20 hover:text-text-primary transition-all"
        >
          <Share2 size={15} />
          <span className="hidden sm:inline">Compartilhar</span>
        </button>

        {shareOpen && (
          <div className="absolute right-0 top-12 z-20 rounded-2xl border border-white/10 bg-[#111] shadow-2xl p-2 min-w-[180px]">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter / X
            </a>
            <button
              onClick={() => { handleCopy(); setShareOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
            >
              {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        )}
      </div>

      {shareOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setShareOpen(false)} />
      )}
    </div>
  );
}
