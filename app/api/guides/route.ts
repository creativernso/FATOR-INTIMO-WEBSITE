import { NextResponse } from 'next/server';
import { getGuides } from '@/lib/db';

export async function GET() {
  const guides = await getGuides(true);
  return NextResponse.json(guides);
}
