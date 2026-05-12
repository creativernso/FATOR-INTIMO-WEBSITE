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
    <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 flex items-center gap-3">
      <Clock size={14} className="text-accent flex-shrink-0 animate-pulse" />
      <div className="flex-1 min-w-0">
        <p className="text-accent text-xs font-medium mb-1.5">
          {text || 'Oferta por tempo limitado'}
        </p>
        <div className="flex items-center gap-1.5">
          {[
            { v: timeLeft.h, label: 'h' },
            { v: timeLeft.m, label: 'min' },
            { v: timeLeft.s, label: 's' },
          ].map(({ v, label }, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="font-heading text-lg font-medium text-text-primary tabular-nums">
                {pad(v)}
              </span>
              <span className="text-text-muted text-[11px]">{label}</span>
              {i < 2 && <span className="text-text-muted/40 text-sm font-light">:</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
