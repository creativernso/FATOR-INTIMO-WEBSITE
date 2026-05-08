'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Trash2, RefreshCw, MessageCircle, Clock } from 'lucide-react';
import { Comment } from '@/lib/types';

const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  const fetchComments = async () => {
    setLoading(true);
    const data = await fetch('/api/admin/comments').then((r) => r.json());
    setComments(data);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, []);

  const approve = async (id: string) => {
    await fetch('/api/admin/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: true }),
    });
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, approved: true } : c));
  };

  const remove = async (id: string) => {
    if (!confirm('Remover este comentário?')) return;
    await fetch('/api/admin/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = comments.filter((c) =>
    filter === 'all' ? true : filter === 'pending' ? !c.approved : c.approved
  );

  const pendingCount = comments.filter((c) => !c.approved).length;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Blog
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Comentários
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {pendingCount > 0 ? `${pendingCount} aguardando aprovação` : 'Nenhum comentário pendente'}
          </p>
        </div>
        <button
          onClick={fetchComments}
          className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-muted hover:text-text-primary px-3.5 py-2.5 rounded-xl text-sm transition-all"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-xl overflow-hidden border border-white/8 w-fit">
        {([
          { val: 'pending', label: `Pendentes${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { val: 'approved', label: 'Aprovados' },
          { val: 'all', label: 'Todos' },
        ] as { val: typeof filter; label: string }[]).map((f) => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val)}
            className={`px-4 py-2.5 text-xs font-medium transition-all ${
              filter === f.val ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-text-muted" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <MessageCircle size={20} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-muted" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>
              Nenhum comentário {filter === 'pending' ? 'pendente' : filter === 'approved' ? 'aprovado' : ''}.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {filtered.map((c) => (
              <div key={c.id} className="p-5 lg:p-6 hover:bg-white/2 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0 text-accent font-semibold uppercase text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-text-primary text-sm font-medium">{c.name}</span>
                        {c.email && <span className="text-text-muted text-xs">{c.email}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          c.approved
                            ? 'border-green-400/20 text-green-400 bg-green-400/8'
                            : 'border-yellow-400/20 text-yellow-400 bg-yellow-400/8'
                        }`}>
                          {c.approved ? 'Aprovado' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm leading-relaxed mb-2">{c.content}</p>
                      <div className="flex items-center gap-3 text-text-muted" style={{ fontSize: '0.7rem' }}>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(c.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>Artigo: <span className="text-text-muted">{c.postSlug}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!c.approved && (
                      <button
                        onClick={() => approve(c.id)}
                        className="p-2 rounded-lg text-text-muted hover:text-green-400 hover:bg-green-400/10 transition-all"
                        title="Aprovar"
                      >
                        <CheckCircle size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => remove(c.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Remover"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
