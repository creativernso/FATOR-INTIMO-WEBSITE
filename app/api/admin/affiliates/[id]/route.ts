import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateById, updateAffiliate } from '@/lib/affiliates';
import { requireAdmin } from '@/lib/admin-auth';
import { sendTransactional } from '@/lib/resend';
import { affiliateApprovedHtml, affiliateApprovedText } from '@/lib/email-template';
import type { AffiliateStatus } from '@/lib/types';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const existing = await getAffiliateById(id);
  if (!existing) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.status === 'string') {
    const status = body.status as AffiliateStatus;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }
    data.status = status;
    if (status === 'approved' && existing.status !== 'approved') {
      data.approvedAt = new Date().toISOString();
    }
  }
  if (typeof body.commissionRate === 'number') {
    data.commissionRate = Math.max(0, Math.min(100, body.commissionRate));
  }
  if (typeof body.pixKey === 'string') {
    data.pixKey = body.pixKey.trim() || undefined;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 });
  }

  await updateAffiliate(id, data);

  // Send the approval email the first time an affiliate transitions to approved.
  if (data.status === 'approved' && existing.status !== 'approved') {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
    const referralLink = `${baseUrl}/?ref=${existing.code}`;
    const dashboardUrl = `${baseUrl}/afiliados/painel/${existing.dashboardToken}`;
    const commissionRate = (data.commissionRate as number | undefined) ?? existing.commissionRate;
    await sendTransactional({
      to: existing.email,
      subject: 'Você está aprovado no programa de afiliados',
      html: affiliateApprovedHtml({ name: existing.name, referralLink, dashboardUrl, commissionRate }),
      text: affiliateApprovedText({ name: existing.name, referralLink, dashboardUrl, commissionRate }),
      tag: `affiliate-approved-${existing.id}`,
    });
  }

  return NextResponse.json({ ok: true });
}
