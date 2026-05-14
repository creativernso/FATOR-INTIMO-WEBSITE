import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
export const SITE_NAME = 'Fator Íntimo';
export const SITE_DEFAULT_OG = '/og-default.png';

interface PageMetaOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  keywords?: string[];
}

/**
 * Build a complete Metadata object for a page (canonical, OG, Twitter, robots).
 * Always uses the absolute URL of the page as canonical.
 */
export function buildPageMetadata(opts: PageMetaOptions): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  const image = opts.ogImage || SITE_DEFAULT_OG;

  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: opts.ogType ?? 'website',
      url,
      title: opts.title,
      description: opts.description,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    robots: opts.noindex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  };
}
