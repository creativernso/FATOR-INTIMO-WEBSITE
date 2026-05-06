import { NextRequest, NextResponse } from 'next/server';
import { getLeads, saveLeads } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET() {
  return NextResponse.json(getLeads());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const leads = getLeads();
  const newLead = {
    id: uuid(),
    name: body.name || '',
    email: body.email || undefined,
    whatsapp: body.whatsapp || undefined,
    source: body.source || 'unknown',
    createdAt: new Date().toISOString(),
  };
  leads.push(newLead);
  saveLeads(leads);
  return NextResponse.json(newLead, { status: 201 });
}
