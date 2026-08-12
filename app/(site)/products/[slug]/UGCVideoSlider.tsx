'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import UGCVideo from './UGCVideo';

interface Props {
  urls: string[];
}

export default function UGCVideoSlider({ urls }: Props) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // No video configured at all -> fall back to a single "coming soon" card,
  // same as the old single-video behavior.
  const slides = urls.length > 0 ? urls : [undefined];
  const canNav = slides.length > 1;

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + slides.length) % slides.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className="relative mx-auto max-w-[300px] sm:max-w-[340px]">
      <div
        className="overflow-hidden rounded-2xl"
        onTouchStart={canNav ? onTouchStart : undefined}
        onTouchEnd={canNav ? onTouchEnd : undefined}
      >
        <div
          className="flex transition-transform duration-400 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((url, i) => (
            <div key={i} className="w-full flex-shrink-0">
              <UGCVideo url={url} active={i === index} />
            </div>
          ))}
        </div>
      </div>

      {canNav && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Vídeo anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Próximo vídeo"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight size={16} />
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Ir para vídeo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-accent' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
