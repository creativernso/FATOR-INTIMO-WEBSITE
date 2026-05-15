'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/types';
import { Pencil, Trash2, Plus, X, Check, Star, Clock, FileText } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Psicologia',
  coverImage: '',
  publishedAt: new Date().toISOString().split('T')[0],
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

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    setPosts(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openNew = () => { setForm({ ...emptyForm }); setEditingId(null); setShowForm(true); };
  const openEdit = (post: Post) => {
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category, coverImage: post.coverImage, publishedAt: post.publishedAt, readTime: post.readTime, featured: post.featured });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    const payload = { ...form, slug };
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
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 lg:px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
          style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}
        >
          <Plus size={14} /> Novo artigo
        </button>
      </div>

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
                {['Artigo', 'Categoria', 'Data', 'Status', ''].map((h, i) => (
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
                return (
                  <tr key={post.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 lg:px-6 py-4 lg:py-5">
                      <p className="text-text-primary font-medium line-clamp-1" style={{ fontSize: fs('0.82rem', '0.95vw', '0.9rem') }}>
                        {post.title}
                      </p>
                      <p className="text-text-muted mt-0.5 flex items-center gap-1.5" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}>
                        <Clock size={10} /> {post.readTime}min leitura
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
                    <td className="px-5 lg:px-6 py-4 text-text-muted hidden md:table-cell" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem') }}>
                      {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
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
                    Data
                  </label>
                  <input type="date" className="admin-input" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
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
