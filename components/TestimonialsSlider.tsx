'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Testimonial } from '@/lib/types';

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialsSlider({ testimonials }: Props) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = testimonials.length;

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 300);
  }, [transitioning]);

  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);
  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const getVisibleIndices = () => {
    return [
      (current - 1 + total) % total,
      current,
      (current + 1) % total,
    ];
  };

  const t = testimonials[current];
  const displayName = t.anonymous ? 'Anônimo' : t.name;
  const showPhoto = !t.anonymous && !!t.avatar;

  return (
    <div className="relative">
      {/* Desktop: 3-card view */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-5">
          {getVisibleIndices().map((idx, position) => {
            const item = testimonials[idx];
            const isCenter = position === 1;
            const itemName = item.anonymous ? 'Anônimo' : item.name;
            const itemPhoto = !item.anonymous && !!item.avatar;

            return (
              <div
                key={idx}
                onClick={() => !isCenter && goTo(idx)}
                className={`relative rounded-3xl border overflow-hidden flex flex-col transition-all duration-500 cursor-pointer select-none ${
                  isCenter
                    ? 'border-white/15 scale-100 opacity-100'
                    : 'border-white/5 scale-95 opacity-40 hover:opacity-60'
                }`}
                style={{ background: isCenter ? 'rgb(var(--surface))' : 'rgb(var(--surface))' }}
              >
                {isCenter && (
                  <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                )}

                <div className="px-4 pt-4">
                  <div className="relative w-full rounded-2xl overflow-hidden bg-white/5" style={{ aspectRatio: '4/5' }}>
                    {itemPhoto ? (
                      <img src={item.avatar!} alt={itemName}
                        className="absolute inset-0 w-full h-full object-cover object-center" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-heading text-6xl font-light text-white/10 select-none">
                          {item.anonymous ? '?' : itemName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f0a06]/60 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col flex-1 px-5 pt-4 pb-6 text-center">
                  <p className="text-[11px] text-text-muted leading-snug mb-3 tracking-wide">
                    <strong className="font-semibold text-text-primary/80">{itemName}</strong>
                    {item.age && <><span className="mx-1.5 opacity-40">·</span>{item.age} anos</>}
                    {item.role && <><span className="mx-1.5 opacity-40">·</span>{item.role}</>}
                  </p>
                  {item.headline && (
                    <h3 className="font-heading text-text-primary font-semibold leading-snug mb-3"
                      style={{ fontSize: 'clamp(0.88rem, 1.05vw, 0.95rem)' }}>
                      {item.headline}
                    </h3>
                  )}
                  <p className="text-text-secondary leading-relaxed flex-1 line-clamp-4"
                    style={{ fontSize: 'clamp(0.78rem, 0.9vw, 0.85rem)' }}>
                    {item.content}
                  </p>
                  {item.rating && (
                    <div className="flex items-center justify-center gap-1 mt-4">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={12} className="text-accent fill-accent" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: single card */}
      <div className="md:hidden">
        <div className={`rounded-3xl border border-white/15 overflow-hidden flex flex-col transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
          style={{ background: 'rgb(var(--surface))' }}>
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="px-4 pt-4">
            <div className="relative w-full rounded-2xl overflow-hidden bg-white/5" style={{ aspectRatio: '4/5' }}>
              {showPhoto ? (
                <img src={t.avatar!} alt={displayName}
                  className="absolute inset-0 w-full h-full object-cover object-center" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading text-6xl font-light text-white/10">{t.anonymous ? '?' : displayName.charAt(0)}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f0a06]/60 to-transparent pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col px-5 pt-4 pb-6 text-center">
            <p className="text-[11px] text-text-muted mb-3">
              <strong className="font-semibold text-text-primary/80">{displayName}</strong>
              {t.age && <><span className="mx-1.5 opacity-40">·</span>{t.age} anos</>}
            </p>
            {t.headline && (
              <h3 className="font-heading text-text-primary font-semibold leading-snug mb-3 text-base">{t.headline}</h3>
            )}
            <p className="text-text-secondary text-sm leading-relaxed">{t.content}</p>
            {t.rating && (
              <div className="flex items-center justify-center gap-1 mt-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={12} className="text-accent fill-accent" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={() => { prev(); resetTimer(); }}
          className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:border-white/20 transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetTimer(); }}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => { next(); resetTimer(); }}
          className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:border-white/20 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
