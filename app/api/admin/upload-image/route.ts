import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await getAdminAuth().verifySessionCookie(session, true);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string) || 'general';

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
  const filename = `images/${folder}/${Date.now()}.${ext}`;
  const token = crypto.randomUUID();

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    console.error('[upload-image] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not set');
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  let bucket;
  try {
    bucket = getAdminStorage().bucket(bucketName);
  } catch (err) {
    console.error('[upload-image] Failed to get storage bucket:', err);
    return NextResponse.json({ error: 'Storage init failed' }, { status: 500 });
  }

  const fileRef = bucket.file(filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });
  } catch (err) {
    console.error('[upload-image] Failed to save file:', err);
    return NextResponse.json({ error: 'Upload to storage failed' }, { status: 500 });
  }

  const encodedPath = encodeURIComponent(filename);
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;

  return NextResponse.json({ url });
}
