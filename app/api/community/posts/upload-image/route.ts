import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { v4 as uuid } from 'uuid';

async function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try { return await getAdminAuth().verifyIdToken(auth.slice(7)); }
  catch { return null; }
}

// Filename extension and the form part's Content-Type are both
// client-supplied — neither proves what the file actually contains. Sniff
// the real magic bytes instead (same approach as the testimonials upload
// route) so an SVG-with-<script> can't be relabeled as "photo.png" and
// served back with an image content-type it doesn't deserve.
const ALLOWED_TYPES: Record<string, (buf: Buffer) => boolean> = {
  'image/jpeg': (buf) => buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  'image/png': (buf) => buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47,
  'image/webp': (buf) => buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP',
};

export async function POST(req: NextRequest) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const allowed = await checkRateLimit(`community_upload:${getClientIp(req)}`, 15, 600);
  if (!allowed) return NextResponse.json({ error: 'Muitos envios. Aguarde um pouco.' }, { status: 429 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 400 });

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagem muito grande. Máximo 8 MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = Object.entries(ALLOWED_TYPES).find(([, matches]) => matches(buffer))?.[0];
  if (!detectedType) {
    return NextResponse.json({ error: 'Formato não suportado. Use JPEG, PNG ou WEBP.' }, { status: 400 });
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) return NextResponse.json({ error: 'Storage não configurado.' }, { status: 500 });

  const ext = detectedType.split('/')[1].replace('jpeg', 'jpg');
  const fileId = uuid();
  const filePath = `community/posts/${fileId}.${ext}`;
  const token = crypto.randomUUID();

  const bucket = getAdminStorage().bucket(bucketName);
  await bucket.file(filePath).save(buffer, {
    metadata: {
      contentType: detectedType,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const encodedPath = encodeURIComponent(filePath);
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;

  return NextResponse.json({ imageUrl });
}
