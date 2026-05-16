import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';

// Although the page redirects, providing metadata keeps OG previews accurate
// if anyone shares the /free-guide URL on social media before the redirect
// resolves.
export const metadata: Metadata = buildPageMetadata({
  title: 'Guia Grátis: 7 Erros que Fazem Alguém Perder o Interesse',
  description: 'Baixe gratuitamente o guia psicológico que revela os 7 padrões invisíveis que destroem relacionamentos e como rompê-los. Acesso imediato em PDF.',
  path: '/free-guide',
  keywords: [
    'guia relacionamento grátis',
    'ebook psicologia das relações',
    'como manter o interesse',
    'apego ansioso',
    'autoconhecimento emocional',
  ],
});

export default function FreeGuidePage() {
  permanentRedirect('/guia');
}
