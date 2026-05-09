import ptMessages from '../messages/pt.json';

export type Locale = 'pt';

export const DEFAULT_LOCALE: Locale = 'pt';

const msgs = ptMessages as unknown as Record<string, unknown>;

export function createT(_locale: Locale = 'pt') {
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
  return DEFAULT_LOCALE;
}
