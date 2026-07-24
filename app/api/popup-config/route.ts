import { NextResponse } from 'next/server';
import { getPopupConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Public read-only view of the popup config, consumed by the SitePopup widget.
export async function GET() {
  try {
    const config = await getPopupConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
