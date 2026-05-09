'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from './LocaleProvider';
import { Locale, LOCALES } from '@/lib/i18n';

function getLocalePath(currentPath: string, targetLocale: Locale): string {
  const stripped = currentPath.replace(/^\/(en|fr)(?=\/|$)/, '') || '/';
  if (targetLocale === 'pt') return stripped;
  const base = stripped === '/' ? '' : stripped;
  return `/${targetLocale}${base}`;
}

export default function LanguageSwitcher() {
  const { locale } = useLocale();
  const pathname = usePathname();

  function switchLocale(target: Locale) {
    if (target === locale) return;
    window.location.href = getLocalePath(pathname, target);
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-white/8 overflow-hidden">
      {LOCALES.map((loc, i) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2.5 py-1.5 text-xs font-medium transition-all ${
            loc === locale
              ? 'bg-accent text-white'
              : 'text-text-muted hover:text-text-primary hover:bg-white/5'
          } ${i > 0 ? 'border-l border-white/8' : ''}`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
