'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, ArrowRight, CheckCircle, Copy, Check } from 'lucide-react';
import { trackLead } from '@/lib/fbq';
import { getStoredUtm } from '@/lib/utm';
import { PopupConfig } from '@/lib/types';

const SESSION_KEY = 'fi_popup_shown_session';
const LAST_SHOWN_KEY = 'fi_popup_last_shown';

function pathMatches(pathname: string, paths: string[]): boolean {
  return paths.some((p) => p && (pathname === p || pathname.startsWith(`${p}/`)));
}

function shouldConsiderShowing(config: PopupConfig, pathname: string): boolean {
  if (!config.enabled) return false;

  if (config.pageScope === 'include' && !pathMatches(pathname, config.pagePaths)) return false;
  if (config.pageScope === 'exclude' && pathMatches(pathname, config.pagePaths)) return false;

  if (config.frequency === 'session') {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
  } else if (config.frequency === 'days') {
    const last = localStorage.getItem(LAST_SHOWN_KEY);
    if (last) {
      const elapsedDays = (Date.now() - Number(last)) / 86_400_000;
      if (elapsedDays < config.frequencyDays) return false;
    }
  }

  return true;
}

function markShown(config: PopupConfig) {
  if (config.frequency === 'session') sessionStorage.setItem(SESSION_KEY, '1');
  if (config.frequency === 'days') localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
}

export default function SitePopup() {
  const pathname = usePathname();
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    fetch('/api/popup-config')
      .then((r) => r.json())
      .then((data: PopupConfig) => {
        if (data?.enabled) setConfig(data);
        if (data?.contactMethod === 'whatsapp') setMethod('whatsapp');
      })
      .catch(() => {});
  }, []);

  const trigger = useCallback(() => {
    if (triggeredRef.current || !config) return;
    triggeredRef.current = true;
    setVisible(true);
    markShown(config);
  }, [config]);

  useEffect(() => {
    if (!config || !pathname) return;
    if (!shouldConsiderShowing(config, pathname)) return;

    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    if (config.trigger === 'delay' || (config.trigger === 'exit_intent' && isTouchDevice)) {
      const id = setTimeout(trigger, config.delaySeconds * 1000);
      return () => clearTimeout(id);
    }

    if (config.trigger === 'exit_intent') {
      const onMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) trigger();
      };
      document.addEventListener('mouseleave', onMouseLeave);
      return () => document.removeEventListener('mouseleave', onMouseLeave);
    }

    if (config.trigger === 'scroll') {
      const onScroll = () => {
        const doc = document.documentElement;
        const scrolled = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
        if (scrolled >= config.scrollPercent) trigger();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, [config, pathname, trigger]);

  const close = () => setVisible(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setError('');
    if (config.collectName && !name.trim()) { setError('Preencha seu nome.'); return; }
    if (!contact.trim()) { setError('Preencha seu contato.'); return; }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        [method]: contact.trim(),
        ...getStoredUtm(),
      };

      const url = config.incentiveType === 'guide' && config.guideSlug
        ? `/api/guides/${config.guideSlug}/subscribe`
        : '/api/leads';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          url === '/api/leads' ? { ...payload, source: 'popup', tags: [config.incentiveType] } : payload
        ),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        trackLead({ content_name: 'Popup', value: 0, currency: 'BRL', eventID: data?.metaEventId });
        setDownloadUrl(data?.downloadUrl);
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

  const copyCode = () => {
    if (!config?.discountCode) return;
    navigator.clipboard.writeText(config.discountCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!config || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/8 overflow-hidden shadow-2xl shadow-black/40 animate-fade-up"
        style={{ background: '#130e09' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
        >
          <X size={14} />
        </button>

        {config.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.imageUrl} alt="" className="w-full h-40 object-cover" />
        )}

        <div className="p-7">
          {step === 'form' ? (
            <>
              <div className="inline-flex items-center gap-2 text-xs text-accent border border-accent/20 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {config.subtitle}
              </div>
              <h2 className="font-heading text-2xl font-medium text-text-primary mb-2 leading-tight">
                {config.title}
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {config.body}
              </p>

              {config.contactMethod === 'both' && (
                <div className="flex rounded-xl overflow-hidden border border-white/10 mb-4">
                  {(['email', 'whatsapp'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMethod(m); setContact(''); }}
                      className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                        method === m ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {m === 'email' ? 'E-mail' : 'WhatsApp'}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {config.collectName && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="admin-input"
                  />
                )}
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={method === 'email' ? 'seu@email.com' : '+55 (00) 00000-0000'}
                  className="admin-input"
                />

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
                  {loading ? 'Enviando...' : (<>{config.ctaText}<ArrowRight size={14} /></>)}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={28} className="text-accent" />
              </div>
              <h2 className="font-heading text-2xl font-medium text-text-primary mb-3">
                {config.successTitle}
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {config.successMessage}
              </p>

              {config.incentiveType === 'discount' && config.discountCode && (
                <button
                  onClick={copyCode}
                  className="w-full flex items-center justify-between gap-3 bg-white/5 border border-dashed border-accent/40 rounded-xl px-4 py-3 mb-2 transition-colors hover:bg-white/8"
                >
                  <span className="font-heading text-lg tracking-widest text-accent">{config.discountCode}</span>
                  {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} className="text-text-muted" />}
                </button>
              )}

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-accent-hover transition-all"
                >
                  Baixar agora
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
