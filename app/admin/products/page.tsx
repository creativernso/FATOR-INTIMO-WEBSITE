'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Pencil, Trash2, Plus, X, Check, Star, Package } from 'lucide-react';
import UploadPDF from './UploadPDF';
import ImageUpload from '@/components/admin/ImageUpload';

const emptyForm = {
  title: '',
  hook: '',
  description: '',
  price: 47,
  originalPrice: '',
  coverImage: '',
  checkoutUrl: '#',
  featured: false,
  category: 'Atração',
  tags: '',
  downloadUrl: '',
  benefits: '',
  whatYouLearn: '',
  forWho: '',
  videoUrl: '',
  countdownEnabled: false,
  countdownEndsAt: '',
  countdownText: '',
};

const categories = ['Atração', 'Intimidade', 'Autoconhecimento', 'Comunicação', 'Relacionamentos'];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    setProducts(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      title: product.title,
      hook: product.hook,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice?.toString() || '',
      coverImage: product.coverImage,
      checkoutUrl: product.checkoutUrl,
      featured: product.featured,
      category: product.category,
      tags: product.tags.join(', '),
      downloadUrl: product.downloadUrl || '',
      benefits: (product.benefits || []).join('\n'),
      whatYouLearn: (product.whatYouLearn || []).join('\n'),
      forWho: (product.forWho || []).join('\n'),
      videoUrl: product.videoUrl || '',
      countdownEnabled: product.countdownEnabled || false,
      countdownEndsAt: product.countdownEndsAt || '',
      countdownText: product.countdownText || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const splitLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      benefits: splitLines(form.benefits),
      whatYouLearn: splitLines(form.whatYouLearn),
      forWho: splitLines(form.forWho),
    };

    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    await fetchProducts();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Catálogo
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Produtos
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {products.length} {products.length === 1 ? 'produto' : 'produtos'} no catálogo
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 lg:px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
          style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}
        >
          <Plus size={14} /> Novo produto
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-text-muted" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>Carregando...</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <Package size={20} className="text-text-muted" />
            </div>
            <p className="text-text-muted mb-3" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>Nenhum produto ainda.</p>
            <button onClick={openNew} className="text-accent hover:underline" style={{ fontSize: fs('0.82rem', '0.92vw', '0.875rem') }}>Criar o primeiro →</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Produto', 'Categoria', 'Preço', 'Status', ''].map((h, i) => (
                  <th key={i}
                    className={`text-left px-5 lg:px-6 py-4 text-text-muted font-medium tracking-widest uppercase ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 3 ? 'hidden sm:table-cell' : ''} ${i === 4 ? 'text-right' : ''}`}
                    style={{ fontSize: fs('0.62rem', '0.7vw', '0.68rem') }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-5 lg:px-6 py-4 lg:py-5">
                    <p className="text-text-primary font-medium" style={{ fontSize: fs('0.82rem', '0.95vw', '0.9rem') }}>{product.title}</p>
                    <p className="text-text-muted mt-0.5 line-clamp-1" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}>{product.hook}</p>
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden md:table-cell">
                    <span className="border border-white/10 text-text-secondary rounded-full px-2.5 py-1" style={{ fontSize: fs('0.68rem', '0.76vw', '0.72rem') }}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 lg:px-6 py-4">
                    <p className="text-text-primary font-medium" style={{ fontSize: fs('0.82rem', '0.92vw', '0.875rem') }}>
                      R$ {product.price},00
                    </p>
                    {product.originalPrice && (
                      <p className="text-text-muted line-through" style={{ fontSize: fs('0.68rem', '0.76vw', '0.72rem') }}>
                        R$ {product.originalPrice},00
                      </p>
                    )}
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden sm:table-cell">
                    {product.featured ? (
                      <span className="flex items-center gap-1 text-accent" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>
                        <Star size={11} fill="currentColor" /> Destaque
                      </span>
                    ) : (
                      <span className="text-text-muted" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>Normal</span>
                    )}
                  </td>
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(product)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/8 transition-all">
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
          <div className="bg-surface border border-white/8 rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-white/[0.04]">
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.95rem', '1.1vw', '1.05rem') }}>
                  {editingId ? 'Editar produto' : 'Novo produto'}
                </h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>
                  {editingId ? 'Atualize os dados do produto' : 'Preencha os dados para adicionar'}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 flex items-center justify-center transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 lg:px-8 py-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Título *</label>
                  <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome do produto" />
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Categoria</label>
                  <select className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Hook emocional</label>
                <input className="admin-input" value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder="Frase de impacto emocional..." />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Descrição</label>
                <textarea className="admin-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição detalhada do produto..." />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Preço (R$) *</label>
                  <input type="number" className="admin-input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Preço original</label>
                  <input type="number" className="admin-input" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Opcional" />
                </div>
                <div className="flex flex-col">
                  <label className="text-text-muted text-xs mb-1.5 block">Destaque</label>
                  <button type="button" onClick={() => setForm({ ...form, featured: !form.featured })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-all ${form.featured ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/10 text-text-muted'}`}>
                    <Star size={12} fill={form.featured ? 'currentColor' : 'none'} />
                    {form.featured ? 'Sim' : 'Não'}
                  </button>
                </div>
              </div>

              <ImageUpload
                label="Imagem de capa"
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
                folder="products"
                aspect="portrait"
              />

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">PDF de download (após pagamento)</label>
                {editingId ? (
                  <UploadPDF
                    productId={editingId}
                    onUploaded={(url) => setForm((f) => ({ ...f, downloadUrl: url }))}
                  />
                ) : (
                  <p className="text-text-muted text-xs">Salve o produto primeiro para fazer upload do PDF.</p>
                )}
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Tags (separadas por vírgula)</label>
                <input className="admin-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="psicologia, atração, relacionamentos" />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Para quem é (uma por linha)</label>
                <textarea className="admin-textarea" rows={3} value={form.forWho} onChange={(e) => setForm({ ...form, forWho: e.target.value })} placeholder="Pessoas que querem...&#10;Quem busca..." />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">O que vai descobrir (um por linha)</label>
                <textarea className="admin-textarea" rows={4} value={form.whatYouLearn} onChange={(e) => setForm({ ...form, whatYouLearn: e.target.value })} placeholder="Os 4 mecanismos de...&#10;Como criar..." />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Benefícios (um por linha)</label>
                <textarea className="admin-textarea" rows={3} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder="Entenda como a atração funciona...&#10;Pare de..." />
              </div>

              {/* Video */}
              <div className="border-t border-white/[0.04] pt-5">
                <p className="text-text-primary text-xs font-medium mb-3 tracking-wide uppercase opacity-60">Vídeo de vendas</p>
                <label className="text-text-muted text-xs mb-1.5 block">URL do vídeo (YouTube, Vimeo ou MP4)</label>
                <input className="admin-input" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..." />
              </div>

              {/* Countdown */}
              <div className="border-t border-white/[0.04] pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-text-primary text-xs font-medium tracking-wide uppercase opacity-60">Countdown de urgência</p>
                  <button type="button" onClick={() => setForm({ ...form, countdownEnabled: !form.countdownEnabled })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${form.countdownEnabled ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/10 text-text-muted'}`}>
                    {form.countdownEnabled ? '✓ Ativo' : 'Inativo'}
                  </button>
                </div>
                {form.countdownEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-text-muted text-xs mb-1.5 block">Expira em</label>
                      <input
                        type="datetime-local"
                        className="admin-input"
                        value={(() => {
                          if (!form.countdownEndsAt) return '';
                          const d = new Date(form.countdownEndsAt);
                          if (isNaN(d.getTime())) return '';
                          // Format as local YYYY-MM-DDTHH:MM (what datetime-local expects)
                          const pad = (n: number) => String(n).padStart(2, '0');
                          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        })()}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) { setForm({ ...form, countdownEndsAt: '' }); return; }
                          const d = new Date(v);
                          if (!isNaN(d.getTime())) setForm({ ...form, countdownEndsAt: d.toISOString() });
                        }}
                      />
                      {form.countdownEndsAt && new Date(form.countdownEndsAt).getTime() < Date.now() && (
                        <p className="text-yellow-400 text-xs mt-1.5 flex items-center gap-1">
                          ⚠️ A data está no passado. O countdown não aparecerá na página do produto até você escolher uma data futura.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-text-muted text-xs mb-1.5 block">Texto do countdown</label>
                      <input className="admin-input" value={form.countdownText} onChange={(e) => setForm({ ...form, countdownText: e.target.value })} placeholder="Oferta válida por tempo limitado" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 lg:px-8 py-5 border-t border-white/[0.04]">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-text-muted hover:text-text-primary transition-colors" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.title}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
                style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
                <Check size={14} />
                {saving ? 'Salvando...' : 'Salvar produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
