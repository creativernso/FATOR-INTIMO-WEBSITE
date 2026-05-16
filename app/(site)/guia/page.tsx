import type { Metadata } from 'next';
import { getGuides } from '@/lib/db';
import { getLocale, createT } from '@/lib/i18n';
import GuideLibraryContent from './GuideLibraryContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = createT(locale);
  return {
    title: `${t('library.badge')} | Fator Íntimo`,
    description: t('library.subtext'),
  };
}

export default async function GuiaLibraryPage() {
  const locale = await getLocale();
  const guides = await getGuides(true, locale);
  return <GuideLibraryContent guides={guides} locale={locale} />;
}
