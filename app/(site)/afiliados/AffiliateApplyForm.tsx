'use client';

import { useState } from 'react';
import { Send, Loader, CheckCircle } from 'lucide-react';

export default function AffiliateApplyForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Preencha nome e email.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          socialHandle: socialHandle.trim(),
          pixKey: pixKey.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.error || 'Erro ao enviar.');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="font-heading text-3xl font-light text-text-primary mb-3">
          Solicitação recebida.
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
          Vamos revisar seu cadastro e te avisar por email assim que for aprovado, com seu link de afiliado e acesso ao seu painel de resultados.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5 px-6 pb-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-muted text-xs mb-1.5">Nome *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome"
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1.5">Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-text-muted text-xs mb-1.5">Instagram / YouTube / TikTok (opcional)</label>
        <input type="text" value={socialHandle} onChange={(e) => setSocialHandle(e.target.value)} placeholder="@seuperfil"
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
      </div>

      <div>
        <label className="block text-text-muted text-xs mb-1.5">Chave PIX para receber comissões (opcional)</label>
        <input type="text" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="CPF, email ou celular"
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
        <p className="text-text-muted text-[11px] mt-1">Pode preencher depois, na sua página de afiliado.</p>
      </div>

      <div>
        <label className="block text-text-muted text-xs mb-1.5">Como você pretende divulgar? (opcional)</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
          placeholder="Ex: público no Instagram sobre relacionamentos, canal no YouTube, comunidade no WhatsApp..."
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors resize-none leading-relaxed" />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3 border border-red-400/20">{error}</p>
      )}

      <button type="submit" disabled={sending || !name.trim() || !email.trim()}
        className="w-full flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-4 rounded-2xl font-medium text-sm transition-all">
        {sending ? (
          <><Loader size={15} className="animate-spin" /> Enviando...</>
        ) : (
          <><Send size={15} /> Quero ser afiliado</>
        )}
      </button>
    </form>
  );
}
