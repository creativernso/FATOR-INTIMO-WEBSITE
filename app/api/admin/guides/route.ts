import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getGuides, upsertGuide, deleteGuide, getGuideBySlug } from '@/lib/db';
import { broadcastGuide } from '@/lib/broadcast';
import { Guide } from '@/lib/types';
import { v4 as uuid } from 'uuid';

function triggerGuideBroadcast(guide: Guide, optIn: boolean) {
  if (!optIn) return;
  if (!guide.published) return;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
  broadcastGuide({
    title: guide.title,
    description: guide.description || guide.subtitle || '',
    url: `${baseUrl}/guia/${guide.slug}`,
    coverImage: guide.coverImage,
  }).catch((err) => console.error('[guides] broadcast failed:', err));
}

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return false;
  try { await getAdminAuth().verifySessionCookie(session, true); return true; }
  catch { return false; }
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getGuides());
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.title?.trim() || !body.slug?.trim())
    return NextResponse.json({ error: 'Título e slug obrigatórios.' }, { status: 400 });

  const now = new Date().toISOString();
  const guide: Guide = {
    id: body.id || uuid(),
    slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    title: body.title.trim(),
    subtitle: body.subtitle?.trim() || undefined,
    description: body.description?.trim() || '',
    emotionalHook: body.emotionalHook?.trim() || undefined,
    bullets: body.bullets ?? [],
    ctaText: body.ctaText?.trim() || 'Quero o Guia Gratuito',
    coverImage: body.coverImage || undefined,
    pdfPath: body.pdfPath || undefined,
    tags: body.tags ?? [],
    category: body.category?.trim() || undefined,
    featured: body.featured ?? false,
    published: body.published ?? false,
    downloadCount: body.downloadCount ?? 0,
    formTitle: body.formTitle?.trim() || 'Quero o guia gratuito',
    formSubtitle: body.formSubtitle?.trim() || 'Preencha abaixo e receba acesso imediato.',
    successTitle: body.successTitle?.trim() || 'Acesso confirmado!',
    successMessage: body.successMessage?.trim() || 'O guia foi enviado para o seu e-mail.',
    authorName: body.authorName?.trim() || 'Rafael Moreira',
    authorRole: body.authorRole?.trim() || 'Especialista em Psicologia das Relações',
    authorQuote: body.authorQuote?.trim() || undefined,
    createdAt: body.createdAt || now,
    updatedAt: now,
  };

  await upsertGuide(guide);
  // Broadcast on new published guide (unless admin opted out)
  triggerGuideBroadcast(guide, body.broadcast !== false);
  return NextResponse.json(guide, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  // Detect transition from draft to published — that's when we broadcast
  const previous = body.slug ? await getGuideBySlug(body.slug) : null;
  const wasPublished = !!previous?.published;

  const updated: Guide = {
    ...body,
    slug: body.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || body.slug,
    updatedAt: new Date().toISOString(),
  };

  await upsertGuide(updated);

  if (!wasPublished && updated.published) {
    triggerGuideBroadcast(updated, body.broadcast !== false);
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  await deleteGuide(id);
  return NextResponse.json({ ok: true });
}
