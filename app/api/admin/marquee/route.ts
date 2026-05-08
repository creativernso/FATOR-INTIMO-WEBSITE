import { NextRequest, NextResponse } from 'next/server';
import { getMarqueePhrases, upsertMarqueePhrase, deleteMarqueePhrase } from '@/lib/db';
import { MarqueePhrase } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export async function GET() {
  const phrases = await getMarqueePhrases();
  return NextResponse.json(phrases);
}

export async function POST(req: NextRequest) {
  const { text, order, active } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Texto obrigatório.' }, { status: 400 });
  const phrase: MarqueePhrase = {
    id: uuid(),
    text: text.trim(),
    order: order ?? 99,
    active: active ?? true,
  };
  await upsertMarqueePhrase(phrase);
  return NextResponse.json(phrase, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const phrase = await req.json() as MarqueePhrase;
  if (!phrase.id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  await upsertMarqueePhrase(phrase);
  return NextResponse.json(phrase);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  await deleteMarqueePhrase(id);
  return NextResponse.json({ ok: true });
}
