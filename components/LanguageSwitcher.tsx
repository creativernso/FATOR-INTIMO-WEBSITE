'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useLocale } from './LocaleProvider';
import { Locale, LOCALES } from '@/lib/i18n';

const LOCALE_META: Record<Locale, { label: string; name: string }> = {
  pt: { label: 'PT', name: 'Português' },
  en: { label: 'EN', name: 'English' },
  fr: { label: 'FR', name: 'Français' },
};

function getLocalePath(currentPath: string, targetLocale: Locale): string {
  const stripped = currentPath.replace(/^\/(en|fr)(?=\/|$)/, '') || '/';
  if (targetLocale === 'pt') return stripped;
  const base = stripped === '/' ? '' : stripped;
  return `/${targetLocale}${base}`;
}

export default function LanguageSwitcher() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function switchLocale(target: Locale) {
    setOpen(false);
    if (target === locale) return;
    router.push(getLocalePath(pathname, target));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary border border-white/8 hover:border-white/16 transition-all"
        aria-label="Switch language"
      >
        {LOCALE_META[locale].label}
        <ChevronDown size={10} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-white/8 overflow-hidden z-50"
          style={{ background: 'rgba(17,17,17,0.96)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors ${
                loc === locale
                  ? 'text-accent bg-accent/6'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/4'
              }`}
            >
              <span className="font-medium">{LOCALE_META[loc].label}</span>
              <span className="text-text-muted">{LOCALE_META[loc].name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
