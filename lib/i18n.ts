import ptMessages from '../messages/pt.json';
import enMessages from '../messages/en.json';
import frMessages from '../messages/fr.json';

export type Locale = 'pt' | 'en' | 'fr';

export const LOCALES: Locale[] = ['pt', 'en', 'fr'];
export const DEFAULT_LOCALE: Locale = 'pt';
export const LOCALE_COOKIE = 'fi-locale';
export const LOCALE_HEADER = 'x-locale';

const allMessages = { pt: ptMessages, en: enMessages, fr: frMessages };

export type Messages = typeof ptMessages;

export function createT(locale: Locale) {
  const msgs = allMessages[locale] as unknown as Record<string, unknown>;
  return function t(key: string, vars?: Record<string, string | number>): string {
    const parts = key.split('.');
    let val: unknown = msgs;
    for (const part of parts) {
      if (typeof val !== 'object' || val === null) return key;
      val = (val as Record<string, unknown>)[part];
    }
    let str = typeof val === 'string' ? val : key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };
}

export async function getLocale(): Promise<Locale> {
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const locale = h.get(LOCALE_HEADER);
    if (locale === 'en' || locale === 'fr') return locale as Locale;
  } catch {
    // not in server context
  }
  return DEFAULT_LOCALE;
}
