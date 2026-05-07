'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Pencil, Trash2, Plus, X, Check, Star } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary text-xl font-medium">Produtos</h2>
          <p className="text-text-muted text-sm mt-0.5">{products.length} produtos</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2.5 rounded-lg transition-all"
        >
          <Plus size={15} /> Novo produto
        </button>
      </div>

      <div className="rounded-xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-text-muted text-sm">Carregando...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-text-muted text-sm mb-3">Nenhum produto ainda.</p>
            <button onClick={openNew} className="text-accent text-sm hover:underline">Criar o primeiro</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Produto</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Preço</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <p className="text-text-primary text-sm font-medium">{product.title}</p>
                    <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{product.hook}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs border border-white/10 text-text-secondary rounded-full px-2.5 py-1">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-text-primary text-sm">R$ {product.price},00</p>
                    {product.originalPrice && (
                      <p className="text-text-muted text-xs line-through">R$ {product.originalPrice},00</p>
                    )}
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    {product.featured ? (
                      <span className="flex items-center gap-1 text-xs text-accent">
                        <Star size={11} fill="currentColor" /> Destaque
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">Normal</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all">
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
                {editingId ? 'Editar produto' : 'Novo produto'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                <label className="text-text-muted text-xs mb-1.5 block">Link de download (após pagamento)</label>
                <input className="admin-input mb-2" value={form.downloadUrl} onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })} placeholder="https://drive.google.com/... ou use upload abaixo" />
                {editingId && (
                  <UploadPDF
                    productId={editingId}
                    onUploaded={(url) => setForm((f) => ({ ...f, downloadUrl: url }))}
                  />
                )}
                {!editingId && (
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
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.title}
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
