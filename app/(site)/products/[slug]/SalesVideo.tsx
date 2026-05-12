'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface Props {
  url: string;
}

function getEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; src: string } | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }
  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: 'direct', src: url };
  }
  return null;
}

export default function SalesVideo({ url }: Props) {
  const [playing, setPlaying] = useState(false);
  const embed = getEmbedUrl(url);

  if (!embed) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8 bg-surface aspect-video relative">
      {playing ? (
        embed.type === 'direct' ? (
          <video src={embed.src} autoPlay controls className="w-full h-full object-cover" />
        ) : (
          <iframe
            src={embed.src}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 group bg-black/40 hover:bg-black/30 transition-colors"
          aria-label="Reproduzir vídeo"
        >
          <div className="w-16 h-16 rounded-full bg-accent/90 hover:bg-accent flex items-center justify-center shadow-xl shadow-accent/30 group-hover:scale-110 transition-transform">
            <Play size={22} className="text-white ml-1" fill="white" />
          </div>
          <p className="text-white/70 text-sm font-medium tracking-wide">Assistir apresentação</p>
        </button>
      )}
    </div>
  );
}
