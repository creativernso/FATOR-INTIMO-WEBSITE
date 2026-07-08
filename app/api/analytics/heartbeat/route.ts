import { NextRequest, NextResponse } from 'next/server';
import { recordVisitorHeartbeat } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { visitorId, path, utmSource, utmCampaign } = await req.json();
    if (typeof visitorId === 'string' && visitorId) {
      const country = req.headers.get('x-vercel-ip-country') || undefined;
      await recordVisitorHeartbeat(visitorId, typeof path === 'string' ? path : '/', {
        country,
        utmSource: typeof utmSource === 'string' ? utmSource : undefined,
        utmCampaign: typeof utmCampaign === 'string' ? utmCampaign : undefined,
      });
    }
  } catch {}
  return NextResponse.json({ ok: true });
}
