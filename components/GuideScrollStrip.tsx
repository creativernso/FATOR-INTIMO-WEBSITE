'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

interface Guide {
  id: string;
  slug: string;
  title: string;
  coverImage?: string | null;
}

interface Props {
  guides: Guide[];
  freeBadge: string;
}

export default function GuideScrollStrip({ guides, freeBadge }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6"
      >
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guia/${guide.slug}`}
            className="group block flex-shrink-0 w-44 md:w-52 rounded-2xl border border-white/5 bg-surface overflow-hidden hover:border-accent/20 transition-all duration-500"
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
              {guide.coverImage ? (
                <img
                  src={guide.coverImage}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/10 to-transparent">
                  <span className="font-heading text-4xl font-light text-accent/30">◎</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[9px] text-accent tracking-widest uppercase">{freeBadge}</span>
                <h3 className="font-heading text-white text-xs font-medium leading-snug mt-1 line-clamp-3">
                  {guide.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-[3px] rounded-full bg-white/8 overflow-hidden -mx-6 px-6">
        <div
          className="h-full rounded-full bg-white/30 transition-[width] duration-75"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
