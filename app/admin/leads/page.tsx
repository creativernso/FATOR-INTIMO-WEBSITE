'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Mail, MessageSquare, Download, Search, Trash2, RefreshCw, CheckCircle, BookOpen, Tag } from 'lucide-react';
import { Lead } from '@/lib/types';

const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [guideFilter, setGuideFilter] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const data = await fetch('/api/leads').then((r) => r.json());
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const guideSlugs = useMemo(() => {
    const slugs = new Set(leads.map((l) => l.guideSlug).filter(Boolean) as string[]);
    return Array.from(slugs).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    let list = [...leads].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filter === 'email') list = list.filter((l) => !!l.email);
    if (filter === 'whatsapp') list = list.filter((l) => !!l.whatsapp && !l.email);
    if (guideFilter !== 'all') list = list.filter((l) => l.guideSlug === guideFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.email || '').toLowerCase().includes(q) ||
          (l.whatsapp || '').includes(q) ||
          (l.guideSlug || '').includes(q)
      );
    }
    return list;
  }, [leads, filter, guideFilter, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este lead?')) return;
    setDeleting(id);
    await fetch('/api/admin/leads/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  };

  const handleExport = () => {
    window.open('/api/admin/leads/export', '_blank');
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const emailCount = leads.filter((l) => !!l.email).length;
  const whatsappCount = leads.filter((l) => !!l.whatsapp).length;
  const guideCount = leads.filter((l) => l.guideDownloaded).length;
  const uniqueGuides = guideSlugs.length;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            CRM
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Leads
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {leads.length} {leads.length === 1 ? 'lead captado' : 'leads captados'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-muted hover:text-text-primary px-3.5 py-2.5 rounded-xl text-sm transition-all"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-white/10 hover:border-accent/30 text-text-muted hover:text-accent px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            {exported ? <CheckCircle size={13} className="text-green-400" /> : <Download size={13} />}
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: leads.length, icon: Users, color: '#fe0050', bg: 'rgba(254,0,80,0.06)', border: 'rgba(254,0,80,0.12)' },
          { label: 'Por e-mail', value: emailCount, icon: Mail, color: '#3b82f6', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.12)' },
          { label: 'Por WhatsApp', value: whatsappCount, icon: MessageSquare, color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.12)' },
          { label: 'Guia enviado', value: guideCount, icon: Download, color: '#a855f7', bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.12)' },
          { label: 'Guias únicos', value: uniqueGuides, icon: BookOpen, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.12)' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border p-4 lg:p-5" style={{ background: s.bg, borderColor: s.border }}>
            <s.icon size={14} style={{ color: s.color }} className="mb-3" />
            <p className="font-body font-semibold leading-none" style={{ fontSize: fs('1.4rem', '2vw', '1.8rem'), color: s.color }}>
              {s.value}
            </p>
            <p className="text-text-muted mt-1" style={{ fontSize: fs('0.68rem', '0.78vw', '0.74rem') }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail, WhatsApp ou guia..."
              className="admin-input pl-9 w-full"
            />
          </div>
          <div className="flex rounded-xl overflow-hidden border border-white/8">
            {(['all', 'email', 'whatsapp'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 text-xs font-medium transition-all ${
                  filter === f ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'email' ? 'E-mail' : 'WhatsApp'}
              </button>
            ))}
          </div>
        </div>
        {guideSlugs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-text-muted text-xs flex items-center gap-1"><Tag size={10} /> Por guia:</span>
            {(['all', ...guideSlugs] as string[]).map((slug) => (
              <button
                key={slug}
                onClick={() => setGuideFilter(slug)}
                className={`px-3 py-1 rounded-full text-xs transition-all border ${
                  guideFilter === slug
                    ? 'bg-accent/15 text-accent border-accent/25'
                    : 'border-white/8 text-text-muted hover:border-white/16 hover:text-text-secondary'
                }`}
              >
                {slug === 'all' ? `Todos (${leads.length})` : `${slug} (${leads.filter((l) => l.guideSlug === slug).length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-text-muted" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <Users size={20} className="text-text-muted" />
            </div>
            <p className="text-text-muted" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>
              {search || filter !== 'all' ? 'Nenhum lead encontrado.' : 'Nenhum lead ainda.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #333333' }}>
                {['Lead', 'Contato', 'Guia', 'Tags', 'Data', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`text-left px-5 lg:px-6 py-4 font-medium tracking-widest uppercase ${i === 2 ? 'hidden md:table-cell' : ''} ${i === 3 ? 'hidden xl:table-cell' : ''} ${i === 4 ? 'hidden lg:table-cell' : ''} ${i === 5 ? 'text-right' : ''}`}
                    style={{ fontSize: fs('0.6rem', '0.68vw', '0.66rem'), color: '#666666' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="group hover:bg-white/2 transition-colors" style={{ borderBottom: '1px solid #1e1e1e' }}>
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0 text-accent font-semibold uppercase"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {lead.name.charAt(0)}
                      </div>
                      <span className="font-medium" style={{ fontSize: fs('0.82rem', '0.9vw', '0.875rem'), color: '#e0e0e0' }}>
                        {lead.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-4">
                    {lead.email ? (
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} className="text-blue-400 flex-shrink-0" />
                        <span className="truncate max-w-[180px]" style={{ fontSize: fs('0.72rem', '0.8vw', '0.77rem'), color: '#aaaaaa' }}>
                          {lead.email}
                        </span>
                      </div>
                    ) : lead.whatsapp ? (
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={11} className="text-green-400 flex-shrink-0" />
                        <span style={{ fontSize: fs('0.72rem', '0.8vw', '0.77rem'), color: '#aaaaaa' }}>
                          {lead.whatsapp}
                        </span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden md:table-cell">
                    {lead.guideSlug ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <BookOpen size={10} className="text-accent flex-shrink-0" />
                          <span className="text-text-secondary font-mono" style={{ fontSize: '0.7rem' }}>{lead.guideSlug}</span>
                        </div>
                        {lead.guideDownloaded && (
                          <span className="flex items-center gap-1 text-green-400" style={{ fontSize: '0.65rem' }}>
                            <CheckCircle size={9} /> Enviado
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs border border-white/8" style={{ color: '#888888' }}>
                        {lead.source}
                      </span>
                    )}
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden xl:table-cell">
                    {lead.tags && lead.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[9px] border border-white/6 rounded px-1.5 py-0.5 text-text-muted">{tag}</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#555555' }}>—</span>
                    )}
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden lg:table-cell" style={{ fontSize: fs('0.72rem', '0.8vw', '0.76rem'), color: '#888888' }}>
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    <span className="block" style={{ fontSize: '0.65rem', color: '#555555' }}>
                      {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        disabled={deleting === lead.id}
                        className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={13} className={deleting === lead.id ? 'animate-pulse' : ''} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-text-muted" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}>
          Mostrando {filtered.length} de {leads.length} leads
        </p>
      )}
    </div>
  );
}
