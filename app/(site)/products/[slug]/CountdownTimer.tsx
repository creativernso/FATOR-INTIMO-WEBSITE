'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  endsAt: string;
  text?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
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
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center flex-shrink-0">
        <Clock size={24} className="text-accent animate-pulse" />
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
              <span className="font-heading text-3xl sm:text-4xl font-medium text-text-primary tabular-nums leading-none">
                {pad(v)}
              </span>
              <span className="text-white/40 text-[10px] sm:text-xs font-medium">{label}</span>
              {i < 2 && (
                <span className="text-white/20 text-xl sm:text-2xl font-light leading-none mx-1">
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
