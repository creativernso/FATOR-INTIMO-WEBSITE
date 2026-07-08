import { NextRequest, NextResponse } from 'next/server';
import { incrementPageView } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { path, utmCampaign, utmSource } = await req.json();
    const country = req.headers.get('x-vercel-ip-country') || undefined;
    const campaign = typeof utmCampaign === 'string' && utmCampaign ? utmCampaign : (typeof utmSource === 'string' ? utmSource : undefined);
    await incrementPageView(typeof path === 'string' ? path : '/', country, campaign);
  } catch {}
  return NextResponse.json({ ok: true });
}
