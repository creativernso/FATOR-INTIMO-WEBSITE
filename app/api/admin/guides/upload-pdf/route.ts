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
  if (file.type !== 'application/pdf')
    return NextResponse.json({ error: 'Apenas PDF é permitido.' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `guides/${guideId}/guide.pdf`;
  const bucket = getAdminStorage().bucket();
  const bucketFile = bucket.file(filePath);

  await bucketFile.save(buffer, { metadata: { contentType: 'application/pdf' } });

  const guides = await getGuides();
  const guide = guides.find((g) => g.id === guideId);
  if (guide) {
    await upsertGuide({ ...guide, pdfPath: filePath, updatedAt: new Date().toISOString() });
  }

  return NextResponse.json({ ok: true, filePath });
}
