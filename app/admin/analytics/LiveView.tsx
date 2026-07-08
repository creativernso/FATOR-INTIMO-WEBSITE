'use client';

import { useEffect, useState } from 'react';
import { Radio, ShoppingBag, CreditCard, PartyPopper } from 'lucide-react';

interface LiveOverview {
  visitorsNow: number;
  browsing: number;
  checkingOut: number;
  purchasedRecent: number;
  topPaths: { path: string; count: number }[];
}

const POLL_INTERVAL_MS = 5000;

export function LiveView() {
  const [data, setData] = useState<LiveOverview | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/admin/analytics/live');
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {}
    };
    fetchLive();
    const id = setInterval(fetchLive, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const funnel = [
    { label: 'Navegando', value: data?.browsing ?? 0, icon: ShoppingBag, accent: '#3b82f6' },
    { label: 'Finalizando compra', value: data?.checkingOut ?? 0, icon: CreditCard, accent: '#f59e0b' },
    { label: 'Compraram (30 min)', value: data?.purchasedRecent ?? 0, icon: PartyPopper, accent: '#10b981' },
  ];

  return (
    <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#10b98118', border: '1px solid #10b98138' }}>
            <Radio size={15} style={{ color: '#10b981' }} />
          </div>
          <div>
            <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>Live View</h3>
            <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>
              O que está acontecendo no site agora
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Ao vivo
        </div>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-text-muted uppercase tracking-widest mb-2" style={{ fontSize: '10px' }}>Visitantes agora</p>
          <p className="font-body font-semibold text-green-400" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}>
            {data?.visitorsNow ?? '—'}
          </p>

          <div className="mt-5 space-y-2">
            <p className="text-text-muted uppercase tracking-widest" style={{ fontSize: '10px' }}>Páginas mais vistas agora</p>
            {!data || data.topPaths.length === 0 ? (
              <p className="text-text-muted text-xs mt-2">Nenhum visitante ativo no momento.</p>
            ) : (
              data.topPaths.map((p) => (
                <div key={p.path} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-text-secondary truncate">{p.path}</span>
                  <span className="text-text-muted flex-shrink-0">{p.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {funnel.map((f) => (
            <div key={f.label} className="rounded-xl border border-white/6 bg-white/2 px-3 py-4 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}28` }}>
                <f.icon size={14} style={{ color: f.accent }} />
              </div>
              <p className="font-body font-semibold" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)', color: f.accent }}>
                {f.value}
              </p>
              <p className="text-text-muted mt-1" style={{ fontSize: '10px' }}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
