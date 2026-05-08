import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('posts').get();

    // Fix any post whose slug is not URL-safe
    const fixed: string[] = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      const cleanSlug = slugify(data.slug || data.title || doc.id);
      if (cleanSlug !== data.slug) {
        await doc.ref.update({ slug: cleanSlug });
        fixed.push(`${doc.id}: "${data.slug}" → "${cleanSlug}"`);
      }
    }

    const after = await db.collection('posts').get();
    const posts = after.docs.map((d) => ({ id: d.id, slug: d.data().slug, title: d.data().title }));
    return NextResponse.json({ fixed, posts });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
