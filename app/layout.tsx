import type { Metadata } from 'next';
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
