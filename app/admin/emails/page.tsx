'use client';

import { useState, useEffect } from 'react';
import { Send, Users, Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

type Segment = 'all' | 'email' | 'whatsapp';

const TEMPLATES = [
  {
    label: 'Novo artigo',
    subject: 'Novo artigo no Fator Íntimo',
    body: 'Olá!\n\nPublicamos um novo artigo que pode transformar a forma como você entende seus relacionamentos.\n\nAcesse agora em fatorintimo.com/blog\n\nCom carinho,\nFator Íntimo',
  },
  {
    label: 'Novo produto',
    subject: 'Novo ebook disponível',
    body: 'Olá!\n\nTemos uma novidade especial para você.\n\nNosso novo material está disponível com condições exclusivas para quem já faz parte da nossa comunidade.\n\nAcesse: fatorintimo.com/products\n\nFator Íntimo',
  },
  {
    label: 'Newsletter',
    subject: 'Insights da semana — Fator Íntimo',
    body: 'Olá!\n\nAqui estão os principais insights desta semana sobre psicologia das relações.\n\n[Escreva o conteúdo aqui]\n\nFator Íntimo',
  },
];

export default function AdminEmails() {
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [emailCount, setEmailCount] = useState<number | null>(null);
  const [segment, setSegment] = useState<Segment>('all');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((leads: { email?: string }[]) => {
        setLeadCount(leads.length);
        setEmailCount(leads.filter((l) => !!l.email).length);
      });
  }, []);

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    setResult(null);
    setError('');
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Preencha o assunto e o corpo do e-mail.');
      return;
    }
    setSending(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, segment }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erro ao enviar.');
      }
    } catch {
      setError('Erro de conexão.');
    } finally {
      setSending(false);
    }
  };

  const segmentLabel = segment === 'all' ? 'Todos com e-mail' : segment === 'email' ? 'Somente e-mail' : 'Somente WhatsApp';

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
          Marketing
        </p>
        <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
          Enviar E-mail
        </h2>
        <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
          Envie campanhas diretamente para seus leads.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <Users size={14} className="text-accent mb-3" />
          <p className="font-body font-semibold text-accent" style={{ fontSize: fs('1.6rem', '2.2vw', '2rem') }}>
            {leadCount ?? '—'}
          </p>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.68rem', '0.78vw', '0.74rem') }}>Total de leads</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <Mail size={14} className="text-blue-400 mb-3" />
          <p className="font-body font-semibold text-blue-400" style={{ fontSize: fs('1.6rem', '2.2vw', '2rem') }}>
            {emailCount ?? '—'}
          </p>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.68rem', '0.78vw', '0.74rem') }}>Com e-mail cadastrado</p>
        </div>
      </div>

      {/* Templates */}
      <div className="rounded-2xl border border-white/8 bg-surface p-6">
        <h3 className="text-text-primary font-medium mb-4" style={{ fontSize: fs('0.9rem', '1vw', '0.95rem') }}>
          Templates rápidos
        </h3>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              onClick={() => applyTemplate(tpl)}
              className="px-3.5 py-2 rounded-xl text-xs border border-white/8 text-text-muted hover:text-text-primary hover:border-white/20 transition-all"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="rounded-2xl border border-white/8 bg-surface p-6 space-y-5">
        <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.9rem', '1vw', '0.95rem') }}>
          Composição
        </h3>

        {/* Segment */}
        <div>
          <label className="block text-text-muted text-xs mb-2 tracking-wide">Destinatários</label>
          <div className="flex rounded-xl overflow-hidden border border-white/8 w-fit">
            {([
              { val: 'all', label: 'Todos com e-mail' },
              { val: 'email', label: 'Só e-mail' },
            ] as { val: Segment; label: string }[]).map((s) => (
              <button
                key={s.val}
                onClick={() => setSegment(s.val)}
                className={`px-4 py-2.5 text-xs font-medium transition-all ${
                  segment === s.val ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-text-muted mt-2" style={{ fontSize: '0.7rem' }}>
            Segmento: <strong className="text-text-secondary">{segmentLabel}</strong>
            {emailCount !== null && ` · ${emailCount} destinatários potenciais`}
          </p>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-text-muted text-xs mb-1.5 tracking-wide">Assunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Nova publicação no Fator Íntimo"
            className="admin-input"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-text-muted text-xs mb-1.5 tracking-wide">Corpo do e-mail</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva sua mensagem aqui..."
            rows={10}
            className="admin-input resize-none font-mono text-sm"
          />
          <p className="text-text-muted mt-1.5" style={{ fontSize: '0.68rem' }}>
            Dica: o nome do destinatário será inserido automaticamente no início.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2.5 border border-red-400/20">
            <AlertCircle size={12} />
            {error}
          </div>
        )}

        {result && (
          <div className="flex items-start gap-3 text-sm bg-green-400/8 border border-green-400/20 rounded-xl px-4 py-3.5">
            <CheckCircle size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-medium">Campanha enviada!</p>
              <p className="text-text-muted mt-0.5" style={{ fontSize: '0.75rem' }}>
                {result.sent} enviados · {result.failed} falhas · {result.total} destinatários
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          className="w-full flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-3.5 rounded-xl font-medium text-sm transition-all"
        >
          {sending ? (
            <><Loader size={14} className="animate-spin" /> Enviando...</>
          ) : (
            <><Send size={14} /> Enviar Campanha</>
          )}
        </button>
      </div>
    </div>
  );
}
