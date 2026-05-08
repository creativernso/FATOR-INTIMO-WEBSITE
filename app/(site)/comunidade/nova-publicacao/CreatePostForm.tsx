'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader, EyeOff, CheckCircle, LogIn } from 'lucide-react';
import { useCommunity } from '@/components/community/CommunityProvider';
import AuthModal from '@/components/community/AuthModal';
import { authedFetch } from '@/lib/community-auth';
import { COMMUNITY_CATEGORIES } from '@/lib/community';

export default function CreatePostForm() {
  const router = useRouter();
  const { profile, loading } = useCommunity();
  const [showAuth, setShowAuth] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) { setShowAuth(true); return; }
    if (!title.trim() || !body.trim() || !category) {
      setError('Preencha o título, o conteúdo e escolha uma categoria.');
      return;
    }
    setSending(true);
    setError('');

    try {
      const res = await authedFetch('/api/community/posts', {
        method: 'POST',
        body: JSON.stringify({ title, body, category, anonymous }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.error ?? 'Erro ao publicar.');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-6 pb-28 h-64 flex items-center justify-center"><Loader size={20} className="animate-spin text-text-muted" /></div>;

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 pb-28">
        <div className="rounded-2xl border border-white/5 bg-surface p-12 text-center">
          <p className="text-5xl mb-6 opacity-30">◎</p>
          <h2 className="font-heading text-2xl font-light text-text-primary mb-3">
            Entre na comunidade
          </h2>
          <p className="text-text-muted text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Para publicar uma discussão, você precisa de uma conta. É rápido e gratuito.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all"
          >
            <LogIn size={14} /> Entrar / Criar conta
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto px-6 pb-28 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="font-heading text-3xl font-light text-text-primary mb-3">Publicação enviada.</h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Sua publicação será revisada e aparecerá na comunidade assim que aprovada. Obrigado por compartilhar.
        </p>
        <button
          onClick={() => router.push('/comunidade')}
          className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-6 py-3 rounded-full text-sm transition-all"
        >
          Voltar à comunidade
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-7 px-6 pb-28">

      {/* Anonymous toggle */}
      <div
        onClick={() => setAnonymous((v) => !v)}
        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all select-none ${
          anonymous ? 'bg-accent/8 border-accent/25 text-accent' : 'border-white/8 hover:border-white/15 text-text-muted'
        }`}
      >
        <div className="flex items-center gap-3">
          <EyeOff size={15} />
          <div>
            <p className="text-sm font-medium" style={{ color: anonymous ? 'inherit' : 'var(--color-text-primary)' }}>
              Publicar anonimamente
            </p>
            <p className="text-xs opacity-70 mt-0.5">
              {anonymous ? 'Sua identidade não será exibida.' : 'Sua identidade ficará visível.'}
            </p>
          </div>
        </div>
        <div className={`w-10 h-5 rounded-full transition-colors relative ${anonymous ? 'bg-accent' : 'bg-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-text-muted text-xs mb-2">Título da discussão *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Uma frase que capture sua história ou pergunta..."
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3.5 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-text-muted text-xs mb-3">Espaço de conversa *</label>
        <div className="flex flex-wrap gap-2">
          {COMMUNITY_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setCategory(cat.slug === category ? '' : cat.slug)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs border transition-all ${
                category === cat.slug
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'border-white/8 text-text-muted hover:border-white/20'
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div>
        <label className="block text-text-muted text-xs mb-2">Sua história / reflexão *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          required
          placeholder="Escreva com autenticidade. Não precisa ser perfeito. Só precisa ser real."
          className="w-full bg-white/4 border border-white/8 rounded-2xl px-5 py-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors resize-none leading-relaxed"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3 border border-red-400/20">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending || !title.trim() || !body.trim() || !category}
        className="w-full flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-4 rounded-2xl font-medium text-sm transition-all"
      >
        {sending ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
        {sending ? 'Enviando...' : 'Publicar na comunidade'}
      </button>

      <p className="text-text-muted text-xs text-center leading-relaxed">
        Sua publicação será revisada antes de aparecer. Respeitamos sua privacidade e segurança emocional.
      </p>
    </form>
  );
}
