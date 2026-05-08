'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader } from 'lucide-react';
import { Comment } from '@/lib/types';

interface Props {
  slug: string;
}

export default function CommentsSection({ slug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/posts/${slug}/comments`)
      .then((r) => r.json())
      .then(setComments);
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        setName('');
        setEmail('');
        setContent('');
      } else {
        setError(data.error || 'Erro ao enviar comentário.');
      }
    } catch {
      setError('Erro de conexão.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="comments" className="mt-14">
      <h3 className="font-heading text-2xl font-light text-text-primary mb-8 flex items-center gap-3">
        <MessageCircle size={20} className="text-accent" />
        Comentários
        {comments.length > 0 && (
          <span className="text-sm font-sans font-normal text-text-muted">({comments.length})</span>
        )}
      </h3>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-5 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0 text-accent font-semibold uppercase text-xs">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-text-primary text-sm font-medium">{c.name}</span>
                  <span className="text-text-muted text-xs">
                    {new Date(c.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-sm mb-8">Ainda não há comentários. Seja o primeiro!</p>
      )}

      {/* Form */}
      {sent ? (
        <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-6 text-center">
          <p className="text-green-400 font-medium text-sm mb-1">Comentário enviado!</p>
          <p className="text-text-muted text-xs">Será publicado após aprovação.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/8 bg-surface p-6 space-y-4">
          <h4 className="text-text-primary text-sm font-medium">Deixe seu comentário</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-xs mb-1.5">Nome *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1.5">E-mail (opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1.5">Comentário *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              placeholder="Escreva seu comentário..."
              className="w-full bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex items-center justify-between">
            <p className="text-text-muted text-xs">Comentários são revisados antes de publicar.</p>
            <button
              type="submit"
              disabled={sending || !name.trim() || !content.trim()}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              {sending ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
              Enviar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
