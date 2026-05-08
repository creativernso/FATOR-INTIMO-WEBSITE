'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Send, EyeOff, AlertTriangle, Loader } from 'lucide-react';
import { useCommunity } from '@/components/community/CommunityProvider';
import AuthModal from '@/components/community/AuthModal';
import { authedFetch, getIdToken } from '@/lib/community-auth';
import { CommunityComment } from '@/lib/types';

interface Props {
  postId: string;
  initialReactions: number;
}

export default function PostInteractions({ postId, initialReactions }: Props) {
  const { profile, firebaseUser } = useCommunity();
  const [reactions, setReactions] = useState(initialReactions);
  const [reacted, setReacted] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetch(`/api/community/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .finally(() => setLoadingComments(false));
  }, [postId]);

  const handleReact = async () => {
    if (!firebaseUser) { setShowAuth(true); return; }
    const prev = reactions;
    const wasReacted = reacted;
    setReacted(!wasReacted);
    setReactions((r) => r + (wasReacted ? -1 : 1));
    try {
      const res = await authedFetch(`/api/community/posts/${postId}/react`, { method: 'POST' });
      const data = await res.json();
      setReactions(data.reactionCount);
      setReacted(data.action === 'added');
    } catch {
      setReacted(wasReacted);
      setReactions(prev);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) { setShowAuth(true); return; }
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await authedFetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: comment.trim(), anonymous }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setComment('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (targetId: string) => {
    if (!reportReason.trim()) return;
    const token = await getIdToken();
    await fetch('/api/community/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ targetId, targetType: 'comment', reason: reportReason }),
    });
    setReportTarget(null);
    setReportReason('');
  };

  function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }

  return (
    <section className="px-6 pb-28">
      <div className="max-w-3xl mx-auto">
        {/* Reaction bar */}
        <div className="flex items-center gap-4 py-6 border-y border-white/5 mb-10">
          <button
            onClick={handleReact}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
              reacted
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'border-white/8 text-text-muted hover:border-accent/20 hover:text-accent'
            }`}
          >
            <Heart size={14} className={reacted ? 'fill-accent' : ''} />
            {reactions > 0 ? reactions : 'Apoiar'}
          </button>
          <span className="text-text-muted text-sm">{comments.length} {comments.length === 1 ? 'resposta' : 'respostas'}</span>
        </div>

        {/* Comments */}
        <div className="mb-10">
          <p className="text-xs text-text-muted tracking-widest uppercase mb-6">Respostas</p>

          {loadingComments ? (
            <div className="flex items-center gap-2 text-text-muted text-sm py-8">
              <Loader size={14} className="animate-spin" /> Carregando...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">
              Seja o primeiro a responder a esta discussão.
            </p>
          ) : (
            <div className="space-y-6">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    c.authorRole === 'founder' ? 'bg-accent/15 border border-accent/30' : 'bg-white/5 border border-white/10'
                  }`}>
                    {c.authorAvatar && !c.anonymous ? (
                      <Image src={c.authorAvatar} alt={c.authorName} width={32} height={32} className="rounded-full object-cover w-full h-full" />
                    ) : (
                      <span className={`text-xs font-heading ${c.authorRole === 'founder' ? 'text-accent' : 'text-text-muted'}`}>
                        {c.anonymous ? '?' : c.authorName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-sm font-medium ${c.authorRole === 'founder' ? 'text-accent' : 'text-text-primary'}`}>
                        {c.authorName}
                      </span>
                      {c.authorRole === 'founder' && (
                        <span className="text-[10px] text-accent border border-accent/20 rounded-full px-1.5 py-0.5">Fundador</span>
                      )}
                      <span className="text-text-muted text-xs">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">{c.content}</p>
                    <button
                      onClick={() => setReportTarget(c.id)}
                      className="mt-2 flex items-center gap-1 text-[11px] text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <AlertTriangle size={10} /> Denunciar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment form */}
        <div className="border-t border-white/5 pt-8">
          <p className="text-xs text-text-muted tracking-widest uppercase mb-5">Deixar uma resposta</p>

          {!firebaseUser ? (
            <div className="text-center py-10 rounded-2xl border border-white/5 bg-surface">
              <p className="text-text-muted text-sm mb-4">Entre na comunidade para responder esta discussão.</p>
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full text-sm font-medium transition-all"
              >
                Entrar / Criar conta
              </button>
            </div>
          ) : (
            <form onSubmit={handleComment} className="space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Compartilhe sua perspectiva com cuidado..."
                className="w-full bg-white/4 border border-white/8 rounded-2xl px-5 py-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-text-muted text-sm">
                  <div
                    onClick={() => setAnonymous((v) => !v)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${anonymous ? 'bg-accent' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${anonymous ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="flex items-center gap-1">
                    <EyeOff size={12} /> Anônimo
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                >
                  {submitting ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
                  Responder
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Report modal */}
      {reportTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div className="bg-surface border border-white/8 rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-text-primary font-medium mb-1">Denunciar conteúdo</h3>
            <p className="text-text-muted text-xs mb-4">Ajude a manter a comunidade segura.</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              placeholder="Descreva o motivo da denúncia..."
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30 transition-colors resize-none mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setReportTarget(null)} className="flex-1 text-text-muted text-sm py-2.5 rounded-xl border border-white/8 hover:border-white/15 transition-all">Cancelar</button>
              <button onClick={() => handleReport(reportTarget)} className="flex-1 bg-accent hover:bg-accent-hover text-white text-sm py-2.5 rounded-xl transition-all">Enviar</button>
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </section>
  );
}
