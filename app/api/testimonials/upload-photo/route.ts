import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Arquivo obrigatório.' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Apenas imagens são permitidas.' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Imagem deve ter no máximo 5MB.' }, { status: 400 });

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const filename = `testimonials/${uuid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const bucket = getAdminStorage().bucket();
  const fileRef = bucket.file(filename);
  await fileRef.save(buffer, { metadata: { contentType: file.type } });
  await fileRef.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
