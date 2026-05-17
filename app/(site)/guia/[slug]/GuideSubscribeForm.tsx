'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Users, Check } from 'lucide-react';
import { trackLead } from '@/lib/fbq';

interface Props {
  slug: string;
  formTitle?: string;
  formSubtitle?: string;
  ctaText?: string;
  successTitle?: string;
  successMessage?: string;
  hasPdf: boolean;
}

export default function GuideSubscribeForm({
  slug,
  formTitle,
  formSubtitle,
  ctaText,
  successTitle,
  successMessage,
  hasPdf,
}: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Por favor, informe seu nome.'); return; }
    if (!email.trim() && !whatsapp.trim()) { setError('Informe seu e-mail ou WhatsApp.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/guides/${slug}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, whatsapp: whatsapp.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ocorreu um erro. Tente novamente.'); return; }
      // Fire client-side Lead with the same event_id that the server used,
      // so Meta deduplicates Browser + Server events.
      trackLead({
        content_name: 'Guide Download',
        value: 0,
        currency: 'BRL',
        eventID: data.metaEventId,
      });
      if (data.downloadUrl) setDownloadUrl(data.downloadUrl);
      setStep('success');
    } catch {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto">
          <Check size={20} className="text-green-400" />
        </div>
        <div>
          <h3 className="font-heading text-2xl font-light text-text-primary mb-2">
            {successTitle || 'Acesso confirmado!'}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {successMessage || 'O guia foi enviado para o seu e-mail. Verifique sua caixa de entrada.'}
          </p>
        </div>

        {(downloadUrl || hasPdf) && (
          <a
            href={downloadUrl || `/api/guides/${slug}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            <Download size={14} /> Baixar Guia Agora
          </a>
        )}

        <div className="pt-4 border-t border-white/6">
          <p className="text-text-muted text-xs mb-4">Continue explorando o universo Fator Íntimo</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/comunidade"
              className="inline-flex items-center gap-2 border border-accent/25 text-accent hover:bg-accent/5 px-5 py-2.5 rounded-full text-sm transition-all"
            >
              <Users size={13} /> Comunidade Íntima
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 border border-white/10 text-text-secondary hover:border-white/20 px-5 py-2.5 rounded-full text-sm transition-all"
            >
              Artigos <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-heading text-xl font-light text-text-primary mb-1">
          {formTitle || 'Quero o guia gratuito'}
        </h3>
        {formSubtitle && (
          <p className="text-text-muted text-sm">{formSubtitle}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
        />
      </div>

      <div>
        <input
          type="tel"
          placeholder="WhatsApp (opcional)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Enviando...' : (ctaText || 'Quero o Guia Gratuito')}
      </button>

      <p className="text-text-muted text-xs text-center">
        100% gratuito. Sem spam, nunca.
      </p>
    </form>
  );
}
