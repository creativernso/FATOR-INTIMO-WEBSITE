'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/types';
import { Pencil, Trash2, Plus, X, Check, Star, Clock } from 'lucide-react';

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

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openNew = () => {
    setForm({ ...emptyForm, slug: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (post: Post) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      coverImage: post.coverImage,
      publishedAt: post.publishedAt,
      readTime: post.readTime,
      featured: post.featured,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    const payload = { ...form, slug };

    if (editingId) {
      await fetch(`/api/posts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    await fetchPosts();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    fetchPosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary text-xl font-medium">Artigos</h2>
          <p className="text-text-muted text-sm mt-0.5">{posts.length} artigos publicados</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2.5 rounded-lg transition-all"
        >
          <Plus size={15} /> Novo artigo
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-text-muted text-sm">Carregando...</div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-text-muted text-sm mb-3">Nenhum artigo ainda.</p>
            <button onClick={openNew} className="text-accent text-sm hover:underline">
              Criar o primeiro
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Título</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">Data</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <p className="text-text-primary text-sm font-medium line-clamp-1">{post.title}</p>
                    <p className="text-text-muted text-xs mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {post.readTime}min
                    </p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs border border-white/10 text-text-secondary rounded-full px-2.5 py-1">
                      {post.category}
                    </span>
                  </td>
                  <td className="p-4 text-text-muted text-xs hidden md:table-cell">
                    {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    {post.featured ? (
                      <span className="flex items-center gap-1 text-xs text-accent">
                        <Star size={11} fill="currentColor" /> Destaque
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">Normal</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(post)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-10 overflow-auto"
          style={{ background: 'rgba(15,10,4,0.9)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-text-primary font-medium">
                {editingId ? 'Editar artigo' : 'Novo artigo'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Título *</label>
                  <input
                    className="admin-input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Título do artigo"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Slug (URL)</label>
                  <input
                    className="admin-input"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="titulo-do-artigo"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Resumo *</label>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Breve descrição do artigo..."
                />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Conteúdo (HTML)</label>
                <textarea
                  className="admin-textarea"
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="<p>Conteúdo do artigo...</p>"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Categoria</label>
                  <select
                    className="admin-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Tempo (min)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: Number(e.target.value) })}
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Data</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-text-muted text-xs mb-1.5 block">Destaque</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, featured: !form.featured })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-all ${
                      form.featured
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-white/10 text-text-muted'
                    }`}
                  >
                    <Star size={12} fill={form.featured ? 'currentColor' : 'none'} />
                    {form.featured ? 'Sim' : 'Não'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">URL da imagem de capa</label>
                <input
                  className="admin-input"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm transition-all"
              >
                <Check size={14} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
