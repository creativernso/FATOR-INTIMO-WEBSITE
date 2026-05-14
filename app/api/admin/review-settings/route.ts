import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getReviewSettings, saveReviewSettings } from '@/lib/db';
import type { ReviewSettings } from '@/lib/types';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getReviewSettings());
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json() as Partial<ReviewSettings>;
  const current = await getReviewSettings();
  const next: ReviewSettings = {
    productEnabled: body.productEnabled ?? current.productEnabled,
    productDelayDays: Math.max(0, Math.min(365, Number(body.productDelayDays ?? current.productDelayDays))),
    productSubject: body.productSubject?.trim() || current.productSubject,
    productBody: body.productBody?.trim() || current.productBody,
    guideEnabled: body.guideEnabled ?? current.guideEnabled,
    guideDelayDays: Math.max(0, Math.min(365, Number(body.guideDelayDays ?? current.guideDelayDays))),
    guideSubject: body.guideSubject?.trim() || current.guideSubject,
    guideBody: body.guideBody?.trim() || current.guideBody,
    ctaLabel: body.ctaLabel?.trim() || current.ctaLabel,
  };
  await saveReviewSettings(next);
  return NextResponse.json(next);
}
