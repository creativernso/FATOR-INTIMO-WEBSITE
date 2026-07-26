import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getAdminUsers, upsertAdminUser } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { campaignHtml, campaignText } from '@/lib/email-template';
import { AdminRole } from '@/lib/types';

const VALID_ROLES: AdminRole[] = ['owner', 'editor', 'support'];

function roleLabel(role: AdminRole): string {
  return role === 'owner' ? 'Proprietário' : role === 'editor' ? 'Editor de conteúdo' : 'Suporte';
}

export async function GET() {
  if (!(await requireAdmin(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getAdminUsers());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(['owner']);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, name, role } = await req.json();
  if (!email?.trim() || !name?.trim()) return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 });
  if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: 'Papel inválido.' }, { status: 400 });

  const auth = getAdminAuth();
  const cleanEmail = email.trim().toLowerCase();
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(cleanEmail);
    uid = existing.uid;
  } catch {
    try {
      const randomPassword = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}Aa1!`;
      const created = await auth.createUser({ email: cleanEmail, password: randomPassword, displayName: name.trim() });
      uid = created.uid;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  const existingAdmins = await getAdminUsers();
  if (existingAdmins.some((a) => a.uid === uid)) {
    return NextResponse.json({ error: 'Essa pessoa já faz parte da equipe.' }, { status: 400 });
  }

  await upsertAdminUser({
    uid,
    email: cleanEmail,
    name: name.trim(),
    role,
    createdAt: new Date().toISOString(),
    createdBy: admin.uid,
  });

  if (resend) {
    try {
      const resetLink = await auth.generatePasswordResetLink(cleanEmail);
      const firstName = name.trim().split(' ')[0];
      const subject = 'Você foi convidado para o painel Fator Íntimo';
      const intro = `Olá, ${firstName},\n\n${admin.name || 'Um administrador'} te convidou para acessar o painel administrativo do Fator Íntimo, com o papel de ${roleLabel(role)}.\n\nClique no botão abaixo para definir sua senha e entrar:`;
      const ctaHtml = `<a href="${resetLink}" style="display:inline-block;background:#fe0050;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:600;margin-top:14px;">Definir senha e entrar →</a>`;
      await resend.emails.send({
        from: FROM_EMAIL,
        to: cleanEmail,
        subject,
        html: campaignHtml({ subject, body: `${intro}\n\n${ctaHtml}` }),
        text: campaignText({ subject, body: `${intro}\n\n${resetLink}` }),
      });
    } catch (err) {
      console.error('[admin/team] failed to send invite email:', err);
    }
  }

  return NextResponse.json({ ok: true, uid });
}
