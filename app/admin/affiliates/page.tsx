'use client';

import { useState, useEffect } from 'react';
import { Affiliate, AffiliateReferral } from '@/lib/types';
import {
  Check, X, Clock, Handshake, MousePointerClick, ShoppingBag, Wallet,
  ChevronDown, Copy, CheckCheck,
} from 'lucide-react';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

function StatusBadge({ status }: { status: Affiliate['status'] }) {
  if (status === 'pending') {
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

function money(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, rRes] = await Promise.all([
        fetch('/api/admin/affiliates'),
        fetch('/api/admin/affiliates/referrals'),
      ]);
      if (aRes.ok) setAffiliates(await aRes.json());
      if (rRes.ok) setReferrals(await rRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const patchAffiliate = async (id: string, data: Record<string, unknown>) => {
    setBusy(id);
    await fetch(`/api/admin/affiliates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchAll();
    setBusy(null);
  };

  const markPaid = async (referralId: string) => {
    setBusy(referralId);
    await fetch(`/api/admin/affiliates/referrals/${referralId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    });
    await fetchAll();
    setBusy(null);
  };

  const copyLink = (affiliate: Affiliate) => {
    const link = `${window.location.origin}/?ref=${affiliate.code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(affiliate.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const pending = affiliates.filter((a) => a.status === 'pending');
  const approved = affiliates.filter((a) => a.status === 'approved');
  const rejected = affiliates.filter((a) => a.status === 'rejected');

  const filtered = affiliates.filter((a) => {
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'approved') return a.status === 'approved';
    if (filter === 'rejected') return a.status === 'rejected';
    return true;
  });

  const totalCommissionPending = referrals.filter((r) => r.status === 'pending').reduce((s, r) => s + r.commissionAmount, 0);
  const totalCommissionPaid = referrals.filter((r) => r.status === 'paid').reduce((s, r) => s + r.commissionAmount, 0);
  const totalSalesAttributed = referrals.reduce((s, r) => s + r.saleAmount, 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: 'clamp(0.62rem, 0.72vw, 0.7rem)' }}>
            Programa de afiliados
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)' }}>
            Afiliados
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.78rem, 0.9vw, 0.875rem)' }}>
            {affiliates.length} afiliados · {pending.length} pendentes
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/5 bg-surface p-5">
          <p className="text-text-muted mb-2 text-xs">Vendas atribuídas</p>
          <p className="font-body font-semibold text-2xl text-text-primary">{money(totalSalesAttributed)}</p>
          <p className="text-text-muted mt-1 text-xs">{referrals.length} vendas via afiliados</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-surface p-5">
          <p className="text-text-muted mb-2 text-xs">Comissão pendente</p>
          <p className="font-body font-semibold text-2xl text-yellow-400">{money(totalCommissionPending)}</p>
          <p className="text-text-muted mt-1 text-xs">a pagar aos afiliados</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-surface p-5">
          <p className="text-text-muted mb-2 text-xs">Comissão paga</p>
          <p className="font-body font-semibold text-2xl text-green-400">{money(totalCommissionPaid)}</p>
          <p className="text-text-muted mt-1 text-xs">já quitado</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1 w-fit">
        {([
          ['all', `Todos (${affiliates.length})`],
          ['pending', `Pendentes (${pending.length})`],
          ['approved', `Aprovados (${approved.length})`],
          ['rejected', `Rejeitados (${rejected.length})`],
        ] as [Filter, string][]).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <Handshake size={20} className="text-text-muted" />
            </div>
            <p className="text-text-muted text-sm">Nenhum afiliado encontrado.</p>
          </div>
        ) : (
          filtered.map((a) => {
            const isExpanded = expanded === a.id;
            const isBusy = busy === a.id;
            const ownReferrals = referrals.filter((r) => r.affiliateId === a.id);
            const totalSales = ownReferrals.reduce((s, r) => s + r.saleAmount, 0);
            const totalCommission = ownReferrals.reduce((s, r) => s + r.commissionAmount, 0);
            const pendingCommission = ownReferrals.filter((r) => r.status === 'pending').reduce((s, r) => s + r.commissionAmount, 0);

            return (
              <div key={a.id} className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-text-primary text-sm font-medium">{a.name}</span>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-text-muted text-xs">{a.email}</p>
                      {a.socialHandle && <p className="text-text-muted text-xs mt-0.5">{a.socialHandle}</p>}
                      {a.message && (
                        <p className="text-text-secondary text-xs mt-2 leading-relaxed italic border-l-2 border-white/10 pl-2.5">
                          &ldquo;{a.message}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <button
                          onClick={() => copyLink(a)}
                          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
                        >
                          {copiedId === a.id ? <CheckCheck size={11} /> : <Copy size={11} />}
                          {copiedId === a.id ? 'Copiado' : `?ref=${a.code}`}
                        </button>
                        <span className="flex items-center gap-1 text-text-muted text-xs">
                          <MousePointerClick size={11} /> {a.clicks} cliques
                        </span>
                        <span className="flex items-center gap-1 text-text-muted text-xs">
                          <ShoppingBag size={11} /> {ownReferrals.length} vendas
                        </span>
                        <span className="flex items-center gap-1 text-text-muted text-xs">
                          <Wallet size={11} /> {money(totalCommission)} comissão
                          {pendingCommission > 0 && <span className="text-yellow-400">({money(pendingCommission)} pendente)</span>}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <label className="text-text-muted text-[10px] uppercase tracking-wider">Comissão:</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={a.commissionRate}
                          disabled={isBusy}
                          onBlur={(e) => {
                            const value = Number(e.target.value);
                            if (value !== a.commissionRate && !Number.isNaN(value)) {
                              patchAffiliate(a.id, { commissionRate: value });
                            }
                          }}
                          className="bg-white/4 border border-white/8 rounded-lg px-2 py-1 text-xs text-text-secondary w-16 focus:outline-none focus:border-accent/30"
                        />
                        <span className="text-text-muted text-xs">%</span>
                        {a.pixKey && (
                          <span className="text-text-muted text-xs ml-3">PIX: <span className="text-text-secondary">{a.pixKey}</span></span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {a.status !== 'approved' && (
                        <button
                          onClick={() => patchAffiliate(a.id, { status: 'approved' })}
                          disabled={isBusy}
                          title="Aprovar"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-all disabled:opacity-50"
                        >
                          <Check size={13} />
                        </button>
                      )}
                      {a.status !== 'rejected' && (
                        <button
                          onClick={() => patchAffiliate(a.id, { status: 'rejected' })}
                          disabled={isBusy}
                          title="Rejeitar"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-all disabled:opacity-50"
                        >
                          <X size={13} />
                        </button>
                      )}
                      {ownReferrals.length > 0 && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : a.id)}
                          title="Ver vendas"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/4 text-text-muted hover:bg-white/8 transition-all"
                        >
                          <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && ownReferrals.length > 0 && (
                  <div className="border-t border-white/5 divide-y divide-white/[0.04]">
                    {ownReferrals.map((r) => (
                      <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-text-secondary text-xs font-medium truncate">{r.productTitle}</p>
                          <p className="text-text-muted text-[11px] mt-0.5">
                            {new Date(r.createdAt).toLocaleDateString('pt-BR')} · venda {money(r.saleAmount)}
                          </p>
                        </div>
                        <p className="text-accent text-xs font-medium flex-shrink-0">{money(r.commissionAmount)}</p>
                        {r.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-400/10 text-green-400 border border-green-400/20 flex-shrink-0">
                            <Check size={9} /> Pago
                          </span>
                        ) : (
                          <button
                            onClick={() => markPaid(r.id)}
                            disabled={busy === r.id}
                            className="text-[10px] text-yellow-400 border border-yellow-400/20 hover:bg-yellow-400/10 px-2 py-0.5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                          >
                            Marcar pago
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
