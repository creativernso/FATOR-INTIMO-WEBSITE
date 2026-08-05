import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { v4 as uuid } from 'uuid';

// The browser-supplied Content-Type on a form part is entirely
// attacker-controlled — trusting it (as the old check did) let someone
// upload an SVG containing a <script> tag labeled "image/svg+xml", which
// Firebase Storage would then happily serve back with that same
// content-type, executing as script if opened directly. Sniffing the real
// magic bytes and hard-excluding SVG closes that off. No third-party image
// library needed for a handful of fixed byte signatures.
const ALLOWED_TYPES: Record<string, (buf: Buffer) => boolean> = {
  'image/jpeg': (buf) => buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  'image/png': (buf) => buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47,
  'image/webp': (buf) => buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP',
  'image/gif': (buf) => buf.length > 6 && (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a'),
};

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`testimonial_upload:${getClientIp(req)}`, 10, 600);
  if (!allowed) return NextResponse.json({ error: 'Muitos envios. Aguarde um pouco.' }, { status: 429 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Arquivo obrigatório.' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Imagem deve ter no máximo 5MB.' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = Object.entries(ALLOWED_TYPES).find(([, matches]) => matches(buffer))?.[0];
  if (!detectedType) {
    return NextResponse.json({ error: 'Apenas imagens JPEG, PNG, WEBP ou GIF são permitidas.' }, { status: 400 });
  }

  const ext = detectedType.split('/')[1].replace('jpeg', 'jpg');
  const filename = `testimonials/${uuid()}.${ext}`;

  const bucket = getAdminStorage().bucket();
  const fileRef = bucket.file(filename);
  await fileRef.save(buffer, { metadata: { contentType: detectedType } });
  await fileRef.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
