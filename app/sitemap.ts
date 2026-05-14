import type { MetadataRoute } from 'next';
import { getPosts, getProducts, getGuides, getCommunityPosts } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';

// Force this route to be dynamic so it always reflects the latest content.
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // also allow a 1-hour cache layer

const COMMUNITY_CATEGORIES = [
  'identificacao',
  'reflexoes',
  'rupturas',
  'autoconhecimento',
  'reconstrucao',
  'cura',
  'liberdade',
  'apego',
  'intimidade',
  'feminino-masculino',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static / evergreen pages
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,             changeFrequency: 'daily',   priority: 1.0, lastModified: now },
    { url: `${SITE_URL}/blog`,         changeFrequency: 'daily',   priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/products`,     changeFrequency: 'weekly',  priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/guia`,         changeFrequency: 'weekly',  priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/free-guide`,   changeFrequency: 'monthly', priority: 0.8, lastModified: now },
    { url: `${SITE_URL}/comunidade`,   changeFrequency: 'daily',   priority: 0.85, lastModified: now },
    { url: `${SITE_URL}/testimonials`, changeFrequency: 'weekly',  priority: 0.7, lastModified: now },
    { url: `${SITE_URL}/about`,        changeFrequency: 'monthly', priority: 0.5, lastModified: now },
    { url: `${SITE_URL}/social`,       changeFrequency: 'monthly', priority: 0.4, lastModified: now },
  ];

  // Community category landing pages
  const categoryEntries: MetadataRoute.Sitemap = COMMUNITY_CATEGORIES.map((c) => ({
    url: `${SITE_URL}/comunidade/categoria/${c}`,
    changeFrequency: 'daily',
    priority: 0.6,
    lastModified: now,
  }));

  // Dynamic content
  let postEntries: MetadataRoute.Sitemap = [];
  let productEntries: MetadataRoute.Sitemap = [];
  let guideEntries: MetadataRoute.Sitemap = [];
  let communityEntries: MetadataRoute.Sitemap = [];

  try {
    const posts = await getPosts();
    postEntries = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: 'monthly',
      priority: p.featured ? 0.85 : 0.7,
    }));
  } catch {}

  try {
    const products = await getProducts();
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));
  } catch {}

  try {
    const guides = await getGuides(true);
    guideEntries = guides.map((g) => ({
      url: `${SITE_URL}/guia/${g.slug}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));
  } catch {}

  try {
    const posts = await getCommunityPosts({ status: 'approved' });
    communityEntries = posts.map((p) => ({
      url: `${SITE_URL}/comunidade/${p.id}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : now,
      changeFrequency: 'weekly',
      priority: 0.55,
    }));
  } catch {}

  return [
    ...staticEntries,
    ...categoryEntries,
    ...postEntries,
    ...productEntries,
    ...guideEntries,
    ...communityEntries,
  ];
}
