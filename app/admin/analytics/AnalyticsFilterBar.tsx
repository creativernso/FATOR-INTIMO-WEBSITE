'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';

const OPTIONS = [
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '90 dias', value: '90' },
  { label: 'Total', value: 'all' },
];

export function AnalyticsFilterBar({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setDays = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('days', value);
    router.push(`/admin/analytics?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-1.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDays(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              current === opt.value
                ? 'bg-accent text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/8'
            }`}
          >
            {opt.label}
          </button>
        ))}
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
