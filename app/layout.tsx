import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getLocale } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';

const DEFAULT_TITLE = 'Fator Íntimo: Psicologia das Relações';
const DEFAULT_DESCRIPTION =
  'Entenda o amor. Domine suas relações. Psicologia profunda, inteligência emocional e comportamento humano.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Fator Íntimo',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'psicologia do relacionamento',
    'inteligência emocional',
    'atração',
    'autoconhecimento',
    'apego ansioso',
    'comportamento humano',
    'relações afetivas',
    'fator íntimo',
  ],
  authors: [{ name: 'Fator Íntimo' }],
  creator: 'Fator Íntimo',
  publisher: 'Fator Íntimo',
  applicationName: 'Fator Íntimo',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: 'Fator Íntimo',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Fator Íntimo - Psicologia das Relações',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/og-default.png'],
    creator: '@fatorintimo',
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/FAV.png',
    shortcut: '/FAV.png',
    apple: '/FAV.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'Lifestyle & Psychology',
};

const LANG_ATTR: Record<string, string> = { pt: 'pt-BR', en: 'en', fr: 'fr' };

const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fator Íntimo',
  url: SITE_URL,
  logo: `${SITE_URL}/LOGO.png`,
  description: DEFAULT_DESCRIPTION,
  sameAs: [
    'https://www.instagram.com/fatorintimo/',
    'https://www.youtube.com/@fatorintimo',
  ],
};

const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fator Íntimo',
  url: SITE_URL,
  inLanguage: 'pt-BR',
  publisher: { '@type': 'Organization', name: 'Fator Íntimo' },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={LANG_ATTR[locale]} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4821949064173943" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('fi-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
      </head>
      <body className="bg-background text-text-primary antialiased">
        <ThemeProvider>
          <LocaleProvider locale={locale}>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
