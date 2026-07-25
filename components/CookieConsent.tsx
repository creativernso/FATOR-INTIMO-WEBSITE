'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { getConsent, saveConsent } from '@/lib/cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
  };

  const rejectNonEssential = () => {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
  };

  const saveCustom = () => {
    saveConsent({ analytics, marketing });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6">
      <div
        className="max-w-2xl mx-auto rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40"
        style={{ background: '#130e09' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Cookie size={16} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium mb-1.5">Usamos cookies</p>
              <p className="text-text-secondary text-xs leading-relaxed">
                Usamos cookies essenciais para o funcionamento do site, e cookies opcionais de análise e
                publicidade (incluindo Google AdSense) para melhorar sua experiência. Veja nossa{' '}
                <a href="/legal/cookies" className="text-accent hover:underline">Política de Cookies</a>.
              </p>
            </div>
          </div>

          {customizing && (
            <div className="mt-4 space-y-3 pl-12">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-text-primary text-xs font-medium">Necessários</p>
                  <p className="text-text-muted text-[11px]">Sempre ativos, essenciais para o site funcionar.</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-accent/40 flex-shrink-0 relative opacity-50">
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-text-primary text-xs font-medium">Análise</p>
                  <p className="text-text-muted text-[11px]">Nos ajuda a entender como o site é utilizado.</p>
                </div>
                <button
                  onClick={() => setAnalytics((v) => !v)}
                  className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${analytics ? 'bg-accent' : 'bg-white/15'}`}
                >
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: analytics ? '22px' : '2px' }} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-text-primary text-xs font-medium">Publicidade</p>
                  <p className="text-text-muted text-[11px]">Google AdSense e Meta Pixel, anúncios relevantes.</p>
                </div>
                <button
                  onClick={() => setMarketing((v) => !v)}
                  className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${marketing ? 'bg-accent' : 'bg-white/15'}`}
                >
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: marketing ? '22px' : '2px' }} />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 mt-5 pl-12">
            {customizing ? (
              <button
                onClick={saveCustom}
                className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-5 py-2.5 rounded-full transition-all"
              >
                Salvar preferências
              </button>
            ) : (
              <>
                <button
                  onClick={acceptAll}
                  className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-5 py-2.5 rounded-full transition-all"
                >
                  Aceitar todos
                </button>
                <button
                  onClick={rejectNonEssential}
                  className="border border-white/15 text-text-secondary hover:text-text-primary hover:border-white/25 text-xs font-medium px-5 py-2.5 rounded-full transition-all"
                >
                  Recusar não essenciais
                </button>
                <button
                  onClick={() => setCustomizing(true)}
                  className="text-text-muted hover:text-text-primary text-xs px-3 py-2.5 transition-colors"
                >
                  Personalizar
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={rejectNonEssential}
          aria-label="Fechar e recusar não essenciais"
          className="absolute top-4 right-4 w-7 h-7 rounded-full text-text-muted hover:text-text-primary hover:bg-white/6 flex items-center justify-center transition-all"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
