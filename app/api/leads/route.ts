import { NextRequest, NextResponse } from 'next/server';
import { getLeads, upsertLead } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(await getLeads());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newLead = {
    id: uuid(),
    name: body.name || '',
    email: body.email || undefined,
    whatsapp: body.whatsapp || undefined,
    source: body.source || 'unknown',
    createdAt: new Date().toISOString(),
  };
  await upsertLead(newLead);
  return NextResponse.json(newLead, { status: 201 });
}
