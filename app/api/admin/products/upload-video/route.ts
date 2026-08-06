import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';
import { v4 as uuid } from 'uuid';

async function verifyAdmin() {
  const session = (await cookies()).get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

// Sniffs real file bytes instead of trusting the client-supplied
// Content-Type/extension — same reasoning as the testimonial photo upload
// fixed earlier: a declared type proves nothing about what's actually in
// the file.
const ALLOWED_TYPES: Record<string, (buf: Buffer) => boolean> = {
  'video/mp4': (buf) => buf.length > 8 && buf.toString('ascii', 4, 8) === 'ftyp',
  'video/webm': (buf) => buf.length > 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3,
};

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Arquivo obrigatório.' }, { status: 400 });
  if (file.size > 60 * 1024 * 1024) {
    return NextResponse.json({ error: 'Vídeo deve ter no máximo 60MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = Object.entries(ALLOWED_TYPES).find(([, matches]) => matches(buffer))?.[0];
  if (!detectedType) {
    return NextResponse.json({ error: 'Apenas vídeos MP4 ou WEBM são permitidos.' }, { status: 400 });
  }

  const ext = detectedType.split('/')[1];
  const filename = `products/ugc-videos/${uuid()}.${ext}`;

  const bucket = getAdminStorage().bucket();
  const fileRef = bucket.file(filename);
  await fileRef.save(buffer, { metadata: { contentType: detectedType } });
  await fileRef.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
