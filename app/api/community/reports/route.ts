import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { upsertCommunityReport, createNotification } from '@/lib/db';
import { alertCommunityReport } from '@/lib/admin-notifications';
import { CommunityReport } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  let reporterId: string | undefined;
  if (auth?.startsWith('Bearer ')) {
    try {
      const decoded = await getAdminAuth().verifyIdToken(auth.slice(7));
      reporterId = decoded.uid;
    } catch { /* anonymous report still allowed */ }
  }

  const { targetId, targetType, reason } = await req.json();
  if (!targetId || !targetType || !reason?.trim()) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
  }

  const report: CommunityReport = {
    id: uuid(),
    targetId,
    targetType,
    reason: reason.trim(),
    reporterId,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  await upsertCommunityReport(report);
  await createNotification(
    'community_report',
    'Denúncia na Comunidade',
    `Conteúdo denunciado: "${reason.trim().slice(0, 80)}"`,
    { targetType, targetId }
  );
  alertCommunityReport(reason.trim(), reporterId || 'anônimo', targetId);
  return NextResponse.json({ ok: true }, { status: 201 });
}
