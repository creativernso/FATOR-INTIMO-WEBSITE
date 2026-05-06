'use client';

import { useState, useEffect } from 'react';
import { Testimonial } from '@/lib/types';
import { Pencil, Trash2, Plus, X, Check, Star } from 'lucide-react';

const emptyForm = {
  name: '',
  role: '',
  content: '',
  transformation: '',
  rating: 5,
  productPurchased: '',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary text-xl font-medium">Depoimentos</h2>
          <p className="text-text-muted text-sm mt-0.5">{testimonials.length} depoimentos</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2.5 rounded-lg transition-all">
          <Plus size={15} /> Novo depoimento
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-text-muted text-sm">Carregando...</div>
        ) : testimonials.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-text-muted text-sm mb-3">Nenhum depoimento ainda.</p>
            <button onClick={openNew} className="text-accent text-sm hover:underline">Adicionar o primeiro</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Pessoa</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">Depoimento</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Nota</th>
                <th className="p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <p className="text-text-primary text-sm font-medium">{t.name}</p>
                    <p className="text-text-muted text-xs">{t.role}</p>
                    {t.productPurchased && (
                      <p className="text-accent text-xs mt-0.5">{t.productPurchased}</p>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-text-secondary text-xs line-clamp-2 max-w-xs">{t.content}</p>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={11} className="text-accent fill-accent" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all">
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
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-text-primary font-medium">{editingId ? 'Editar depoimento' : 'Novo depoimento'}</h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Nome *</label>
                  <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Papel / Profissão</label>
                  <input className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Designer, 29 anos" />
                </div>
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Depoimento *</label>
                <textarea className="admin-textarea" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="O que a pessoa disse..." />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Transformação (frase de impacto)</label>
                <input className="admin-input" value={form.transformation} onChange={(e) => setForm({ ...form, transformation: e.target.value })} placeholder="Saí de... e hoje estou..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Nota</label>
                  <select className="admin-input" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                    {[5, 4, 3].map((r) => <option key={r} value={r}>{r} estrelas</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Produto comprado</label>
                  <input className="admin-input" value={form.productPurchased} onChange={(e) => setForm({ ...form, productPurchased: e.target.value })} placeholder="Fator Atração" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.content}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm transition-all">
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
