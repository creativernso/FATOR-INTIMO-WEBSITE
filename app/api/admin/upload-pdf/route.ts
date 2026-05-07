import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  // Verify admin session
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await getAdminAuth().verifySessionCookie(session, true);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const productId = formData.get('productId') as string | null;

  if (!file || !productId) {
    return NextResponse.json({ error: 'file e productId obrigatórios' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Apenas arquivos PDF são permitidos' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `products/${productId}/ebook.pdf`;

  const bucket = getAdminStorage().bucket();
  const bucketFile = bucket.file(filePath);

  await bucketFile.save(buffer, {
    metadata: { contentType: 'application/pdf' },
  });

  // Generate a signed URL valid for 7 days (for the admin to preview)
  const [url] = await bucketFile.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return NextResponse.json({ filePath, previewUrl: url });
}
