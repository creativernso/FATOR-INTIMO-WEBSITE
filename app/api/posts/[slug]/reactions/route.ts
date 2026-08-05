import { NextRequest, NextResponse } from 'next/server';
import { getLikes, incrementLike } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const likes = await getLikes(slug);
  return NextResponse.json({ likes });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const allowed = await checkRateLimit(`post_reaction:${getClientIp(req)}`, 30, 300);
  if (!allowed) return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 });
  const { slug } = await params;
  const likes = await incrementLike(slug);
  return NextResponse.json({ likes });
}
