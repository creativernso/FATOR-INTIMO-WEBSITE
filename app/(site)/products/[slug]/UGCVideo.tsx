'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { getVideoEmbed } from '@/lib/video-embed';

interface Props {
  url?: string;
}

export default function UGCVideo({ url }: Props) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState<string | null>(null);
  const embed = url ? getVideoEmbed(url) : null;

  useEffect(() => {
    if (!embed) return;
    if (embed.type === 'youtube') {
      setThumb(`https://img.youtube.com/vi/${embed.videoId}/maxresdefault.jpg`);
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

  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/8 bg-surface">
      {playing && embed ? (
        embed.type === 'direct' ? (
          <video src={embed.src} autoPlay controls playsInline className="w-full h-full object-cover" />
        ) : (
          <iframe
            src={embed.src}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )
      ) : (
        <>
          {/* Preview frame */}
          {embed?.type === 'direct' ? (
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
              alt="Pré-visualização do vídeo"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                if (embed?.type === 'youtube') {
                  const img = e.currentTarget as HTMLImageElement;
                  if (!img.src.endsWith('/hqdefault.jpg')) {
                    img.src = `https://img.youtube.com/vi/${embed.videoId}/hqdefault.jpg`;
                  }
                }
              }}
            />
          ) : null}

          <button
            onClick={() => embed && setPlaying(true)}
            disabled={!embed}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors group disabled:cursor-default disabled:hover:bg-black/30"
            aria-label="Reproduzir vídeo"
          >
            <div className="w-16 h-16 rounded-full bg-accent/90 group-enabled:group-hover:bg-accent flex items-center justify-center shadow-xl shadow-accent/30 group-enabled:group-hover:scale-110 transition-transform">
              <Play size={22} className="text-white ml-1" fill="white" />
            </div>
          </button>

          {!embed && (
            <p className="absolute bottom-5 left-0 right-0 text-center text-white/50 text-xs tracking-wide">
              Vídeo em breve
            </p>
          )}
        </>
      )}
    </div>
  );
}
