'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, Calendar, ChevronDown, Check } from 'lucide-react';

const PRESET_OPTIONS = [
  { label: 'Hoje', value: '1' },
  { label: 'Ontem', value: 'yesterday' },
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '90 dias', value: '90' },
  { label: 'Este mês', value: 'month' },
];

export function AnalyticsFilterBar({ current, from, to }: { current: string; from?: string; to?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCustom, setShowCustom] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [fromInput, setFromInput] = useState(from || '');
  const [toInput, setToInput] = useState(to || '');

  const isCustom = !!(from && to);
  const activePreset = PRESET_OPTIONS.find((o) => !isCustom && o.value === current);

  const setDays = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('days', value);
    params.delete('from');
    params.delete('to');
    router.push(`/admin/analytics?${params.toString()}`);
    setShowCustom(false);
    setShowPresets(false);
  };

  const applyCustom = () => {
    if (!fromInput || !toInput) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', fromInput);
    params.set('to', toInput);
    params.delete('days');
    router.push(`/admin/analytics?${params.toString()}`);
    setShowCustom(false);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-1.5 flex-wrap items-center">
        <div className="relative">
          <button
            onClick={() => setShowPresets((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activePreset
                ? 'bg-accent text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/8'
            }`}
          >
            {activePreset?.label ?? 'Período'}
            <ChevronDown size={12} />
          </button>
          {showPresets && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPresets(false)} />
              <div className="absolute left-0 mt-2 w-40 rounded-xl border border-white/10 bg-surface shadow-xl z-20 py-1 overflow-hidden">
                {PRESET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDays(opt.value)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-text-secondary hover:bg-white/5 transition-colors"
                  >
                    {opt.label}
                    {!isCustom && current === opt.value && <Check size={12} className="text-accent" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setDays('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !isCustom && current === 'all'
              ? 'bg-accent text-white'
              : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/8'
          }`}
        >
          Total
        </button>

        <div className="relative">
          <button
            onClick={() => setShowCustom((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isCustom
                ? 'bg-accent text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/8'
            }`}
          >
            <Calendar size={12} />
            {isCustom ? `${from} → ${to}` : 'Personalizado'}
          </button>
          {showCustom && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCustom(false)} />
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-white/10 bg-surface shadow-xl z-20 p-3.5 space-y-2.5">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-text-muted block mb-1" style={{ fontSize: '10px' }}>De</label>
                    <input
                      type="date"
                      value={fromInput}
                      max={toInput || undefined}
                      onChange={(e) => setFromInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent/40"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-text-muted block mb-1" style={{ fontSize: '10px' }}>Até</label>
                    <input
                      type="date"
                      value={toInput}
                      min={fromInput || undefined}
                      onChange={(e) => setToInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent/40"
                    />
                  </div>
                </div>
                <button
                  onClick={applyCustom}
                  disabled={!fromInput || !toInput}
                  className="w-full py-1.5 rounded-lg text-xs bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <a
        href="/api/admin/leads/export"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-text-muted hover:bg-white/10 border border-white/8 transition-colors"
      >
        <Download size={12} /> Exportar CSV
      </a>
    </div>
  );
}
