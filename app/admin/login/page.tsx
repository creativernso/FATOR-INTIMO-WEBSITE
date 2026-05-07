'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  AuthError,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Eye, EyeOff, Lock, ArrowLeft, Mail } from 'lucide-react';

type Mode = 'login' | 'reset';

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Credenciais inválidas';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    case 'auth/user-disabled':
      return 'Conta desativada. Contacte o administrador';
    default:
      return 'Credenciais inválidas';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Erro ao criar sessão. Tente novamente.');
      }
    } catch (err) {
      const code = (err as AuthError).code ?? '';
      setError(getErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err) {
      const code = (err as AuthError).code ?? '';
      if (code === 'auth/user-not-found') {
        setResetSent(true); // Don't reveal if email exists
      } else {
        setResetError('Erro ao enviar. Tente novamente.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glow */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-white/10 mb-5 overflow-hidden">
            <Image src="/FAV.png" alt="Fator Íntimo" width={32} height={32} className="object-contain" />
          </div>
          <h1 className="font-body text-2xl font-medium text-text-primary">Fator Íntimo</h1>
          <p className="text-text-muted text-xs mt-1 tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-white/8 bg-surface overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <div className="p-8">
              <div className="flex items-center gap-2 mb-7">
                <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Lock size={11} className="text-accent" />
                </div>
                <span className="text-text-secondary text-sm">Acesso restrito</span>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block tracking-wide">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@exemplo.com"
                    required
                    autoComplete="email"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-xs mb-1.5 block tracking-wide">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="admin-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-3 rounded-xl font-medium text-sm transition-all"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('reset'); setResetEmail(email); setError(''); }}
                  className="w-full text-center text-text-muted text-xs hover:text-text-secondary transition-colors pt-1"
                >
                  Esqueceu sua senha?
                </button>
              </form>
            </div>
          )}

          {/* ── PASSWORD RESET ── */}
          {mode === 'reset' && (
            <div className="p-8">
              <button
                onClick={() => { setMode('login'); setResetSent(false); setResetError(''); }}
                className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-xs transition-colors mb-7"
              >
                <ArrowLeft size={12} /> Voltar ao login
              </button>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Mail size={18} className="text-accent" />
                  </div>
                  <p className="text-text-primary text-sm font-medium mb-2">Email enviado</p>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Verifique seu email para redefinir sua senha.
                  </p>
                  <button
                    onClick={() => { setMode('login'); setResetSent(false); }}
                    className="mt-6 text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    Voltar ao login →
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-7">
                    <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Lock size={11} className="text-accent" />
                    </div>
                    <span className="text-text-secondary text-sm">Redefinir senha</span>
                  </div>

                  <p className="text-text-muted text-xs mb-5 leading-relaxed">
                    Digite seu email e enviaremos um link para redefinir sua senha.
                  </p>

                  <form onSubmit={handleReset} className="space-y-4">
                    <div>
                      <label className="text-text-muted text-xs mb-1.5 block tracking-wide">E-mail</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="admin@exemplo.com"
                        required
                        className="admin-input"
                      />
                    </div>

                    {resetError && (
                      <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
                        {resetError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-3 rounded-xl font-medium text-sm transition-all"
                    >
                      {resetLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          © {new Date().getFullYear()} Fator Íntimo
        </p>
      </div>
    </div>
  );
}
