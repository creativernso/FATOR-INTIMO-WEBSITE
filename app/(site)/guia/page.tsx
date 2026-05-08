import type { Metadata } from 'next';
import { getGuides } from '@/lib/db';
import GuideLibraryContent from './GuideLibraryContent';

export const metadata: Metadata = {
  title: 'Biblioteca Emocional — Guias Gratuitos',
  description: 'Guias psicológicos gratuitos criados por Rafael Moreira para quem quer entender relacionamentos, emoções e autoconhecimento com profundidade.',
};

export const dynamic = 'force-dynamic';

export default async function GuiaLibraryPage() {
  const guides = await getGuides(true);
  return <GuideLibraryContent guides={guides} />;
}
