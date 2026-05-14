'use client';

import { useState, useEffect } from 'react';

interface Props {
  endsAt: string;
  text?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Custom clock icon whose hour and minute hands rotate independently. The
// keyframes live in globals.css (fi-clock-minute / fi-clock-hour).
function AnimatedClock({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      {/* Hour hand — rotates slowly */}
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="6"
        className="fi-clock-hand-hour"
      />
      {/* Minute hand — rotates fast */}
      <line
        x1="12"
        y1="12"
        x2="16"
        y2="14"
        className="fi-clock-hand-minute"
      />
      {/* Center pivot dot */}
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function CountdownTimer({ endsAt, text }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
      if (diff === 0) {
        setExpired(true);
        return;
      }
      const totalSecs = Math.floor(diff / 1000);
      setTimeLeft({
        h: Math.floor(totalSecs / 3600),
        m: Math.floor((totalSecs % 3600) / 60),
        s: totalSecs % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (expired || !timeLeft) return null;

  return (
    <div className="rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center flex-shrink-0 text-accent">
        <AnimatedClock size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-accent text-sm font-medium mb-2 tracking-wide">
          {text || 'Oferta por tempo limitado'}
        </p>
        <div className="flex items-baseline gap-1 sm:gap-1.5">
          {[
            { v: timeLeft.h, label: 'h' },
            { v: timeLeft.m, label: 'min' },
            { v: timeLeft.s, label: 's' },
          ].map(({ v, label }, i) => (
            <div key={i} className="flex items-baseline gap-0.5">
              <span className="font-heading text-3xl sm:text-4xl font-medium text-accent tabular-nums leading-none">
                {pad(v)}
              </span>
              <span className="text-accent/70 text-[10px] sm:text-xs font-medium">{label}</span>
              {i < 2 && (
                <span className="text-accent/50 text-xl sm:text-2xl font-light leading-none mx-1">
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
