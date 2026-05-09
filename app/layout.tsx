import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getLocale } from '@/lib/i18n';

const SITE_URL = 'https://fatorintimo.com';

export const metadata: Metadata = {
  title: {
    default: 'Fator Íntimo: Psicologia das Relações',
    template: '%s | Fator Íntimo',
  },
  description: 'Entenda o amor. Domine suas relações. Psicologia profunda, inteligência emocional e comportamento humano.',
  keywords: ['psicologia do relacionamento', 'inteligência emocional', 'atração', 'autoconhecimento', 'fator intimo'],
  authors: [{ name: 'Fator Íntimo' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Fator Íntimo: Psicologia das Relações',
    description: 'Entenda o amor. Domine suas relações.',
    siteName: 'Fator Íntimo',
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'pt-BR': SITE_URL,
      'en': `${SITE_URL}/en`,
      'fr': `${SITE_URL}/fr`,
      'x-default': SITE_URL,
    },
  },
  icons: {
    icon: '/FAV.png',
    shortcut: '/FAV.png',
    apple: '/FAV.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LANG_ATTR: Record<string, string> = { pt: 'pt-BR', en: 'en', fr: 'fr' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={LANG_ATTR[locale]} suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('fi-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <ThemeProvider>
          <LocaleProvider locale={locale}>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
