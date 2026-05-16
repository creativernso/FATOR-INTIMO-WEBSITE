import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fator Íntimo: Psicologia das Relações',
    short_name: 'Fator Íntimo',
    description: 'Entenda o amor. Domine suas relações.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0705',
    theme_color: '#0a0705',
    icons: [
      { src: '/FAV.png?v=2', sizes: '192x192', type: 'image/png' },
      { src: '/FAV.png?v=2', sizes: '512x512', type: 'image/png' },
      { src: '/FAV.png?v=2', sizes: 'any', type: 'image/png', purpose: 'any' },
    ],
    categories: ['lifestyle', 'education', 'books'],
    lang: 'pt-BR',
  };
}
