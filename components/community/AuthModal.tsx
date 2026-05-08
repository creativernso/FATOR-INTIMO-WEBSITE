'use client';

import { useState } from 'react';
import { X, Loader, Eye, EyeOff } from 'lucide-react';
import { communitySignIn, communitySignUp, getIdToken } from '@/lib/community-auth';
import { useCommunity } from './CommunityProvider';

interface Props {
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function AuthModal({ onClose, defaultMode = 'login' }: Props) {
  const { refreshProfile } = useCommunity();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Informe seu nome.'); setLoading(false); return; }
        await communitySignUp(email, password, name.trim());
        const token = await getIdToken();
        if (token) {
          await fetch('/api/community/users/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: name.trim() }),
          });
        }
      } else {
        await communitySignIn(email, password);
      }
      await refreshProfile();
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Algo deu errado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-white/8 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Top gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-2">
          <div>
            <h2 className="font-heading text-2xl font-light text-text-primary">
              {mode === 'login' ? 'Entrar na Comunidade' : 'Criar conta'}
            </h2>
            <p className="text-text-muted text-sm mt-1">
              {mode === 'login' ? 'Bem-vindo de volta.' : 'Um espaço seguro para você.'}
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-text-muted text-xs mb-1.5">Seu nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como você quer ser chamado?"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-text-muted text-xs mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-text-muted text-xs mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                required
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/8 rounded-xl px-4 py-2.5 border border-red-400/15">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-3.5 rounded-xl font-medium text-sm transition-all"
          >
            {loading ? <Loader size={15} className="animate-spin" /> : (mode === 'login' ? 'Entrar' : 'Criar conta')}
          </button>

          <p className="text-center text-text-muted text-xs">
            {mode === 'login' ? (
              <>Não tem conta?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-accent hover:underline">Criar agora</button>
              </>
            ) : (
              <>Já tem conta?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-accent hover:underline">Entrar</button>
              </>
            )}
          </p>
        </form>

        <p className="text-text-muted text-[11px] text-center px-7 pb-6 leading-relaxed">
          Ao entrar, você concorda com nossos valores de respeito e cuidado emocional.
        </p>
      </div>
    </div>
  );
}
