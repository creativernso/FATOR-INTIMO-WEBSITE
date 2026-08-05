'use client';

import { useState } from 'react';
import { MailX, CheckCircle, Loader } from 'lucide-react';

export default function UnsubscribeForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={24} className="text-green-400" />
        </div>
        <h1 className="font-body text-2xl font-medium text-text-primary mb-2">Inscrição cancelada</h1>
        <p className="text-text-secondary text-sm">
          Você não receberá mais emails de novidades e automações do Fator Íntimo em{' '}
          <span className="text-text-primary">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
        <MailX size={22} className="text-accent" />
      </div>
      <h1 className="font-body text-2xl font-medium text-text-primary mb-2">Cancelar inscrição</h1>
      <p className="text-text-secondary text-sm mb-6">
        Confirme abaixo para parar de receber emails de novidades e automações do Fator Íntimo.
      </p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/30 transition-colors mb-3"
      />

      {status === 'error' && (
        <p className="text-red-400 text-xs mb-3">Não foi possível processar. Verifique o email e tente novamente.</p>
      )}

      <button
        onClick={handleUnsubscribe}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all"
      >
        {status === 'loading' ? <Loader size={14} className="animate-spin" /> : <MailX size={14} />}
        Cancelar inscrição
      </button>
    </div>
  );
}
