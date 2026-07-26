'use client';

import { useEffect, useState } from 'react';
import { Play, Star, X } from 'lucide-react';

interface Props {
  url: string;
  name: string;
  headline?: string;
  role?: string;
}

type Embed =
  | { type: 'youtube'; src: string; videoId: string }
  | { type: 'vimeo'; src: string; videoId: string }
  | { type: 'direct'; src: string };

function getEmbed(url: string): Embed | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      videoId: ytMatch[1],
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&controls=0&iv_load_policy=3&playsinline=1`,
    };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0&controls=0`,
    };
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: 'direct', src: url };
  }
  return null;
}

export default function VideoTestimonialCard({ url, name, headline, role }: Props) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState<string | null>(null);
  const embed = getEmbed(url);

  useEffect(() => {
    if (!embed) return;
    if (embed.type === 'youtube') {
      setThumb(`https://img.youtube.com/vi/${embed.videoId}/hqdefault.jpg`);
    } else if (embed.type === 'vimeo') {
      let cancelled = false;
      fetch(`https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/${embed.videoId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data?.thumbnail_url) setThumb(data.thumbnail_url);
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (!embed) return null;

  return (
    <div className="relative flex-shrink-0 w-[240px] sm:w-[280px] rounded-3xl overflow-hidden border border-white/10 bg-surface aspect-[9/16] snap-center group">
      {playing ? (
        <>
          {embed.type === 'direct' ? (
            <video src={embed.src} autoPlay controls playsInline className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <iframe
              src={embed.src}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
          <button
            onClick={() => setPlaying(false)}
            aria-label="Fechar vídeo"
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          {embed.type === 'direct' ? (
            <video
              src={`${embed.src}#t=0.5`}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          ) : thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={`Depoimento em vídeo de ${name}`}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                if (embed.type === 'youtube') {
                  const img = e.currentTarget as HTMLImageElement;
                  if (!img.src.endsWith('/default.jpg')) img.src = `https://img.youtube.com/vi/${embed.videoId}/default.jpg`;
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-white/5" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={`Assistir depoimento de ${name}`}
          >
            <div className="w-14 h-14 rounded-full bg-accent/90 group-hover:bg-accent flex items-center justify-center shadow-xl shadow-accent/30 group-hover:scale-110 transition-transform">
              <Play size={20} className="text-white ml-0.5" fill="white" />
            </div>
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none transition-transform duration-300 ease-out group-hover:-translate-y-2">
            <p className="text-white text-sm font-medium leading-snug drop-shadow-sm">{name}</p>
            {role && <p className="text-white/60 text-xs drop-shadow-sm">{role}</p>}
            {headline && (
              <p className="text-white/80 text-xs italic mt-1 line-clamp-2 drop-shadow-sm">&ldquo;{headline}&rdquo;</p>
            )}
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className="text-accent fill-accent drop-shadow-sm" />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
