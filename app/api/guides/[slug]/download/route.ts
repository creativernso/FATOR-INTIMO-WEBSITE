import { NextRequest, NextResponse } from 'next/server';
import { getGuideBySlug } from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/firebase-admin';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide?.published || !guide.pdfPath) {
    return NextResponse.json({ error: 'Guia não disponível.' }, { status: 404 });
  }

  try {
    const url = await getSignedDownloadUrl(guide.pdfPath, 60 * 60 * 1000);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar link de download.' }, { status: 500 });
  }
}
