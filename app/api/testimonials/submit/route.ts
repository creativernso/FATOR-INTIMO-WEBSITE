import { NextRequest, NextResponse } from 'next/server';
import { upsertTestimonial, createNotification } from '@/lib/db';
import { alertNewTestimonial } from '@/lib/admin-notifications';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`testimonial_submit:${getClientIp(req)}`, 5, 3600);
  if (!allowed) return NextResponse.json({ error: 'Muitos envios. Aguarde um pouco.' }, { status: 429 });

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
    name: (anonymous ? 'Anônimo' : name.trim()).slice(0, 100),
    role: (role?.trim() || '').slice(0, 100),
    age: age ? Number(age) : undefined,
    headline: headline?.trim().slice(0, 120) || undefined,
    content: content.trim().slice(0, 3000),
    transformation: (transformation?.trim() || '').slice(0, 3000),
    rating: rating ? Number(rating) : undefined,
    productPurchased: (productPurchased?.trim() || '').slice(0, 100),
    socialHandle: socialHandle?.trim().slice(0, 100) || undefined,
    avatar: avatar || undefined,
    anonymous: !!anonymous,
    status: 'pending',
    featured: false,
    submittedAt: new Date().toISOString(),
  });

  const displayName = anonymous ? 'Anônimo' : name?.trim() || 'Alguém';
  await createNotification(
    'testimonial',
    'Novo depoimento enviado',
    `${displayName} enviou um depoimento para aprovação.`,
    { name: displayName }
  );
  alertNewTestimonial(displayName);

  return NextResponse.json({ ok: true });
}
