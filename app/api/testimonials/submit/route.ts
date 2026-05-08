import { NextRequest, NextResponse } from 'next/server';
import { upsertTestimonial, createNotification } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, role, age, headline, content, transformation, rating, productPurchased, socialHandle, anonymous, avatar } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Depoimento obrigatório.' }, { status: 400 });
  }
  if (!anonymous && !name?.trim()) {
    return NextResponse.json({ error: 'Nome obrigatório (ou marque anônimo).' }, { status: 400 });
  }

  await upsertTestimonial({
    id: uuid(),
    name: anonymous ? 'Anônimo' : name.trim(),
    role: role?.trim() || '',
    age: age ? Number(age) : undefined,
    headline: headline?.trim() || undefined,
    content: content.trim(),
    transformation: transformation?.trim() || '',
    rating: rating ? Number(rating) : undefined,
    productPurchased: productPurchased?.trim() || '',
    socialHandle: socialHandle?.trim() || undefined,
    avatar: avatar || undefined,
    anonymous: !!anonymous,
    status: 'pending',
    featured: false,
    submittedAt: new Date().toISOString(),
  });

  await createNotification(
    'testimonial',
    'Novo depoimento enviado',
    `${anonymous ? 'Anônimo' : name?.trim() || 'Alguém'} enviou um depoimento para aprovação.`,
    { name: anonymous ? 'Anônimo' : name?.trim() || '' }
  );

  return NextResponse.json({ ok: true });
}
