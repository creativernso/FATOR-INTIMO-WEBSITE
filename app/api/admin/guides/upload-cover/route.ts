import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';
import { getGuides, upsertGuide } from '@/lib/db';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await getAdminAuth().verifySessionCookie(session, true); }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const guideId = formData.get('guideId') as string | null;

  if (!file) return NextResponse.json({ error: 'Arquivo obrigatório.' }, { status: 400 });
  if (!guideId) return NextResponse.json({ error: 'guideId obrigatório.' }, { status: 400 });

  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type))
    return NextResponse.json({ error: 'Apenas JPG, PNG ou WebP.' }, { status: 400 });

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
  const filePath = `guides/${guideId}/cover.${ext}`;
  const token = crypto.randomUUID();

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) return NextResponse.json({ error: 'Storage não configurado.' }, { status: 500 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = getAdminStorage().bucket(bucketName);
  const bucketFile = bucket.file(filePath);

  await bucketFile.save(buffer, {
    metadata: {
      contentType: file.type,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const encodedPath = encodeURIComponent(filePath);
  const coverImage = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;

  const guides = await getGuides();
  const guide = guides.find((g) => g.id === guideId);
  if (guide) {
    await upsertGuide({ ...guide, coverImage, updatedAt: new Date().toISOString() });
  }

  return NextResponse.json({ ok: true, coverImage });
}
