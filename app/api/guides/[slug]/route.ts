import { NextRequest, NextResponse } from 'next/server';
import { getGuideBySlug } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide?.published) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  return NextResponse.json(guide);
}
