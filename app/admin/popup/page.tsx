'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Check, Upload, X, Clock, MousePointerClick, ArrowDownWideNarrow,
  Gift, Tag, Mail, Eye,
} from 'lucide-react';
import { PopupConfig, Guide } from '@/lib/types';

const DEFAULT_CONFIG: PopupConfig = {
  id: 'main',
  enabled: false,
  trigger: 'delay',
  delaySeconds: 15,
  scrollPercent: 50,
  frequency: 'session',
  frequencyDays: 7,
  pageScope: 'exclude',
  pagePaths: ['/checkout', '/guia'],
  title: 'Antes de você ir...',
  subtitle: 'Receba gratuitamente',
  body: 'Baixe nosso guia gratuito com os padrões psicológicos que sabotam relacionamentos.',
  ctaText: 'Quero receber agora',
  incentiveType: 'newsletter',
  collectName: true,
  contactMethod: 'email',
  successTitle: 'Prontinho!',
  successMessage: 'Confira seu e-mail em instantes.',
  updatedAt: new Date().toISOString(),
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-6 space-y-4">
      <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-text-muted text-xs uppercase tracking-widest block">{label}</label>
      {hint && <p className="text-text-muted text-xs -mt-1 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function AdminPopupPage() {
  const [config, setConfig] = useState<PopupConfig>(DEFAULT_CONFIG);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pathInput, setPathInput] = useState('');
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/popup-config').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/admin/guides').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([popup, guideList]) => {
        if (popup) setConfig({ ...DEFAULT_CONFIG, ...popup });
        setGuides(Array.isArray(guideList) ? guideList : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/popup-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'popup');
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setConfig((c) => ({ ...c, imageUrl: data.url }));
      }
    } finally {
      setUploading(false);
    }
  };

  const addPath = () => {
    const p = pathInput.trim();
    if (!p || !p.startsWith('/')) return;
    if (config.pagePaths.includes(p)) return;
    setConfig((c) => ({ ...c, pagePaths: [...c.pagePaths, p] }));
    setPathInput('');
  };

  const removePath = (p: string) => {
    setConfig((c) => ({ ...c, pagePaths: c.pagePaths.filter((x) => x !== p) }));
  };

  if (loading) {
    return <div className="text-text-muted text-sm">Carregando...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: 'clamp(0.62rem, 0.72vw, 0.7rem)' }}>
            Captação
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2rem)' }}>
            Pop-up do site
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.95rem)' }}>
            Configure quando, onde e o que exibir para os visitantes.
          </p>
        </div>

        <button
          onClick={() => setConfig((c) => ({ ...c, enabled: !c.enabled }))}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            config.enabled ? 'bg-accent text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-white animate-pulse' : 'bg-text-muted'}`} />
          {config.enabled ? 'Ativado' : 'Desativado'}
        </button>
      </div>

      {/* Trigger */}
      <Section title="Quando exibir">
        <div className="grid grid-cols-3 gap-2">
          {([
            { v: 'delay', label: 'Após X segundos', icon: Clock },
            { v: 'exit_intent', label: 'Exit-intent', icon: MousePointerClick },
            { v: 'scroll', label: 'Após scroll', icon: ArrowDownWideNarrow },
          ] as const).map(({ v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setConfig((c) => ({ ...c, trigger: v }))}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs font-medium transition-all ${
                config.trigger === v ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/8 text-text-muted hover:border-white/20'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {(config.trigger === 'delay' || config.trigger === 'exit_intent') && (
          <Field label="Segundos de espera" hint={config.trigger === 'exit_intent' ? 'Também usado como alternativa em celulares, onde exit-intent não funciona.' : undefined}>
            <input
              type="number"
              min={1}
              value={config.delaySeconds}
              onChange={(e) => setConfig((c) => ({ ...c, delaySeconds: Number(e.target.value) }))}
              className="admin-input max-w-32"
            />
          </Field>
        )}

        {config.trigger === 'scroll' && (
          <Field label="Porcentagem de scroll (%)">
            <input
              type="number"
              min={1}
              max={100}
              value={config.scrollPercent}
              onChange={(e) => setConfig((c) => ({ ...c, scrollPercent: Number(e.target.value) }))}
              className="admin-input max-w-32"
            />
          </Field>
        )}
      </Section>

      {/* Frequency */}
      <Section title="Frequência">
        <div className="grid grid-cols-3 gap-2">
          {([
            { v: 'session', label: 'Uma vez por sessão' },
            { v: 'days', label: 'A cada X dias' },
            { v: 'every_visit', label: 'Toda visita' },
          ] as const).map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setConfig((c) => ({ ...c, frequency: v }))}
              className={`py-3 rounded-xl border text-xs font-medium transition-all ${
                config.frequency === v ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/8 text-text-muted hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {config.frequency === 'days' && (
          <Field label="Intervalo em dias">
            <input
              type="number"
              min={1}
              value={config.frequencyDays}
              onChange={(e) => setConfig((c) => ({ ...c, frequencyDays: Number(e.target.value) }))}
              className="admin-input max-w-32"
            />
          </Field>
        )}
      </Section>

      {/* Pages */}
      <Section title="Páginas">
        <div className="grid grid-cols-3 gap-2">
          {([
            { v: 'all', label: 'Todo o site' },
            { v: 'exclude', label: 'Todo, exceto...' },
            { v: 'include', label: 'Apenas...' },
          ] as const).map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setConfig((c) => ({ ...c, pageScope: v }))}
              className={`py-3 rounded-xl border text-xs font-medium transition-all ${
                config.pageScope === v ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/8 text-text-muted hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {config.pageScope !== 'all' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {config.pagePaths.map((p) => (
                <span key={p} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-3 py-1.5 text-xs text-text-secondary">
                  {p}
                  <button onClick={() => removePath(p)} className="text-text-muted hover:text-red-400">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPath())}
                placeholder="/products"
                className="admin-input flex-1"
              />
              <button onClick={addPath} className="px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-text-primary text-sm transition-colors">
                Adicionar
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Content */}
      <Section title="Conteúdo">
        <Field label="Tag (acima do título)">
          <input value={config.subtitle} onChange={(e) => setConfig((c) => ({ ...c, subtitle: e.target.value }))} className="admin-input" />
        </Field>
        <Field label="Título">
          <input value={config.title} onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))} className="admin-input" />
        </Field>
        <Field label="Texto">
          <textarea rows={3} value={config.body} onChange={(e) => setConfig((c) => ({ ...c, body: e.target.value }))} className="admin-input resize-none" />
        </Field>
        <Field label="Texto do botão">
          <input value={config.ctaText} onChange={(e) => setConfig((c) => ({ ...c, ctaText: e.target.value }))} className="admin-input" />
        </Field>
        <Field label="Imagem (opcional)">
          <div className="flex items-center gap-3">
            {config.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/8" />
            )}
            <button
              onClick={() => imgRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 disabled:opacity-50 text-text-primary text-sm transition-colors"
            >
              <Upload size={14} /> {uploading ? 'Enviando...' : config.imageUrl ? 'Trocar' : 'Enviar imagem'}
            </button>
            {config.imageUrl && (
              <button onClick={() => setConfig((c) => ({ ...c, imageUrl: undefined }))} className="text-text-muted hover:text-red-400 text-sm">
                Remover
              </button>
            )}
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          </div>
        </Field>
      </Section>

      {/* Incentive */}
      <Section title="Incentivo">
        <div className="grid grid-cols-3 gap-2">
          {([
            { v: 'guide', label: 'Guia gratuito', icon: Gift },
            { v: 'discount', label: 'Desconto', icon: Tag },
            { v: 'newsletter', label: 'Só newsletter', icon: Mail },
          ] as const).map(({ v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setConfig((c) => ({ ...c, incentiveType: v }))}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs font-medium transition-all ${
                config.incentiveType === v ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/8 text-text-muted hover:border-white/20'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {config.incentiveType === 'guide' && (
          <Field label="Guia a entregar" hint="O lead recebe este guia por e-mail ao se inscrever pelo pop-up.">
            <select
              value={config.guideSlug || ''}
              onChange={(e) => setConfig((c) => ({ ...c, guideSlug: e.target.value || undefined }))}
              className="admin-input"
            >
              <option value="">Selecione um guia...</option>
              {guides.filter((g) => g.published).map((g) => (
                <option key={g.id} value={g.slug}>{g.title}</option>
              ))}
            </select>
          </Field>
        )}

        {config.incentiveType === 'discount' && (
          <>
            <Field label="Código do cupom" hint="Crie o cupom no Stripe manualmente e cole o código aqui.">
              <input
                value={config.discountCode || ''}
                onChange={(e) => setConfig((c) => ({ ...c, discountCode: e.target.value.toUpperCase() }))}
                placeholder="BEMVINDO10"
                className="admin-input"
              />
            </Field>
            <Field label="Texto do desconto">
              <input
                value={config.discountText || ''}
                onChange={(e) => setConfig((c) => ({ ...c, discountText: e.target.value }))}
                placeholder="10% OFF na primeira compra"
                className="admin-input"
              />
            </Field>
          </>
        )}
      </Section>

      {/* Form */}
      <Section title="Formulário">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfig((c) => ({ ...c, collectName: !c.collectName }))}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${config.collectName ? 'bg-accent' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${config.collectName ? 'left-5.5' : 'left-0.5'}`} style={{ left: config.collectName ? '22px' : '2px' }} />
          </button>
          <span className="text-text-secondary text-sm">Pedir nome</span>
        </div>

        <Field label="Método de contato">
          <select
            value={config.contactMethod}
            onChange={(e) => setConfig((c) => ({ ...c, contactMethod: e.target.value as PopupConfig['contactMethod'] }))}
            className="admin-input"
          >
            <option value="email">Apenas e-mail</option>
            <option value="whatsapp">Apenas WhatsApp</option>
            <option value="both">Deixar visitante escolher</option>
          </select>
        </Field>
      </Section>

      {/* Success */}
      <Section title="Mensagem de sucesso">
        <Field label="Título">
          <input value={config.successTitle} onChange={(e) => setConfig((c) => ({ ...c, successTitle: e.target.value }))} className="admin-input" />
        </Field>
        <Field label="Mensagem">
          <textarea rows={2} value={config.successMessage} onChange={(e) => setConfig((c) => ({ ...c, successMessage: e.target.value }))} className="admin-input resize-none" />
        </Field>
      </Section>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all"
        >
          {saved ? <><Check size={14} /> Salvo!</> : saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
        {config.enabled && (
          <span className="flex items-center gap-1.5 text-text-muted text-xs">
            <Eye size={13} /> O pop-up está ativo no site.
          </span>
        )}
      </div>
    </div>
  );
}
