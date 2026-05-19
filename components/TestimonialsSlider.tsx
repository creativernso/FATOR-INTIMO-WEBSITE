'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Testimonial } from '@/lib/types';

interface Props { testimonials: Testimonial[]; }

const INTERVAL = 6000;

function Card({ item }: { item: Testimonial }) {
  const name  = item.anonymous ? 'Anônimo' : item.name;
  const photo = !item.anonymous && !!item.avatar;
  return (
    <div className="grid md:grid-cols-[5fr_7fr] min-h-[340px] md:min-h-[380px]">
      {/* Photo */}
      <div className="relative overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none bg-white/5">
        {photo ? (
          <img src={item.avatar!} alt={name}
            className="absolute inset-0 w-full h-full object-cover object-center" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-7xl font-light text-white/10 select-none">
              {item.anonymous ? '?' : name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0f0a06]/70 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center px-7 py-8 md:px-10 md:py-10">
        {item.rating && (
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} size={13} className="text-accent fill-accent" />
            ))}
          </div>
        )}
        {item.headline && (
          <h3 className="font-heading text-text-primary font-semibold leading-snug mb-4 text-lg md:text-xl">
            {item.headline}
          </h3>
        )}
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-5 mb-6">
          {item.content}
        </p>
        <p className="text-xs text-text-muted tracking-wide">
          <strong className="font-semibold text-text-primary/80">{name}</strong>
          {item.age  && <><span className="mx-1.5 opacity-40">·</span>{item.age} anos</>}
          {item.role && <><span className="mx-1.5 opacity-40">·</span>{item.role}</>}
        </p>
      </div>
    </div>
  );
}

export default function TestimonialsSlider({ testimonials }: Props) {
  const total = testimonials.length;
  const [current,   setCurrent]   = useState(0);
  const [incoming,  setIncoming]  = useState<number | null>(null);
  const [dir,       setDir]       = useState<'left' | 'right'>('left');
  const [sliding,   setSliding]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const progRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── progress bar ── */
  const resetProgress = useCallback(() => {
    setProgress(0);
    if (progRef.current) clearInterval(progRef.current);
    const tick = 80;
    progRef.current = setInterval(() => {
      setProgress(p => Math.min(p + (tick / INTERVAL) * 100, 100));
    }, tick);
  }, []);

  /* ── slide logic ── */
  const go = useCallback((nextIdx: number, direction: 'left' | 'right') => {
    if (sliding) return;
    const idx = ((nextIdx % total) + total) % total;
    setDir(direction);
    setIncoming(idx);
    setSliding(true);
    setTimeout(() => {
      setCurrent(idx);
      setIncoming(null);
      setSliding(false);
    }, 600);
    resetProgress();
  }, [sliding, total, resetProgress]);

  const next = useCallback(() => go(current + 1, 'left'),  [current, go]);
  const prev = useCallback(() => go(current - 1, 'right'), [current, go]);

  /* ── auto-advance ── */
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, INTERVAL);
  }, [next]);

  useEffect(() => {
    resetTimer();
    resetProgress();
    return () => {
      if (timerRef.current)  clearInterval(timerRef.current);
      if (progRef.current)   clearInterval(progRef.current);
    };
  }, [resetTimer, resetProgress]);

  /* ── swipe support ── */
  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? next() : prev();
      resetTimer();
    }
  };

  /* ── slide classes ── */
  // Current exits: left → slides to -100%, right → slides to +100%
  const exitClass    = sliding ? (dir === 'left' ? '-translate-x-full' : 'translate-x-full') : 'translate-x-0';
  // Incoming enters: left → comes from +100%, right → comes from -100%
  const enterStart   = dir === 'left' ? 'translate-x-full' : '-translate-x-full';

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-white/8"
        style={{ background: 'rgb(var(--surface))' }}>

        {/* Top accent line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent z-10" />

        {/* Current card — exits */}
        <div className={`transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${exitClass}`}>
          <Card item={testimonials[current]} />
        </div>

        {/* Incoming card — enters */}
        {incoming !== null && (
          <div className={`absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            sliding ? 'translate-x-0' : enterStart
          }`}
            style={{ transitionDelay: sliding ? '0ms' : '0ms' }}>
            <Card item={testimonials[incoming]} />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-[3px] rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full bg-accent/60 transition-[width] duration-75"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-5">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {testimonials.map((_, i) => (
            <button key={i}
              onClick={() => { go(i, i > current ? 'left' : 'right'); resetTimer(); }}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-5 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-2">
          <button onClick={() => { prev(); resetTimer(); }}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:border-white/25 transition-all">
            <ChevronLeft size={15} />
          </button>
          <button onClick={() => { next(); resetTimer(); }}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:border-white/25 transition-all">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
