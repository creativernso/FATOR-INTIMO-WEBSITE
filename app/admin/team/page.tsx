'use client';

import { useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '@/lib/types';
import { Users, X, Check, Trash2, Shield, Pencil, Headphones, UserPlus } from 'lucide-react';

const ROLE_META: Record<AdminRole, { label: string; icon: typeof Shield; color: string; desc: string }> = {
  owner: { label: 'Proprietário', icon: Shield, color: '#fe0050', desc: 'Acesso total, incluindo financeiro e gestão da equipe.' },
  editor: { label: 'Editor de conteúdo', icon: Pencil, color: '#3b82f6', desc: 'Blog, produtos, guias, depoimentos, marquee e pop-up.' },
  support: { label: 'Suporte', icon: Headphones, color: '#10b981', desc: 'Leads, comentários, comunidade e live chat.' },
};

const emptyInvite = { name: '', email: '', role: 'editor' as AdminRole };

export default function AdminTeamPage() {
  const [me, setMe] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState(emptyInvite);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

  const fetchAll = async () => {
    const [meRes, teamRes] = await Promise.all([
      fetch('/api/admin/me'),
      fetch('/api/admin/team'),
    ]);
    if (meRes.ok) setMe(await meRes.json());
    if (teamRes.ok) setUsers(await teamRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleInvite = async () => {
    setError('');
    if (!invite.name.trim() || !invite.email.trim()) { setError('Preencha nome e e-mail.'); return; }
    setInviting(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invite),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao convidar.'); return; }
      setInvite(emptyInvite);
      setShowInvite(false);
      await fetchAll();
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (uid: string, role: AdminRole) => {
    setBusyUid(uid);
    try {
      const res = await fetch(`/api/admin/team/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) await fetchAll();
      else { const data = await res.json().catch(() => null); alert(data?.error || 'Erro ao atualizar papel.'); }
    } finally {
      setBusyUid(null);
    }
  };

  const handleRemove = async (uid: string) => {
    if (!confirm('Remover o acesso desta pessoa ao painel?')) return;
    setBusyUid(uid);
    try {
      const res = await fetch(`/api/admin/team/${uid}`, { method: 'DELETE' });
      if (res.ok) await fetchAll();
      else { const data = await res.json().catch(() => null); alert(data?.error || 'Erro ao remover.'); }
    } finally {
      setBusyUid(null);
    }
  };

  const isOwner = me?.role === 'owner';

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Acesso
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Equipe
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {users.length} {users.length === 1 ? 'pessoa com acesso' : 'pessoas com acesso'} ao painel
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 lg:px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
            style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}
          >
            <UserPlus size={14} /> Convidar
          </button>
        )}
      </div>

      {!isOwner && !loading && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-amber-400" style={{ fontSize: fs('0.8rem', '0.9vw', '0.85rem') }}>
          Apenas proprietários podem gerenciar a equipe. Você pode ver quem tem acesso, mas não pode fazer alterações.
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-text-muted" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
            Carregando...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Pessoa', 'Papel', ''].map((h, i) => (
                  <th key={i} className={`text-left px-5 lg:px-6 py-4 text-text-muted font-medium tracking-widest uppercase ${i === 2 ? 'text-right' : ''}`}
                    style={{ fontSize: fs('0.62rem', '0.7vw', '0.68rem') }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.map((u) => {
                const meta = ROLE_META[u.role];
                const isSelf = u.uid === me?.uid;
                return (
                  <tr key={u.uid} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 lg:px-6 py-4 lg:py-5">
                      <p className="text-text-primary font-medium flex items-center gap-2" style={{ fontSize: fs('0.82rem', '0.95vw', '0.9rem') }}>
                        {u.name}
                        {isSelf && <span className="text-text-muted text-xs">(você)</span>}
                      </p>
                      <p className="text-text-muted mt-0.5" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}>
                        {u.email}
                      </p>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      {isOwner ? (
                        <select
                          value={u.role}
                          disabled={busyUid === u.uid}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as AdminRole)}
                          className="admin-input py-1.5"
                          style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem'), width: 'auto' }}
                        >
                          {(Object.keys(ROLE_META) as AdminRole[]).map((r) => (
                            <option key={r} value={r}>{ROLE_META[r].label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="flex items-center gap-1.5" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem'), color: meta.color }}>
                          <meta.icon size={13} /> {meta.label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      {isOwner && !isSelf && (
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRemove(u.uid)}
                            disabled={busyUid === u.uid}
                            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/8 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.keys(ROLE_META) as AdminRole[]).map((r) => {
          const meta = ROLE_META[r];
          return (
            <div key={r} className="rounded-2xl border border-white/5 bg-surface p-5">
              <div className="flex items-center gap-2 mb-2" style={{ color: meta.color }}>
                <meta.icon size={15} />
                <p className="font-medium" style={{ fontSize: fs('0.82rem', '0.9vw', '0.85rem') }}>{meta.label}</p>
              </div>
              <p className="text-text-muted" style={{ fontSize: fs('0.75rem', '0.82vw', '0.78rem') }}>{meta.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,7,3,0.92)', backdropFilter: 'blur(12px)' }}
        >
          <div className="bg-surface border border-white/8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
              <h3 className="text-text-primary font-medium flex items-center gap-2" style={{ fontSize: fs('0.95rem', '1.1vw', '1.05rem') }}>
                <Users size={16} /> Convidar para a equipe
              </h3>
              <button onClick={() => setShowInvite(false)} className="w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 flex items-center justify-center transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>Nome</label>
                <input className="admin-input" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} placeholder="Nome da pessoa" />
              </div>
              <div>
                <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>E-mail</label>
                <input type="email" className="admin-input" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="text-text-muted font-medium mb-1.5 block" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>Papel</label>
                <select className="admin-input" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as AdminRole })}>
                  {(Object.keys(ROLE_META) as AdminRole[]).map((r) => (
                    <option key={r} value={r}>{ROLE_META[r].label}</option>
                  ))}
                </select>
                <p className="text-text-muted mt-1.5" style={{ fontSize: fs('0.68rem', '0.75vw', '0.72rem') }}>
                  {ROLE_META[invite.role].desc}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                  <X size={12} /> {error}
                </div>
              )}

              <p className="text-text-muted" style={{ fontSize: fs('0.68rem', '0.75vw', '0.72rem') }}>
                Um e-mail será enviado com um link para a pessoa definir sua própria senha e acessar o painel.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/[0.04]">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2.5 text-text-muted hover:text-text-primary transition-colors" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
                Cancelar
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
                style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}
              >
                <Check size={14} />
                {inviting ? 'Enviando...' : 'Convidar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
