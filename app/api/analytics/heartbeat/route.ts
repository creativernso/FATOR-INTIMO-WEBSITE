import { NextRequest, NextResponse } from 'next/server';
import { recordVisitorHeartbeat } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { visitorId, path } = await req.json();
    if (typeof visitorId === 'string' && visitorId) {
      await recordVisitorHeartbeat(visitorId, typeof path === 'string' ? path : '/');
    }
  } catch {}
  return NextResponse.json({ ok: true });
}
