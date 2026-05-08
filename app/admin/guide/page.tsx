'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit2, Trash2, BookOpen, Upload, Check, X, Eye, EyeOff,
  Sparkles, Download, Tag, Search, ExternalLink,
} from 'lucide-react';
import { Guide } from '@/lib/types';
import { v4 as uuid } from 'uuid';

const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

type Mode = 'list' | 'create' | { type: 'edit'; guide: Guide };

const emptyGuide = (): Guide => ({
  id: uuid(),
  slug: '',
  locale: 'pt',
  title: '',
  subtitle: '',
  description: '',
  emotionalHook: '',
  bullets: [],
  ctaText: 'Quero o Guia Gratuito',
  coverImage: '',
  pdfPath: '',
  tags: [],
  category: '',
  featured: false,
  published: false,
  downloadCount: 0,
  formTitle: 'Quero o guia gratuito',
  formSubtitle: 'Preencha abaixo e receba acesso imediato.',
  successTitle: 'Acesso confirmado!',
  successMessage: 'O guia foi enviado para o seu e-mail.',
  authorName: 'Rafael Moreira',
  authorRole: 'Especialista em Psicologia das Relações',
  authorQuote: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function AdminGuidePage() {
  const [mode, setMode] = useState<Mode>('list');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Guide>(emptyGuide());
  const [newBullet, setNewBullet] = useState('');
  const [newTag, setNewTag] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/guides');
      if (res.ok) setGuides(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGuides(); }, []);

  const startCreate = () => { setForm(emptyGuide()); setMode('create'); };
  const startEdit = (guide: Guide) => { setForm({ ...guide }); setMode({ type: 'edit', guide }); };
  const cancelForm = () => setMode('list');

  const setField = <K extends keyof Guide>(key: K, value: Guide[K]) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'title' && mode === 'create') updated.slug = slugify(value as string);
      return updated;
    });
  };

  const addBullet = () => {
    if (!newBullet.trim()) return;
    setField('bullets', [...(form.bullets ?? []), newBullet.trim()]);
    setNewBullet('');
  };

  const removeBullet = (i: number) => setField('bullets', (form.bullets ?? []).filter((_, idx) => idx !== i));

  const addTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim().toLowerCase();
    if (!(form.tags ?? []).includes(tag)) setField('tags', [...(form.tags ?? []), tag]);
    setNewTag('');
  };

  const removeTag = (tag: string) => setField('tags', (form.tags ?? []).filter((t) => t !== tag));

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('Título obrigatório.', false); return; }
    if (!form.slug.trim()) { showToast('Slug obrigatório.', false); return; }
    setSaving(true);
    try {
      const isCreate = mode === 'create';
      const res = await fetch('/api/admin/guides', {
        method: isCreate ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchGuides();
        setMode('list');
        showToast(isCreate ? 'Guia criado!' : 'Guia salvo!');
      } else {
        const d = await res.json();
        showToast(d.error || 'Erro ao salvar.', false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (guide: Guide) => {
    if (!confirm(`Excluir "${guide.title}"?`)) return;
    await fetch('/api/admin/guides', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: guide.id }),
    });
    await fetchGuides();
    showToast('Guia excluído.');
  };

  const togglePublished = async (guide: Guide) => {
    await fetch('/api/admin/guides', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...guide, published: !guide.published }),
    });
    await fetchGuides();
  };

  const toggleFeatured = async (guide: Guide) => {
    await fetch('/api/admin/guides', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...guide, featured: !guide.featured }),
    });
    await fetchGuides();
  };

  const uploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('guideId', form.id);
    try {
      const res = await fetch('/api/admin/guides/upload-pdf', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) { setField('pdfPath', data.filePath); showToast('PDF enviado!'); }
      else showToast(data.error || 'Erro no upload.', false);
    } finally {
      setPdfUploading(false);
      if (pdfRef.current) pdfRef.current.value = '';
    }
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('guideId', form.id);
    try {
      const res = await fetch('/api/admin/guides/upload-cover', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) { setField('coverImage', data.coverImage); showToast('Capa enviada!'); }
      else showToast(data.error || 'Erro no upload.', false);
    } finally {
      setCoverUploading(false);
      if (coverRef.current) coverRef.current.value = '';
    }
  };

  const filteredGuides = guides.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return g.title.toLowerCase().includes(q) || g.slug.includes(q) || (g.tags ?? []).some((t) => t.includes(q));
  });

  const isFormMode = mode === 'create' || (typeof mode === 'object' && mode.type === 'edit');

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl ${
          toast.ok ? 'bg-green-500/15 border border-green-500/25 text-green-400' : 'bg-red-500/15 border border-red-500/25 text-red-400'
        }`}>
          {toast.ok ? <Check size={14} /> : <X size={14} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Ecossistema
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            {isFormMode ? (mode === 'create' ? 'Novo Guia' : 'Editar Guia') : 'Guias Gratuitos'}
          </h2>
          {!isFormMode && (
            <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
              {guides.length} guia{guides.length !== 1 ? 's' : ''} · {guides.filter((g) => g.published).length} publicado{guides.filter((g) => g.published).length !== 1 ? 's' : ''} · {guides.reduce((s, g) => s + (g.downloadCount ?? 0), 0)} downloads totais
            </p>
          )}
        </div>
        {!isFormMode ? (
          <button onClick={startCreate} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Plus size={14} /> Novo Guia
          </button>
        ) : (
          <button onClick={cancelForm} className="text-text-muted hover:text-text-primary text-sm transition-colors">← Voltar</button>
        )}
      </div>

      {/* ── LIST VIEW ── */}
      {!isFormMode && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: guides.length, color: 'text-text-primary', bg: 'bg-white/4 border-white/8' },
              { label: 'Publicados', value: guides.filter((g) => g.published).length, color: 'text-green-400', bg: 'bg-green-400/8 border-green-400/15' },
              { label: 'Em destaque', value: guides.filter((g) => g.featured).length, color: 'text-accent', bg: 'bg-accent/8 border-accent/15' },
              { label: 'Downloads', value: guides.reduce((s, g) => s + (g.downloadCount ?? 0), 0), color: 'text-blue-400', bg: 'bg-blue-400/8 border-blue-400/15' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
                <p className={`font-heading text-2xl font-medium ${s.color}`}>{s.value}</p>
                <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar guias..."
              className="w-full bg-surface border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors" />
          </div>

          {loading ? (
            <div className="text-center py-12 text-text-muted text-sm">Carregando...</div>
          ) : filteredGuides.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-surface p-16 text-center">
              <BookOpen size={36} className="text-white/10 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-light text-text-primary mb-2">Nenhum guia ainda</h3>
              <p className="text-text-muted text-sm mb-6">Crie o primeiro guia do ecossistema Fator Íntimo.</p>
              <button onClick={startCreate} className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all">
                Criar primeiro guia
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuides.map((guide) => (
                <div key={guide.id} className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
                  <div className="flex items-start gap-4 p-5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/4 flex items-center justify-center border border-white/5">
                      {guide.coverImage ? (
                        <img src={guide.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={18} className="text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-text-primary text-sm font-medium">{guide.title}</h3>
                        {guide.featured && (
                          <span className="text-[9px] text-accent border border-accent/20 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                            <Sparkles size={7} /> Destaque
                          </span>
                        )}
                        {guide.published ? (
                          <span className="text-[9px] text-green-400 border border-green-400/20 rounded-full px-1.5 py-0.5">Publicado</span>
                        ) : (
                          <span className="text-[9px] text-text-muted border border-white/8 rounded-full px-1.5 py-0.5">Rascunho</span>
                        )}
                      </div>
                      <p className="text-text-muted text-xs mb-1.5 font-mono">/guia/{guide.slug}</p>
                      <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                        <span className="flex items-center gap-1"><Download size={9} /> {guide.downloadCount ?? 0} downloads</span>
                        {guide.pdfPath && <span className="text-green-400/70">PDF ✓</span>}
                        {(guide.tags ?? []).slice(0, 3).map((t) => (
                          <span key={t} className="border border-white/6 rounded px-1 text-[9px]">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => togglePublished(guide)} title={guide.published ? 'Despublicar' : 'Publicar'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${guide.published ? 'bg-green-400/10 text-green-400 hover:bg-green-400/20' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}>
                        {guide.published ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button onClick={() => toggleFeatured(guide)} title={guide.featured ? 'Remover destaque' : 'Destacar'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${guide.featured ? 'bg-accent/15 text-accent hover:bg-accent/25' : 'bg-white/5 text-text-muted hover:bg-accent/10 hover:text-accent'}`}>
                        <Sparkles size={12} />
                      </button>
                      {guide.published && (
                        <a href={`/guia/${guide.slug}`} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-text-muted hover:text-text-primary transition-all">
                          <ExternalLink size={12} />
                        </a>
                      )}
                      <button onClick={() => startEdit(guide)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-text-muted hover:text-text-primary transition-all">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(guide)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/4 text-text-muted hover:bg-red-400/10 hover:text-red-400 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FORM VIEW ── */}
      {isFormMode && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main — left 2 cols */}
          <div className="xl:col-span-2 space-y-5">

            {/* Basic */}
            <div className="rounded-2xl border border-white/5 bg-surface p-6 space-y-4">
              <p className="text-xs text-text-muted tracking-widest uppercase">Básico</p>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">Título *</label>
                <input value={form.title} onChange={(e) => setField('title', e.target.value)}
                  placeholder="Ex: Por que ele perde o interesse"
                  className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors" />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">Slug (URL) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-xs whitespace-nowrap">/guia/</span>
                  <input value={form.slug} onChange={(e) => setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="por-que-ele-perde-interesse"
                    className="flex-1 bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors font-mono" />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">Subtítulo</label>
                <input value={form.subtitle || ''} onChange={(e) => setField('subtitle', e.target.value)}
                  placeholder="Uma frase de posicionamento emocional"
                  className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors" />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">Gancho emocional</label>
                <input value={form.emotionalHook || ''} onChange={(e) => setField('emotionalHook', e.target.value)}
                  placeholder="O padrão que ninguém te contou sobre apego..."
                  className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors" />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">Descrição</label>
                <textarea value={form.description} onChange={(e) => setField('description', e.target.value)}
                  rows={4} placeholder="Descrição psicológica do guia..."
                  className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors resize-none" />
              </div>
            </div>

            {/* Bullets */}
            <div className="rounded-2xl border border-white/5 bg-surface p-6 space-y-3">
              <p className="text-xs text-text-muted tracking-widest uppercase">O que você vai aprender</p>
              {(form.bullets ?? []).map((bullet, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={9} className="text-accent" />
                  </div>
                  <p className="text-text-secondary text-sm flex-1 leading-relaxed">{bullet}</p>
                  <button onClick={() => removeBullet(i)} className="text-text-muted hover:text-red-400 transition-colors flex-shrink-0">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newBullet} onChange={(e) => setNewBullet(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBullet())}
                  placeholder="Adicionar tópico..."
                  className="flex-1 bg-background border border-white/8 rounded-xl px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors" />
                <button onClick={addBullet} className="px-4 py-2 bg-accent/10 text-accent hover:bg-accent/20 rounded-xl text-sm transition-all">
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Author */}
            <div className="rounded-2xl border border-white/5 bg-surface p-6 space-y-4">
              <p className="text-xs text-text-muted tracking-widest uppercase">Autor</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">Nome</label>
                  <input value={form.authorName || ''} onChange={(e) => setField('authorName', e.target.value)}
                    className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">Papel</label>
                  <input value={form.authorRole || ''} onChange={(e) => setField('authorRole', e.target.value)}
                    className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Citação do autor</label>
                <textarea value={form.authorQuote || ''} onChange={(e) => setField('authorQuote', e.target.value)}
                  rows={2} className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
              </div>
            </div>

            {/* Form copy */}
            <div className="rounded-2xl border border-white/5 bg-surface p-6 space-y-4">
              <p className="text-xs text-text-muted tracking-widest uppercase">Textos do formulário de captura</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Título do form', key: 'formTitle' as const },
                  { label: 'Subtítulo do form', key: 'formSubtitle' as const },
                  { label: 'Texto do botão CTA', key: 'ctaText' as const },
                  { label: 'Título de sucesso', key: 'successTitle' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs text-text-muted block mb-1.5">{label}</label>
                    <input value={(form[key] as string) || ''} onChange={(e) => setField(key, e.target.value)}
                      className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Mensagem de sucesso</label>
                <textarea value={form.successMessage || ''} onChange={(e) => setField('successMessage', e.target.value)}
                  rows={2} className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/30 transition-colors resize-none" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Publish settings */}
            <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-4">
              <p className="text-xs text-text-muted tracking-widest uppercase">Publicação</p>

              {[
                { label: 'Publicado', key: 'published' as const, activeColor: 'bg-green-400' },
                { label: 'Em destaque', key: 'featured' as const, activeColor: 'bg-accent' },
              ].map(({ label, key, activeColor }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer" onClick={() => setField(key, !form[key])}>
                  <div className={`w-9 h-5 rounded-full transition-all relative ${form[key] ? activeColor : 'bg-white/10'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form[key] ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                  <span className="text-text-secondary text-sm">{label}</span>
                </label>
              ))}

              <div>
                <label className="text-xs text-text-muted block mb-1.5">Idioma</label>
                <div className="flex gap-2">
                  {(['pt', 'en', 'fr'] as const).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setField('locale', loc)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        (form.locale ?? 'pt') === loc
                          ? 'bg-accent/15 border-accent/30 text-accent'
                          : 'bg-white/4 border-white/8 text-text-muted hover:border-white/16'
                      }`}
                    >
                      {loc.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">Categoria</label>
                <input value={form.category || ''} onChange={(e) => setField('category', e.target.value)}
                  placeholder="Ex: relacionamentos"
                  className="w-full bg-background border border-white/8 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5 flex items-center gap-1">
                  <Tag size={10} /> Tags de segmentação
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(form.tags ?? []).map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] border border-white/8 rounded-full px-2 py-0.5 text-text-muted">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors"><X size={9} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="apego-emocional"
                    className="flex-1 bg-background border border-white/8 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent/30 transition-colors" />
                  <button onClick={addTag} className="px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-xl text-xs transition-all">
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            </div>

            {/* Cover image */}
            <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-4">
              <p className="text-xs text-text-muted tracking-widest uppercase">Imagem de capa</p>
              {form.coverImage && (
                <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '4/3' }}>
                  <img src={form.coverImage} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setField('coverImage', '')}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-all">
                    <X size={10} />
                  </button>
                </div>
              )}
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadCover} />
              <button onClick={() => coverRef.current?.click()} disabled={coverUploading}
                className="w-full flex items-center justify-center gap-2 border border-white/8 rounded-xl py-2.5 text-sm text-text-muted hover:border-accent/30 hover:text-accent transition-all disabled:opacity-50">
                <Upload size={13} />
                {coverUploading ? 'Enviando...' : form.coverImage ? 'Substituir capa' : 'Enviar capa'}
              </button>
            </div>

            {/* PDF */}
            <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-4">
              <p className="text-xs text-text-muted tracking-widest uppercase">Arquivo PDF</p>
              {form.pdfPath ? (
                <div className="flex items-center gap-2 bg-green-400/8 border border-green-400/15 rounded-xl px-3 py-2.5">
                  <Check size={13} className="text-green-400 flex-shrink-0" />
                  <p className="text-green-400 text-xs truncate font-mono">{form.pdfPath}</p>
                </div>
              ) : (
                <p className="text-text-muted text-xs bg-white/4 border border-white/8 rounded-xl px-3 py-2.5">Nenhum PDF enviado ainda.</p>
              )}
              <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={uploadPdf} />
              <button onClick={() => pdfRef.current?.click()} disabled={pdfUploading}
                className="w-full flex items-center justify-center gap-2 border border-white/8 rounded-xl py-2.5 text-sm text-text-muted hover:border-accent/30 hover:text-accent transition-all disabled:opacity-50">
                <Upload size={13} />
                {pdfUploading ? 'Enviando...' : form.pdfPath ? 'Substituir PDF' : 'Enviar PDF'}
              </button>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60">
              {saving ? 'Salvando...' : mode === 'create' ? 'Criar Guia' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
