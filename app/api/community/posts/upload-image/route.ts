import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';
import { v4 as uuid } from 'uuid';

async function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try { return await getAdminAuth().verifyIdToken(auth.slice(7)); }
  catch { return null; }
}

export async function POST(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return NextResponse.json({ error: 'Formato não suportado. Use JPEG, PNG ou WEBP.' }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagem muito grande. Máximo 8 MB.' }, { status: 400 });
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) return NextResponse.json({ error: 'Storage não configurado.' }, { status: 500 });

  const fileId = uuid();
  const filePath = `community/posts/${fileId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const token = crypto.randomUUID();

  const bucket = getAdminStorage().bucket(bucketName);
  await bucket.file(filePath).save(buffer, {
    metadata: {
      contentType: file.type || `image/${ext}`,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const encodedPath = encodeURIComponent(filePath);
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;

  return NextResponse.json({ imageUrl });
}
