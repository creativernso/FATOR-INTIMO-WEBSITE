'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { Save, Upload, FileText, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { GuideConfig } from '@/lib/types';

const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

export default function AdminGuide() {
  const [config, setConfig] = useState<GuideConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/guide')
      .then((r) => r.json())
      .then((d) => { setConfig(d); setLoading(false); });
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/guide', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) showToast('success', 'Guia salvo com sucesso!');
      else showToast('error', 'Erro ao salvar.');
    } catch {
      showToast('error', 'Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  const uploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/guide/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setConfig((c) => c ? { ...c, guideFilePath: data.filePath } : c);
        showToast('success', 'PDF enviado! Link de download ativo.');
      } else {
        showToast('error', 'Erro ao enviar PDF.');
      }
    } catch {
      showToast('error', 'Erro de conexão.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const updateBullet = (i: number, val: string) =>
    setConfig((c) => c ? { ...c, bullets: c.bullets.map((b, idx) => idx === i ? val : b) } : c);

  const addBullet = () =>
    setConfig((c) => c ? { ...c, bullets: [...c.bullets, ''] } : c);

  const removeBullet = (i: number) =>
    setConfig((c) => c ? { ...c, bullets: c.bullets.filter((_, idx) => idx !== i) } : c);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-text-muted" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>
      Carregando...
    </div>
  );

  if (!config) return null;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Conteúdo
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Guia Gratuito
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            Edite o conteúdo e faça upload do PDF do guia.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <Save size={14} />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* PDF Upload */}
      <div className="rounded-2xl border border-white/8 bg-surface p-6">
        <h3 className="text-text-primary font-medium mb-1" style={{ fontSize: fs('0.9rem', '1vw', '0.95rem') }}>
          Arquivo do Guia (PDF)
        </h3>
        <p className="text-text-muted mb-4" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem') }}>
          {config.guideFilePath ? `✓ Arquivo ativo: ${config.guideFilePath}` : 'Nenhum PDF enviado ainda.'}
        </p>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={uploadPdf} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-white/10 hover:border-accent/30 text-text-secondary hover:text-accent px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
        >
          {uploading ? (
            <><FileText size={14} className="animate-pulse" /> Enviando...</>
          ) : (
            <><Upload size={14} /> {config.guideFilePath ? 'Substituir PDF' : 'Enviar PDF'}</>
          )}
        </button>
      </div>

      {/* Content fields */}
      <div className="rounded-2xl border border-white/8 bg-surface p-6 space-y-5">
        <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.9rem', '1vw', '0.95rem') }}>
          Textos da Página
        </h3>

        {([
          { label: 'Título do Guia (usado no email)', key: 'title' },
          { label: 'Headline (linha 1)', key: 'headline' },
          { label: 'Headline Destaque (linha 2 — em vermelho)', key: 'headlineAccent' },
          { label: 'Título do formulário', key: 'formTitle' },
          { label: 'Subtítulo do formulário', key: 'formSubtitle' },
          { label: 'Texto do botão CTA', key: 'ctaText' },
          { label: 'Título da tela de sucesso', key: 'successTitle' },
        ] as { label: string; key: keyof GuideConfig }[]).map(({ label, key }) => (
          <div key={key}>
            <label className="block text-text-muted text-xs mb-1.5 tracking-wide">{label}</label>
            <input
              type="text"
              value={String(config[key] ?? '')}
              onChange={(e) => setConfig((c) => c ? { ...c, [key]: e.target.value } : c)}
              className="admin-input"
            />
          </div>
        ))}

        <div>
          <label className="block text-text-muted text-xs mb-1.5 tracking-wide">Descrição</label>
          <textarea
            value={config.description}
            onChange={(e) => setConfig((c) => c ? { ...c, description: e.target.value } : c)}
            rows={3}
            className="admin-input resize-none"
          />
        </div>

        <div>
          <label className="block text-text-muted text-xs mb-1.5 tracking-wide">Mensagem de sucesso</label>
          <textarea
            value={config.successMessage}
            onChange={(e) => setConfig((c) => c ? { ...c, successMessage: e.target.value } : c)}
            rows={2}
            className="admin-input resize-none"
          />
        </div>
      </div>

      {/* Bullets */}
      <div className="rounded-2xl border border-white/8 bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.9rem', '1vw', '0.95rem') }}>
            Benefícios (bullet points)
          </h3>
          <button
            onClick={addBullet}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <Plus size={12} /> Adicionar
          </button>
        </div>
        {config.bullets.map((bullet, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-accent text-xs mt-2.5 flex-shrink-0 font-medium">{i + 1}.</span>
            <input
              type="text"
              value={bullet}
              onChange={(e) => updateBullet(i, e.target.value)}
              className="admin-input flex-1"
            />
            <button
              onClick={() => removeBullet(i)}
              className="mt-2 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Author */}
      <div className="rounded-2xl border border-white/8 bg-surface p-6 space-y-4">
        <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.9rem', '1vw', '0.95rem') }}>
          Autor
        </h3>
        {([
          { label: 'Nome do autor', key: 'authorName' },
          { label: 'Cargo / Especialidade', key: 'authorRole' },
        ] as { label: string; key: keyof GuideConfig }[]).map(({ label, key }) => (
          <div key={key}>
            <label className="block text-text-muted text-xs mb-1.5 tracking-wide">{label}</label>
            <input
              type="text"
              value={String(config[key] ?? '')}
              onChange={(e) => setConfig((c) => c ? { ...c, [key]: e.target.value } : c)}
              className="admin-input"
            />
          </div>
        ))}
        <div>
          <label className="block text-text-muted text-xs mb-1.5 tracking-wide">Citação do autor</label>
          <textarea
            value={config.authorQuote}
            onChange={(e) => setConfig((c) => c ? { ...c, authorQuote: e.target.value } : c)}
            rows={3}
            className="admin-input resize-none"
          />
        </div>
      </div>
    </div>
  );
}
