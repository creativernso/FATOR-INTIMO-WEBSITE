'use client';

import { useState, useEffect } from 'react';
import { Testimonial } from '@/lib/types';
import {
  Check, X, Star, Trash2, Eye, EyeOff, Sparkles, Clock,
  MessageSquare, Search, ChevronDown,
} from 'lucide-react';
import Image from 'next/image';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
        <Clock size={9} /> Pendente
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-400/10 text-green-400 border border-green-400/20">
        <Check size={9} /> Aprovado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-400/10 text-red-400 border border-red-400/20">
      <X size={9} /> Rejeitado
    </span>
  );
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) setTestimonials(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const patch = async (id: string, data: Partial<Testimonial>) => {
    setActionLoading(id);
    await fetch(`/api/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchAll();
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este depoimento permanentemente?')) return;
    setActionLoading(id);
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    await fetchAll();
    setActionLoading(null);
  };

  const pending = testimonials.filter((t) => !t.status || t.status === 'pending');
  const approved = testimonials.filter((t) => t.status === 'approved');
  const rejected = testimonials.filter((t) => t.status === 'rejected');

  const filtered = testimonials
    .filter((t) => {
      if (filter === 'pending') return !t.status || t.status === 'pending';
      if (filter === 'approved') return t.status === 'approved';
      if (filter === 'rejected') return t.status === 'rejected';
      return true;
    })
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.content?.toLowerCase().includes(q) ||
        t.headline?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Prova social
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Depoimentos
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {testimonials.length} recebidos · {pending.length} pendentes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pendentes', value: pending.length, color: 'text-yellow-400', bg: 'bg-yellow-400/8 border-yellow-400/15' },
          { label: 'Aprovados', value: approved.length, color: 'text-green-400', bg: 'bg-green-400/8 border-green-400/15' },
          { label: 'Rejeitados', value: rejected.length, color: 'text-red-400', bg: 'bg-red-400/8 border-red-400/15' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`font-heading text-2xl font-medium ${s.color}`}>{s.value}</p>
            <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1">
          {(['all', 'pending', 'approved', 'rejected'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Rejeitados'}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou conteúdo..."
            className="w-full bg-surface border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={20} className="text-text-muted" />
            </div>
            <p className="text-text-muted text-sm">Nenhum depoimento encontrado.</p>
          </div>
        ) : (
          filtered.map((t) => {
            const isExpanded = expanded === t.id;
            const busy = actionLoading === t.id;
            const displayName = t.anonymous ? 'Anônimo' : t.name;

            return (
              <div key={t.id} className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
                {/* Row header */}
                <div className="flex items-start gap-4 p-5">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {t.avatar && !t.anonymous ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                        <Image src={t.avatar} alt={displayName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="font-heading text-sm text-text-primary">
                          {t.anonymous ? '?' : (t.name?.charAt(0) ?? '?')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-text-primary text-sm font-medium">{displayName}</span>
                      {t.anonymous && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-text-muted border border-white/10 rounded-full px-1.5 py-0.5">
                          <EyeOff size={9} /> anônimo
                        </span>
                      )}
                      {t.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-accent border border-accent/20 rounded-full px-1.5 py-0.5">
                          <Sparkles size={9} /> destaque
                        </span>
                      )}
                      <StatusBadge status={t.status} />
                    </div>

                    <p className="text-text-muted text-xs">
                      {t.role && <span>{t.role}</span>}
                      {t.age && t.role && <span>, {t.age} anos</span>}
                      {t.age && !t.role && <span>{t.age} anos</span>}
                      {t.submittedAt && (
                        <span className="ml-2 opacity-60">
                          · {new Date(t.submittedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </p>

                    {t.headline && (
                      <p className="text-text-primary text-xs font-medium mt-1.5 italic">&ldquo;{t.headline}&rdquo;</p>
                    )}

                    <p className={`text-text-secondary text-sm mt-1.5 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {t.content}
                    </p>

                    {t.content && t.content.length > 120 && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : t.id)}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-accent mt-1 transition-colors"
                      >
                        {isExpanded ? 'Menos' : 'Ver completo'}
                        <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}

                    {isExpanded && t.transformation && (
                      <div className="border-l-2 border-accent/30 pl-3 mt-3">
                        <p className="text-text-primary text-xs italic">{t.transformation}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {t.rating && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} size={10} className="text-accent fill-accent" />
                          ))}
                        </div>
                      )}
                      {t.productPurchased && (
                        <span className="text-accent text-xs">{t.productPurchased}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {(!t.status || t.status === 'pending' || t.status === 'rejected') && (
                      <button
                        onClick={() => patch(t.id, { status: 'approved' })}
                        disabled={busy}
                        title="Aprovar"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-all disabled:opacity-50"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    {(!t.status || t.status === 'pending' || t.status === 'approved') && (
                      <button
                        onClick={() => patch(t.id, { status: 'rejected' })}
                        disabled={busy}
                        title="Rejeitar"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-all disabled:opacity-50"
                      >
                        <X size={13} />
                      </button>
                    )}
                    {t.status === 'approved' && (
                      <button
                        onClick={() => patch(t.id, { featured: !t.featured })}
                        disabled={busy}
                        title={t.featured ? 'Remover destaque' : 'Destacar'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 ${
                          t.featured
                            ? 'bg-accent/15 text-accent hover:bg-accent/25'
                            : 'bg-white/5 text-text-muted hover:bg-accent/10 hover:text-accent'
                        }`}
                      >
                        <Sparkles size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={busy}
                      title="Excluir"
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/4 text-text-muted hover:bg-red-400/10 hover:text-red-400 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                    {t.status === 'approved' && (
                      <button
                        onClick={() => patch(t.id, { status: 'pending' })}
                        disabled={busy}
                        title="Mover para pendente"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/4 text-text-muted hover:bg-yellow-400/10 hover:text-yellow-400 transition-all disabled:opacity-50"
                      >
                        <Eye size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
