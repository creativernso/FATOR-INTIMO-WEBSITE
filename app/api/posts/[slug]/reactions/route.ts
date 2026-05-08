import { NextRequest, NextResponse } from 'next/server';
import { getLikes, incrementLike } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const likes = await getLikes(slug);
  return NextResponse.json({ likes });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const likes = await incrementLike(slug);
  return NextResponse.json({ likes });
}
