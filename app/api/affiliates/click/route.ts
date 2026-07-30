import { NextRequest, NextResponse } from 'next/server';
import { incrementAffiliateClicks } from '@/lib/affiliates';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (typeof code === 'string' && code.trim()) {
      await incrementAffiliateClicks(code.trim());
    }
  } catch {}
  return NextResponse.json({ ok: true });
}
