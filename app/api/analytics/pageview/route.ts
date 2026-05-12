import { NextRequest, NextResponse } from 'next/server';
import { incrementPageView } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    await incrementPageView(typeof path === 'string' ? path : '/');
  } catch {}
  return NextResponse.json({ ok: true });
}
