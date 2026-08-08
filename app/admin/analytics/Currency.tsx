'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type CurrencyCode = 'BRL' | 'USD' | 'EUR';

interface Rates {
  brlPerUsd: number;
  brlPerEur: number;
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Rates;
  refreshRates: () => void;
  format: (brlValue: number) => string;
}

const DEFAULT_RATES: Rates = { brlPerUsd: 5.2, brlPerEur: 5.6 };
const STORAGE_KEY = 'fi_admin_currency';

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('BRL');
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'BRL' || stored === 'USD' || stored === 'EUR') setCurrencyState(stored);
  }, []);

  const refreshRates = useCallback(() => {
    fetch('/api/admin/settings/exchange-rates')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.brlPerUsd === 'number' && typeof d.brlPerEur === 'number') {
          setRates({ brlPerUsd: d.brlPerUsd, brlPerEur: d.brlPerEur });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { refreshRates(); }, [refreshRates]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  };

  const format = (brlValue: number): string => {
    if (currency === 'USD') {
      return (brlValue / rates.brlPerUsd).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
    if (currency === 'EUR') {
      return (brlValue / rates.brlPerEur).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    }
    return `R$ ${brlValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, refreshRates, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}

export function Money({ value }: { value: number }) {
  const { format } = useCurrency();
  return <>{format(value)}</>;
}

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'BRL', label: 'Real (BR)', symbol: 'R$' },
  { code: 'USD', label: 'Dólar (US)', symbol: 'US$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
];

export function CurrencySelector() {
  const { currency, setCurrency, rates, refreshRates } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [usdInput, setUsdInput] = useState(String(rates.brlPerUsd));
  const [eurInput, setEurInput] = useState(String(rates.brlPerEur));
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setUsdInput(String(rates.brlPerUsd));
    setEurInput(String(rates.brlPerEur));
    setEditing(true);
  };

  const save = async () => {
    const brlPerUsd = parseFloat(usdInput.replace(',', '.'));
    const brlPerEur = parseFloat(eurInput.replace(',', '.'));
    if (!brlPerUsd || !brlPerEur || brlPerUsd <= 0 || brlPerEur <= 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/exchange-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brlPerUsd, brlPerEur }),
      });
      if (res.ok) {
        refreshRates();
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const active = CURRENCIES.find((c) => c.code === currency)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-text-muted hover:bg-white/10 border border-white/8 transition-colors"
      >
        {active.symbol} {active.code}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setEditing(false); }} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-surface shadow-xl z-20 overflow-hidden">
            {!editing ? (
              <>
                <div className="py-1">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setOpen(false); }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-text-secondary hover:bg-white/5 transition-colors"
                    >
                      <span>{c.symbol} {c.label}</span>
                      {currency === c.code && <Check size={13} className="text-accent" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/[0.06] px-3.5 py-2.5">
                  <button onClick={openEdit} className="text-accent hover:underline" style={{ fontSize: '11px' }}>
                    Editar taxas de câmbio
                  </button>
                  <p className="text-text-muted mt-1" style={{ fontSize: '10px' }}>
                    1 USD = R$ {rates.brlPerUsd.toFixed(2)} · 1 EUR = R$ {rates.brlPerEur.toFixed(2)}
                  </p>
                </div>
              </>
            ) : (
              <div className="p-3.5 space-y-2.5">
                <div>
                  <label className="text-text-muted block mb-1" style={{ fontSize: '10px' }}>1 USD = R$</label>
                  <input
                    value={usdInput}
                    onChange={(e) => setUsdInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent/40"
                  />
                </div>
                <div>
                  <label className="text-text-muted block mb-1" style={{ fontSize: '10px' }}>1 EUR = R$</label>
                  <input
                    value={eurInput}
                    onChange={(e) => setEurInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent/40"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditing(false)} className="flex-1 py-1.5 rounded-lg text-xs text-text-muted hover:bg-white/5 transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 py-1.5 rounded-lg text-xs bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
