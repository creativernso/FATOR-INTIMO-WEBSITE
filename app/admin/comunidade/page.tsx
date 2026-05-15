'use client';

import { useState, useEffect } from 'react';
import {
  Check, X, Sparkles, Pin, Trash2, Users, MessageSquare,
  AlertTriangle, Search, ChevronDown, Eye, Send,
} from 'lucide-react';
import { CommunityPost, CommunityReport, CommunityUser } from '@/lib/types';
import { getCategoryBySlug } from '@/lib/community';

type Tab = 'posts' | 'users' | 'reports' | 'emails';
type PostFilter = 'all' | 'pending' | 'approved' | 'rejected';

const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export default function AdminComunidade() {
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [postFilter, setPostFilter] = useState<PostFilter>('pending');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [p, u, r] = await Promise.all([
      fetch('/api/admin/community/posts').then((r) => r.json()),
      fetch('/api/admin/community/users').then((r) => r.json()),
      fetch('/api/admin/community/reports').then((r) => r.json()),
    ]);
    setPosts(Array.isArray(p) ? p : []);
    setUsers(Array.isArray(u) ? u : []);
    setReports(Array.isArray(r) ? r : []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const patchPost = async (id: string, data: Partial<CommunityPost>) => {
    setBusy(id);
    await fetch('/api/admin/community/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    await fetchAll();
    setBusy(null);
  };

  const deletePost = async (id: string) => {
    if (!confirm('Excluir esta publicação permanentemente?')) return;
    setBusy(id);
    await fetch('/api/admin/community/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchAll();
    setBusy(null);
  };

  const patchUser = async (uid: string, data: Partial<CommunityUser>) => {
    setBusy(uid);
    await fetch('/api/admin/community/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, ...data }),
    });
    await fetchAll();
    setBusy(null);
  };

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return;
    if (!confirm(`Enviar para todos os membros da comunidade com email cadastrado?`)) return;
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await fetch('/api/admin/community/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailSubject, body: emailBody }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailResult(data);
        setEmailSubject('');
        setEmailBody('');
      }
    } finally {
      setEmailSending(false);
    }
  };

  const patchReport = async (id: string, status: string) => {
    setBusy(id);
    await fetch('/api/admin/community/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    await fetchAll();
    setBusy(null);
  };

  const pending = posts.filter((p) => !p.status || p.status === 'pending');
  const approved = posts.filter((p) => p.status === 'approved');
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const filteredPosts = posts
    .filter((p) => {
      if (postFilter === 'pending') return !p.status || p.status === 'pending';
      if (postFilter === 'approved') return p.status === 'approved';
      if (postFilter === 'rejected') return p.status === 'rejected';
      return true;
    })
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.body?.toLowerCase().includes(q) || p.authorName?.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
          Plataforma
        </p>
        <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
          Comunidade Íntima
        </h2>
        <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
          {posts.length} publicações · {users.length} membros · {pendingReports.length} denúncias pendentes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pendentes', value: pending.length, color: 'text-yellow-400', bg: 'bg-yellow-400/8 border-yellow-400/15' },
          { label: 'Aprovadas', value: approved.length, color: 'text-green-400', bg: 'bg-green-400/8 border-green-400/15' },
          { label: 'Membros', value: users.length, color: 'text-blue-400', bg: 'bg-blue-400/8 border-blue-400/15' },
          { label: 'Denúncias', value: pendingReports.length, color: 'text-red-400', bg: 'bg-red-400/8 border-red-400/15' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`font-heading text-2xl font-medium ${s.color}`}>{s.value}</p>
            <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1 w-fit flex-wrap">
        {([
          { id: 'posts', label: 'Publicações', icon: MessageSquare },
          { id: 'users', label: 'Membros', icon: Users },
          { id: 'reports', label: `Denúncias${pendingReports.length > 0 ? ` (${pendingReports.length})` : ''}`, icon: AlertTriangle },
          { id: 'emails', label: 'E-mails', icon: Send },
        ] as { id: Tab; label: string; icon: React.FC<{ size?: number }> }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1 bg-surface border border-white/5 rounded-xl p-1">
              {(['pending', 'approved', 'rejected', 'all'] as PostFilter[]).map((f) => (
                <button key={f} onClick={() => setPostFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    postFilter === f ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
                  }`}>
                  {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Rejeitados'}
                </button>
              ))}
            </div>
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar publicações..."
                className="w-full bg-surface border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-text-muted text-sm">Carregando...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">Nenhuma publicação encontrada.</div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const cat = getCategoryBySlug(post.category);
                const isExpanded = expanded === post.id;
                return (
                  <div key={post.id} className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
                    <div className="flex items-start gap-4 p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {cat && (
                            <span className="text-[10px] text-text-muted border border-white/8 rounded-full px-2 py-0.5">
                              {cat.icon} {cat.label}
                            </span>
                          )}
                          {(!post.status || post.status === 'pending') && (
                            <span className="text-[10px] text-yellow-400 border border-yellow-400/20 rounded-full px-2 py-0.5">Pendente</span>
                          )}
                          {post.status === 'approved' && (
                            <span className="text-[10px] text-green-400 border border-green-400/20 rounded-full px-2 py-0.5">Aprovado</span>
                          )}
                          {post.status === 'rejected' && (
                            <span className="text-[10px] text-red-400 border border-red-400/20 rounded-full px-2 py-0.5">Rejeitado</span>
                          )}
                          {post.featured && (
                            <span className="text-[10px] text-accent border border-accent/20 rounded-full px-2 py-0.5 flex items-center gap-1">
                              <Sparkles size={8} /> Destaque
                            </span>
                          )}
                          {post.pinned && (
                            <span className="text-[10px] text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5 flex items-center gap-1">
                              <Pin size={8} /> Fixado
                            </span>
                          )}
                        </div>
                        <h3 className="text-text-primary text-sm font-medium mb-1 leading-snug">{post.title}</h3>
                        <p className="text-text-muted text-xs mb-1">
                          {post.anonymous ? 'Anônimo' : post.authorName} · {timeAgo(post.createdAt)}
                        </p>
                        <p className={`text-text-secondary text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {post.body}
                        </p>
                        {post.body?.length > 120 && (
                          <button onClick={() => setExpanded(isExpanded ? null : post.id)}
                            className="flex items-center gap-1 text-xs text-text-muted hover:text-accent mt-1 transition-colors">
                            {isExpanded ? 'Menos' : 'Ver completo'}
                            <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {post.status !== 'approved' && (
                          <button onClick={() => patchPost(post.id, { status: 'approved' })} disabled={busy === post.id} title="Aprovar"
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-all disabled:opacity-50">
                            <Check size={13} />
                          </button>
                        )}
                        {post.status !== 'rejected' && (
                          <button onClick={() => patchPost(post.id, { status: 'rejected' })} disabled={busy === post.id} title="Rejeitar"
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-all disabled:opacity-50">
                            <X size={13} />
                          </button>
                        )}
                        {post.status === 'approved' && (
                          <>
                            <button onClick={() => patchPost(post.id, { featured: !post.featured })} disabled={busy === post.id}
                              title={post.featured ? 'Remover destaque' : 'Destacar'}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 ${
                                post.featured ? 'bg-accent/15 text-accent hover:bg-accent/25' : 'bg-white/5 text-text-muted hover:bg-accent/10 hover:text-accent'
                              }`}>
                              <Sparkles size={13} />
                            </button>
                            <button onClick={() => patchPost(post.id, { pinned: !post.pinned })} disabled={busy === post.id}
                              title={post.pinned ? 'Desafixar' : 'Fixar'}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 ${
                                post.pinned ? 'bg-amber-400/15 text-amber-400' : 'bg-white/5 text-text-muted hover:bg-amber-400/10 hover:text-amber-400'
                              }`}>
                              <Pin size={13} />
                            </button>
                            <a href={`/comunidade/${post.id}`} target="_blank" rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-text-muted hover:text-text-primary transition-all">
                              <Eye size={13} />
                            </a>
                          </>
                        )}
                        <button onClick={() => deletePost(post.id)} disabled={busy === post.id} title="Excluir"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/4 text-text-muted hover:bg-red-400/10 hover:text-red-400 transition-all disabled:opacity-50">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted text-sm">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-text-muted text-sm">Nenhum membro ainda.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Membro', 'Papel', 'Publicações', 'Status', ''].map((h, i) => (
                    <th key={i} className={`text-left px-5 py-4 text-text-muted font-medium tracking-widest uppercase text-[10px] ${
                      i >= 2 ? 'hidden md:table-cell' : ''
                    } ${i === 4 ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/2 group transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-text-primary text-sm font-medium">{user.name}</p>
                      {user.bio && <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{user.bio}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => patchUser(user.uid, { role: e.target.value as CommunityUser['role'] })}
                        disabled={busy === user.uid}
                        className="bg-transparent border border-white/8 rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent/30 transition-colors"
                      >
                        <option value="user">Membro</option>
                        <option value="moderator">Moderador</option>
                        <option value="founder">Fundador</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-text-secondary text-sm">{user.postCount}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {user.banned ? (
                        <span className="text-[10px] text-red-400 border border-red-400/20 rounded-full px-2 py-0.5">Banido</span>
                      ) : (
                        <span className="text-[10px] text-green-400 border border-green-400/20 rounded-full px-2 py-0.5">Ativo</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => patchUser(user.uid, { banned: !user.banned })}
                        disabled={busy === user.uid}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50 ${
                          user.banned
                            ? 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                            : 'bg-red-400/10 text-red-400 hover:bg-red-400/20'
                        }`}
                      >
                        {user.banned ? 'Desbanir' : 'Banir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Emails tab */}
      {tab === 'emails' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-surface p-6 space-y-4">
            <div>
              <p className="text-text-muted text-xs mb-1">
                {users.filter((u) => u.email && !u.banned).length} membros com email cadastrado
              </p>
              <h3 className="text-text-primary font-medium text-sm">Enviar comunicado para a Comunidade</h3>
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5">Assunto</label>
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Ex: Novidade na Comunidade Íntima"
                className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5">Mensagem</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={7}
                placeholder="Escreva sua mensagem para a comunidade..."
                className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors resize-none"
              />
            </div>

            {emailResult && (
              <div className="bg-green-400/8 border border-green-400/15 rounded-xl px-4 py-3">
                <p className="text-green-400 text-sm font-medium">
                  Enviado! {emailResult.sent} enviados · {emailResult.failed} falhas · {emailResult.total} total
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={sendEmail}
                disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                <Send size={13} />
                {emailSending ? 'Enviando...' : 'Enviar para membros'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-text-muted text-sm">Carregando...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">Nenhuma denúncia.</div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-white/5 bg-surface p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] border rounded-full px-2 py-0.5 text-text-muted border-white/8">
                      {report.targetType === 'post' ? 'Publicação' : 'Comentário'}
                    </span>
                    {report.status === 'pending' && (
                      <span className="text-[10px] text-yellow-400 border border-yellow-400/20 rounded-full px-2 py-0.5">Pendente</span>
                    )}
                    {report.status === 'reviewed' && (
                      <span className="text-[10px] text-blue-400 border border-blue-400/20 rounded-full px-2 py-0.5">Revisado</span>
                    )}
                    {report.status === 'resolved' && (
                      <span className="text-[10px] text-green-400 border border-green-400/20 rounded-full px-2 py-0.5">Resolvido</span>
                    )}
                    <span className="text-text-muted text-xs">{timeAgo(report.createdAt)}</span>
                  </div>
                  <p className="text-text-primary text-sm">{report.reason}</p>
                  <p className="text-text-muted text-xs mt-1">Target ID: {report.targetId}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {report.status !== 'reviewed' && (
                    <button onClick={() => patchReport(report.id, 'reviewed')} disabled={busy === report.id}
                      className="px-3 py-1.5 rounded-lg text-xs bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-all disabled:opacity-50">
                      Revisado
                    </button>
                  )}
                  {report.status !== 'resolved' && (
                    <button onClick={() => patchReport(report.id, 'resolved')} disabled={busy === report.id}
                      className="px-3 py-1.5 rounded-lg text-xs bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-all disabled:opacity-50">
                      Resolvido
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
