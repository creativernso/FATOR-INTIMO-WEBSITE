'use client';

import { useState, useEffect, useMemo } from 'react';
import { Post } from '@/lib/types';
import { Pencil, Trash2, Plus, X, Check, Star, Clock, FileText, CalendarClock, List, CalendarDays, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in the viewer's
// local time (no seconds, no timezone suffix).
function toDatetimeLocal(iso: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Psicologia',
  coverImage: '',
  publishedAt: toDatetimeLocal(new Date().toISOString()),
  readTime: 5,
  featured: false,
};

const categories = ['Psicologia', 'Comunicação', 'Atração', 'Autoconhecimento', 'Relacionamentos', 'Geral'];

const categoryColors: Record<string, string> = {
  Psicologia: '#3b82f6',
  Comunicação: '#8b5cf6',
  Atração: '#fe0050',
  Autoconhecimento: '#f59e0b',
  Relacionamentos: '#10b981',
  Geral: '#6b7280',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [views, setViews] = useState<Record<string, number>>({});

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const data: Post[] = await res.json();
    data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => {
    fetch('/api/admin/analytics/post-views').then((r) => (r.ok ? r.json() : {})).then(setViews).catch(() => {});
  }, []);

  // usePathname() gives a leading-slash path like "/blog/my-post", and
  // incrementPageView turns every "/" into "__" — so the leading slash
  // becomes a leading "__" too, giving a key like "__blog__my-post".
  const viewsFor = (slug: string) => views[`__blog__${slug}`] || 0;

  const openNew = () => { setForm({ ...emptyForm }); setEditingId(null); setShowForm(true); };
  const openNewOnDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(9, 0, 0, 0);
    setForm({ ...emptyForm, publishedAt: toDatetimeLocal(d.toISOString()) });
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (post: Post) => {
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category, coverImage: post.coverImage, publishedAt: toDatetimeLocal(post.publishedAt), readTime: post.readTime, featured: post.featured });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    const payload = { ...form, slug, publishedAt: new Date(form.publishedAt).toISOString() };
    if (editingId) {
      await fetch(`/api/posts/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    await fetchPosts();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este artigo?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    fetchPosts();
  };

  const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

  const calendarCells = useMemo(() => {
    const first = startOfMonth(calendarMonth);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const leadingBlanks = first.getDay();
    const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, i) => {
      const dayNum = i - leadingBlanks + 1;
      const date = new Date(first.getFullYear(), first.getMonth(), dayNum);
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const dayPosts = posts.filter((p) => sameDay(new Date(p.publishedAt), date));
      return { date, inMonth, posts: dayPosts };
    });
  }, [calendarMonth, posts]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Conteúdo editorial
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Artigos
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {posts.length} {posts.length === 1 ? 'artigo publicado' : 'artigos publicados'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/8 overflow-hidden">
            {([
              { id: 'list', label: 'Lista', icon: List },
              { id: 'calendar', label: 'Calendário', icon: CalendarDays },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 transition-all ${view === t.id ? 'bg-accent text-white' : 'text-text-muted hover:bg-white/5'}`}
                style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}
              >
                <t.icon size={14} /> <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 lg:px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
            style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}
          >
            <Plus size={14} /> Novo artigo
          </button>
        </div>
      </div>

      {view === 'list' && (
      <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-text-muted" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
            Carregando...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <FileText size={20} className="text-text-muted" />
            </div>
            <p className="text-text-muted mb-3" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>Nenhum artigo ainda.</p>
            <button onClick={openNew} className="text-accent hover:underline" style={{ fontSize: fs('0.82rem', '0.92vw', '0.875rem') }}>
              Criar o primeiro →
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Artigo', 'Categoria', 'Publicação', 'Status', ''].map((h, i) => (
                  <th key={i} className={`text-left px-5 lg:px-6 py-4 text-text-muted font-medium tracking-widest uppercase ${i > 1 && i < 4 ? 'hidden md:table-cell' : ''} ${i === 1 ? 'hidden sm:table-cell' : ''} ${i === 4 ? 'text-right' : ''}`}
                    style={{ fontSize: fs('0.62rem', '0.7vw', '0.68rem') }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {posts.map((post) => {
                const color = categoryColors[post.category] || '#6b7280';
                const isScheduled = new Date(post.publishedAt).getTime() > Date.now();
                return (
                  <tr key={post.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 lg:px-6 py-4 lg:py-5">
                      <p className="text-text-primary font-medium line-clamp-1 flex items-center gap-2" style={{ fontSize: fs('0.82rem', '0.95vw', '0.9rem') }}>
                        {post.title}
                        {isScheduled && (
                          <span className="md:hidden flex-shrink-0 flex items-center gap-1 text-amber-400 border border-amber-400/25 bg-amber-400/10 rounded-full px-2 py-0.5" style={{ fontSize: '10px' }}>
                            <CalendarClock size={10} /> Agendado
                          </span>
                        )}
                      </p>
                      <p className="text-text-muted mt-0.5 flex items-center gap-3" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}>
                        <span className="flex items-center gap-1.5">
                          <Clock size={10} /> {post.readTime}min leitura
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye size={10} /> {viewsFor(post.slug).toLocaleString('pt-BR')} visualizações
                        </span>
                      </p>
                    </td>
                    <td className="px-5 lg:px-6 py-4 hidden sm:table-cell">
                      <span
                        className="px-2.5 py-1 rounded-full border"
                        style={{ fontSize: fs('0.68rem', '0.76vw', '0.72rem'), color, borderColor: `${color}30`, background: `${color}10` }}
                      >
                        {post.category}
                      </span>
                    </td>
                    <td className="px-5 lg:px-6 py-4 hidden md:table-cell" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem') }}>
                      {isScheduled ? (
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <CalendarClock size={12} />
                          {new Date(post.publishedAt).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-text-muted">
                          {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 lg:px-6 py-4 hidden md:table-cell">
                      {post.featured ? (
                        <span className="flex items-center gap-1 text-accent" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>
                          <Star size={11} fill="currentColor" /> Destaque
                        </span>
                      ) : (
                        <span className="text-text-muted" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>Normal</span>
                      )}
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(post)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/8 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      )}

      {view === 'calendar' && (
        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-white/[0.04]">
            <h3 className="text-text-primary font-medium capitalize" style={{ fontSize: fs('0.9rem', '1vw', '0.95rem') }}>
              {calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCalendarMonth(startOfMonth(new Date()))}
                className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 transition-all"
                style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}
              >
                Hoje
              </button>
              <button
                onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-white/[0.04]">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center py-2.5 text-text-muted font-medium tracking-widest uppercase" style={{ fontSize: fs('0.6rem', '0.68vw', '0.65rem') }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarCells.map((cell, i) => {
              const isToday = sameDay(cell.date, new Date());
              return (
                <div
                  key={i}
                  onClick={() => cell.inMonth && openNewOnDate(cell.date)}
                  className={`min-h-24 sm:min-h-28 p-1.5 sm:p-2 border-b border-r border-white/[0.04] ${(i + 1) % 7 === 0 ? 'border-r-0' : ''} ${cell.inMonth ? 'cursor-pointer hover:bg-white/2' : 'opacity-30'} transition-colors`}
                >
                  <p className={`mb-1 ${isToday ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white' : 'text-text-muted'}`} style={{ fontSize: fs('0.68rem', '0.76vw', '0.72rem') }}>
                    {cell.date.getDate()}
                  </p>
                  <div className="space-y-1">
                    {cell.posts.slice(0, 3).map((post) => {
                      const color = categoryColors[post.category] || '#6b7280';
                      const scheduled = new Date(post.publishedAt).getTime() > Date.now();
                      return (
                        <button
                          key={post.id}
                          onClick={(e) => { e.stopPropagation(); openEdit(post); }}
                          className="w-full text-left px-1.5 py-1 rounded-md truncate flex items-center gap-1"
                          style={{ fontSize: fs('0.6rem', '0.68vw', '0.65rem'), color, background: `${color}14` }}
                          title={post.title}
                        >
                          {scheduled && <CalendarClock size={9} className="flex-shrink-0" />}
                          <span className="truncate">{post.title}</span>
                        </button>
                      );
                    })}
                    {cell.posts.length > 3 && (
                      <p className="text-text-muted px-1.5" style={{ fontSize: fs('0.58rem', '0.65vw', '0.62rem') }}>
                        +{cell.posts.length - 3} mais
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4 pb-6 overflow-auto"
          style={{ background: 'rgba(10,7,3,0.92)', backdropFilter: 'blur(12px)' }}
        >
          <div className="bg-surface border border-white/8 rounded-2xl w-full max-w-2xl shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-white/[0.04]">
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.95rem', '1.1vw', '1.05rem') }}>
                  {editingId ? 'Editar artigo' : 'Novo artigo'}
                </h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>
                  {editingId ? 'Atualize os dados do artigo' : 'Preencha os dados para publicar'}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 flex items-center justify-center transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 lg:px-8 py-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                    Título *
                  </label>
                  <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do artigo" />
                </div>
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                    Slug (URL)
                  </label>
                  <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="titulo-do-artigo" />
                </div>
              </div>

              <div>
                <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                  Resumo *
                </label>
                <textarea className="admin-textarea" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Breve descrição do artigo..." />
              </div>

              <div>
                <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                  Conteúdo (HTML)
                </label>
                <textarea className="admin-textarea" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="<p>Conteúdo do artigo...</p>" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                    Categoria
                  </label>
                  <select className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                    Leitura (min)
                  </label>
                  <input type="number" className="admin-input" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: Number(e.target.value) })} min={1} />
                </div>
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                    Data e hora de publicação
                  </label>
                  <input type="datetime-local" className="admin-input" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
                  {new Date(form.publishedAt).getTime() > Date.now() && (
                    <p className="text-amber-400 mt-1.5 flex items-center gap-1.5" style={{ fontSize: fs('0.68rem', '0.75vw', '0.72rem') }}>
                      <CalendarClock size={11} /> Agendado. Só aparece no site nesse horário.
                    </p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                    Destaque
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, featured: !form.featured })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${form.featured ? 'border-accent/40 bg-accent/8 text-accent' : 'border-white/8 text-text-muted hover:border-white/15'}`}
                    style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem') }}
                  >
                    <Star size={12} fill={form.featured ? 'currentColor' : 'none'} />
                    {form.featured ? 'Sim' : 'Não'}
                  </button>
                </div>
              </div>

              <ImageUpload
                label="Imagem de capa"
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
                folder="posts"
                aspect="video"
              />
            </div>

            <div className="flex items-center justify-end gap-3 px-6 lg:px-8 py-5 border-t border-white/[0.04]">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-text-muted hover:text-text-primary transition-colors" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
                style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}
              >
                <Check size={14} />
                {saving ? 'Salvando...' : 'Salvar artigo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
