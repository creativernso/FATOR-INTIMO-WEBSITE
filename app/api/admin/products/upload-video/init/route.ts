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

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

// Step 1 of 2: hands the browser a short-lived signed URL to PUT the video
// bytes straight to Cloud Storage. Proxying the file through this route
// instead would hit Vercel's ~4.5MB serverless function body limit —
// that's exactly what was failing before ("Erro de conexão" is what a
// request rejected at that limit looks like client-side).
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { contentType } = await req.json();
  const ext = ALLOWED_CONTENT_TYPES[contentType];
  if (!ext) return NextResponse.json({ error: 'Tipo de vídeo não suportado.' }, { status: 400 });

  const filePath = `products/ugc-videos/${uuid()}.${ext}`;
  const bucket = getAdminStorage().bucket();
  const [uploadUrl] = await bucket.file(filePath).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 10 * 60 * 1000,
    contentType,
  });

  return NextResponse.json({ uploadUrl, filePath });
}
