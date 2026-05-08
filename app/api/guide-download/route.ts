import { NextResponse } from 'next/server';
import { getSignedDownloadUrl } from '@/lib/firebase-admin';
import { getGuideConfig } from '@/lib/db';

export async function GET() {
  const config = await getGuideConfig();
  if (!config.guideFilePath) {
    return NextResponse.json({ error: 'Guia não disponível ainda.' }, { status: 404 });
  }
  try {
    const url = await getSignedDownloadUrl(config.guideFilePath, 60 * 60 * 1000); // 1h
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar link de download.' }, { status: 500 });
  }
}
