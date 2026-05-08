'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Loader, Save, Sparkles } from 'lucide-react';
import { MarqueePhrase } from '@/lib/types';

export default function AdminMarqueePage() {
  const [phrases, setPhrases] = useState<MarqueePhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/marquee');
    const data = await res.json();
    setPhrases(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!newText.trim()) return;
    setAdding(true);
    const res = await fetch('/api/admin/marquee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText.trim(), order: phrases.length + 1, active: true }),
    });
    const created = await res.json();
    setPhrases((prev) => [...prev, created]);
    setNewText('');
    setAdding(false);
  }

  async function handleToggle(phrase: MarqueePhrase) {
    const updated = { ...phrase, active: !phrase.active };
    setSaving(phrase.id);
    await fetch('/api/admin/marquee', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setPhrases((prev) => prev.map((p) => p.id === phrase.id ? updated : p));
    setSaving(null);
  }

  async function handleDelete(id: string) {
    setSaving(id);
    await fetch(`/api/admin/marquee?id=${id}`, { method: 'DELETE' });
    setPhrases((prev) => prev.filter((p) => p.id !== id));
    setSaving(null);
  }

  async function handleTextChange(phrase: MarqueePhrase, text: string) {
    const updated = { ...phrase, text };
    setPhrases((prev) => prev.map((p) => p.id === phrase.id ? updated : p));
  }

  async function handleSaveText(phrase: MarqueePhrase) {
    setSaving(phrase.id);
    await fetch('/api/admin/marquee', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phrase),
    });
    setSaving(null);
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Sparkles size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-light text-text-primary">Barra Emocional</h1>
          <p className="text-text-muted text-xs mt-0.5">Frases exibidas no ticker animado da homepage</p>
        </div>
      </div>

      {/* Preview strip */}
      <div className="mb-8 rounded-2xl border border-white/5 bg-surface overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-text-muted">Pré-visualização</span>
        </div>
        <div className="px-4 py-3 overflow-hidden">
          <div className="flex gap-6 overflow-x-auto scrollbar-none">
            {phrases.filter((p) => p.active).map((p) => (
              <span key={p.id} className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: 'rgba(254,0,80,0.65)' }}>
                {p.text} <span style={{ color: 'rgba(254,0,80,0.3)' }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add new */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nova frase emocional..."
          className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newText.trim()}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all"
        >
          {adding ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
          Adicionar
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="animate-spin text-text-muted" />
        </div>
      ) : (
        <div className="space-y-2">
          {phrases.map((phrase) => (
            <div
              key={phrase.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                phrase.active ? 'border-white/8 bg-surface' : 'border-white/4 bg-white/2 opacity-50'
              }`}
            >
              <GripVertical size={14} className="text-text-muted flex-shrink-0 cursor-grab" />

              <input
                type="text"
                value={phrase.text}
                onChange={(e) => handleTextChange(phrase, e.target.value)}
                onBlur={() => handleSaveText(phrase)}
                className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none"
              />

              <div className="flex items-center gap-2 flex-shrink-0">
                {saving === phrase.id && <Loader size={12} className="animate-spin text-text-muted" />}

                <button
                  onClick={() => handleSaveText(phrase)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all"
                  title="Salvar"
                >
                  <Save size={12} />
                </button>

                <button
                  onClick={() => handleToggle(phrase)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    phrase.active ? 'text-accent hover:bg-accent/10' : 'text-text-muted hover:bg-white/5'
                  }`}
                  title={phrase.active ? 'Ocultar' : 'Mostrar'}
                >
                  {phrase.active ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>

                <button
                  onClick={() => handleDelete(phrase.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Deletar"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {phrases.length === 0 && (
            <div className="text-center py-16 text-text-muted text-sm">
              Nenhuma frase cadastrada ainda.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
