import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsers, upsertAdminUser, deleteAdminUser } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { AdminRole } from '@/lib/types';

const VALID_ROLES: AdminRole[] = ['owner', 'editor', 'support'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  if (!(await requireAdmin(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { uid } = await params;
  const { role } = await req.json();
  if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: 'Papel inválido.' }, { status: 400 });

  const users = await getAdminUsers();
  const target = users.find((u) => u.uid === uid);
  if (!target) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });

  if (target.role === 'owner' && role !== 'owner') {
    const otherOwners = users.filter((u) => u.role === 'owner' && u.uid !== uid);
    if (otherOwners.length === 0) {
      return NextResponse.json({ error: 'Precisa haver ao menos um proprietário.' }, { status: 400 });
    }
  }

  await upsertAdminUser({ ...target, role });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const admin = await requireAdmin(['owner']);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { uid } = await params;
  if (uid === admin.uid) return NextResponse.json({ error: 'Você não pode remover a si mesmo.' }, { status: 400 });

  const users = await getAdminUsers();
  const target = users.find((u) => u.uid === uid);
  if (!target) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });

  if (target.role === 'owner') {
    const otherOwners = users.filter((u) => u.role === 'owner' && u.uid !== uid);
    if (otherOwners.length === 0) {
      return NextResponse.json({ error: 'Precisa haver ao menos um proprietário.' }, { status: 400 });
    }
  }

  await deleteAdminUser(uid);
  return NextResponse.json({ ok: true });
}
