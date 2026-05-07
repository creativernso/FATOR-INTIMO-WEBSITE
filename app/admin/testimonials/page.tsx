'use client';

import { useState, useEffect } from 'react';
import { Testimonial } from '@/lib/types';
import { Pencil, Trash2, Plus, X, Check, Star, MessageSquare } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const emptyForm = {
  name: '',
  role: '',
  content: '',
  transformation: '',
  rating: 5,
  productPurchased: '',
  avatar: '',
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    const res = await fetch('/api/testimonials');
    setTestimonials(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setForm({
      name: t.name,
      role: t.role,
      content: t.content,
      transformation: t.transformation,
      rating: t.rating,
      productPurchased: t.productPurchased || '',
      avatar: t.avatar || '',
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, rating: Number(form.rating) };
    if (editingId) {
      await fetch(`/api/testimonials/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    await fetchTestimonials();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este depoimento?')) return;
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    fetchTestimonials();
  };

  const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Prova social
          </p>
          <h2 className="font-heading text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Depoimentos
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {testimonials.length} {testimonials.length === 1 ? 'depoimento' : 'depoimentos'} cadastrados
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 lg:px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
          style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
          <Plus size={14} /> Novo depoimento
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-text-muted" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>Carregando...</div>
        ) : testimonials.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={20} className="text-text-muted" />
            </div>
            <p className="text-text-muted mb-3" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>Nenhum depoimento ainda.</p>
            <button onClick={openNew} className="text-accent hover:underline" style={{ fontSize: fs('0.82rem', '0.92vw', '0.875rem') }}>Adicionar o primeiro →</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Pessoa', 'Depoimento', 'Nota', ''].map((h, i) => (
                  <th key={i} className={`text-left px-5 lg:px-6 py-4 text-text-muted font-medium tracking-widest uppercase ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 2 ? 'hidden sm:table-cell' : ''} ${i === 3 ? 'text-right' : ''}`}
                    style={{ fontSize: fs('0.62rem', '0.7vw', '0.68rem') }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {testimonials.map((t) => (
                <tr key={t.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-5 lg:px-6 py-4 lg:py-5">
                    <p className="text-text-primary font-medium" style={{ fontSize: fs('0.82rem', '0.95vw', '0.9rem') }}>{t.name}</p>
                    <p className="text-text-muted mt-0.5" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}>{t.role}</p>
                    {t.productPurchased && (
                      <p className="text-accent mt-0.5" style={{ fontSize: fs('0.68rem', '0.76vw', '0.72rem') }}>{t.productPurchased}</p>
                    )}
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden md:table-cell max-w-xs">
                    <p className="text-text-secondary line-clamp-2" style={{ fontSize: fs('0.78rem', '0.88vw', '0.84rem') }}>{t.content}</p>
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden sm:table-cell">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={12} className="text-accent fill-accent" />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/8 transition-all">
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4 pb-6 overflow-auto"
          style={{ background: 'rgba(10,7,3,0.92)', backdropFilter: 'blur(12px)' }}>
          <div className="bg-surface border border-white/8 rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-white/5">
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.95rem', '1.1vw', '1.05rem') }}>
                  {editingId ? 'Editar depoimento' : 'Novo depoimento'}
                </h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>
                  {editingId ? 'Atualize os dados' : 'Adicione uma história de transformação'}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 flex items-center justify-center transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 lg:px-8 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>Nome *</label>
                  <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
                </div>
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>Papel / Profissão</label>
                  <input className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Designer, 29 anos" />
                </div>
              </div>

              <div>
                <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>Depoimento *</label>
                <textarea className="admin-textarea" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="O que a pessoa disse..." />
              </div>

              <div>
                <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>Transformação (frase de impacto)</label>
                <input className="admin-input" value={form.transformation} onChange={(e) => setForm({ ...form, transformation: e.target.value })} placeholder="Saí de... e hoje estou..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>Nota</label>
                  <select className="admin-input" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                    {[5, 4, 3].map((r) => <option key={r} value={r}>{r} estrelas</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>Produto comprado</label>
                  <input className="admin-input" value={form.productPurchased} onChange={(e) => setForm({ ...form, productPurchased: e.target.value })} placeholder="Fator Atração" />
                </div>
              </div>

              <div className="max-w-[160px]">
                <ImageUpload
                  label="Foto (avatar)"
                  value={form.avatar}
                  onChange={(url) => setForm({ ...form, avatar: url })}
                  folder="testimonials"
                  aspect="square"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 lg:px-8 py-5 border-t border-white/5">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-text-muted hover:text-text-primary transition-colors" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.content}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
                style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
                <Check size={14} />
                {saving ? 'Salvando...' : 'Salvar depoimento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
