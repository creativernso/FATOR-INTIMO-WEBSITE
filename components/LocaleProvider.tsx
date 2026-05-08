'use client';

import { createContext, useContext, useMemo } from 'react';
import { Locale, createT } from '@/lib/i18n';

type T = ReturnType<typeof createT>;

interface LocaleContextValue {
  locale: Locale;
  t: T;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'pt',
  t: createT('pt'),
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = useMemo(() => createT(locale), [locale]);
  return (
    <LocaleContext.Provider value={{ locale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
