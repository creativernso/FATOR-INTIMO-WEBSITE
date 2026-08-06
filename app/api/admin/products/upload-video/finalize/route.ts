import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';

async function verifyAdmin() {
  const session = (await cookies()).get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

const MAX_SIZE = 150 * 1024 * 1024;

// The client's declared contentType on the signed PUT proves nothing about
// what was actually uploaded, so this step reads back just the first few
// bytes to sniff the real file signature — same reasoning as the
// testimonial photo upload fixed earlier — before making the object public.
const ALLOWED_TYPES: Record<string, (buf: Buffer) => boolean> = {
  'video/mp4': (buf) => buf.length > 8 && buf.toString('ascii', 4, 8) === 'ftyp',
  'video/webm': (buf) => buf.length > 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3,
};

// Step 2 of 2: called once the browser has finished PUTing the file
// directly to the signed URL from /init. This request only carries a file
// path (a few bytes), never the video itself, so it stays well under any
// serverless body-size limit.
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { filePath } = await req.json();
  if (typeof filePath !== 'string' || !filePath.startsWith('products/ugc-videos/')) {
    return NextResponse.json({ error: 'Caminho inválido.' }, { status: 400 });
  }

  const bucket = getAdminStorage().bucket();
  const file = bucket.file(filePath);

  try {
    const [metadata] = await file.getMetadata();
    const size = Number(metadata.size ?? 0);
    if (size > MAX_SIZE) {
      await file.delete().catch(() => {});
      return NextResponse.json({ error: 'Vídeo deve ter no máximo 60MB.' }, { status: 400 });
    }

    const [head] = await file.download({ start: 0, end: 12 });
    const detected = Object.values(ALLOWED_TYPES).some((matches) => matches(head));
    if (!detected) {
      await file.delete().catch(() => {});
      return NextResponse.json({ error: 'Apenas vídeos MP4 ou WEBM são permitidos.' }, { status: 400 });
    }

    await file.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload-video/finalize] error:', err);
    return NextResponse.json({ error: 'Erro ao processar vídeo.' }, { status: 500 });
  }
}
