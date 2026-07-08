'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, X, Download } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { GuideConfig } from '@/lib/types';
import { trackLead } from '@/lib/fbq';
import { getStoredUtm } from '@/lib/utm';

interface Props {
  config: GuideConfig;
}

export default function FreeGuideClient({ config }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !contact.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          [method]: contact,
          source: 'free-guide',
          ...getStoredUtm(),
        }),
      });
      if (res.ok) {
        // Pull the metaEventId from the API response so the client-side
        // pixel Lead fires with the same event_id as the server-side CAPI
        // call, and Meta deduplicates them.
        const data = await res.json().catch(() => null);
        trackLead({
          content_name: 'Free Guide',
          value: 0,
          currency: 'BRL',
          eventID: data?.metaEventId,
        });
        setStep('success');
      } else {
        setError('Erro ao enviar. Tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="min-h-screen pt-24 pb-20 px-6 relative flex items-center overflow-hidden">
        {/* Background glow, desktop only, softer */}
        <div
          className="hidden md:block absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(254,0,80,0.08) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <AnimateOnScroll direction="left">
              <div>
                <div className="inline-flex items-center gap-2 text-xs text-accent border border-accent/20 rounded-full px-4 py-1.5 mb-7">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Acesso Gratuito
                </div>

                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-text-primary leading-tight mb-4">
                  {config.headline}
                  <br />
                  <span style={{ color: '#fe0050' }}>{config.headlineAccent}</span>
                </h1>

                <div className="w-10 h-px bg-accent mb-6" />

                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  {config.description}
                </p>

                <div className="space-y-3 mb-10">
                  {config.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={14} className="text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-text-secondary text-sm leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-2xl border border-white/5 bg-surface">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center text-accent font-semibold text-sm">
                      {config.authorName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-medium">{config.authorName}</p>
                      <p className="text-text-muted text-xs">{config.authorRole}</p>
                    </div>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed italic">
                    &ldquo;{config.authorQuote}&rdquo;
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Right, Form */}
            <AnimateOnScroll direction="right">
              <div className="relative rounded-3xl border border-white/8 bg-surface overflow-hidden shadow-2xl shadow-black/30">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                {step === 'form' ? (
                  <div className="p-7 lg:p-8">
                    <h2 className="font-heading text-2xl font-medium text-text-primary mb-1.5">
                      {config.formTitle}
                    </h2>
                    <p className="text-text-secondary text-sm mb-6">
                      {config.formSubtitle}
                    </p>

                    {/* Toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5">
                      {(['email', 'whatsapp'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => { setMethod(m); setContact(''); }}
                          className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                            method === m ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {m === 'email' ? 'E-mail' : 'WhatsApp'}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-text-muted text-xs mb-1.5 block tracking-wide">Seu nome</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Como posso te chamar?"
                          className="admin-input"
                        />
                      </div>
                      <div>
                        <label className="text-text-muted text-xs mb-1.5 block tracking-wide">
                          {method === 'email' ? 'Seu e-mail' : 'Seu WhatsApp'}
                        </label>
                        <input
                          type={method === 'email' ? 'email' : 'tel'}
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          placeholder={method === 'email' ? 'seu@email.com' : '+55 (00) 00000-0000'}
                          className="admin-input"
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                          <X size={12} />
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white py-3.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-accent/20"
                      >
                        {loading ? 'Enviando...' : (
                          <>
                            {config.ctaText}
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>

                      <p className="text-text-muted text-xs text-center leading-relaxed">
                        Sem spam. Você pode cancelar a qualquer momento. Seus dados estão seguros.
                      </p>
                    </form>
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={28} className="text-accent" />
                    </div>
                    <h2 className="font-heading text-2xl font-medium text-text-primary mb-3">
                      {config.successTitle}
                    </h2>
                    <p className="text-text-secondary text-sm leading-relaxed mb-6">
                      {config.successMessage}
                    </p>
                    {config.guideFilePath && method === 'email' && (
                      <a
                        href="/api/guide-download"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-accent-hover transition-all mb-4"
                      >
                        <Download size={14} />
                        Baixar Guia Agora
                      </a>
                    )}
                    <div className="block">
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-text-muted hover:text-accent text-sm transition-colors"
                      >
                        Explorar artigos <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
