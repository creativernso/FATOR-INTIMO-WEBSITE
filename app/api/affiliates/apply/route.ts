import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { saveAffiliate, getAffiliateByCode, getAffiliateByEmail } from '@/lib/affiliates';
import { createNotification } from '@/lib/db';
import { alertNewAffiliateApplication } from '@/lib/admin-notifications';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { Affiliate } from '@/lib/types';

const DEFAULT_COMMISSION_RATE = 20;

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');

function slugifyBase(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 12);
  return base || 'afiliado';
}

async function generateUniqueCode(name: string): Promise<string> {
  const base = slugifyBase(name);
  for (let i = 0; i < 5; i++) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const code = `${base}${suffix}`;
    if (!(await getAffiliateByCode(code))) return code;
  }
  return `${base}${uuid().slice(0, 8)}`;
}

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`affiliate_apply:${getClientIp(req)}`, 5, 3600);
  if (!allowed) return NextResponse.json({ error: 'Muitas tentativas. Aguarde um pouco.' }, { status: 429 });

  const body = await req.json();
  const { name, email, socialHandle, message, pixKey } = body;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Nome e email são obrigatórios.' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await getAffiliateByEmail(normalizedEmail);
  if (existing) {
    return NextResponse.json({ error: 'Este email já está cadastrado no programa de afiliados.' }, { status: 400 });
  }

  const code = await generateUniqueCode(name);
  const affiliate: Affiliate = {
    id: uuid(),
    name: name.trim(),
    email: normalizedEmail,
    code,
    dashboardToken: uuid(),
    status: 'pending',
    commissionRate: DEFAULT_COMMISSION_RATE,
    socialHandle: socialHandle?.trim() || undefined,
    message: message?.trim() || undefined,
    pixKey: pixKey?.trim() || undefined,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };
  await saveAffiliate(affiliate);

  await createNotification(
    'affiliate_application',
    'Nova solicitação de afiliado',
    `${affiliate.name} (${affiliate.email}) solicitou entrada no programa de afiliados.`,
    { name: affiliate.name, email: affiliate.email },
  );
  alertNewAffiliateApplication(affiliate.name, affiliate.email);

  return NextResponse.json({ ok: true });
}
