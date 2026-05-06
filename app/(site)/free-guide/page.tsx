'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, X } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const benefits = [
  'Os 7 erros psicológicos que destroem o interesse antes mesmo de começar',
  'Como a teoria do apego explica por que você repete os mesmos padrões',
  'O princípio da escassez emocional, aprenda como aplicá-lo de forma autêntica',
  'Por que "dar tudo de si" afasta quem você quer por perto',
  'O mapa mental para identificar apegos disfuncionais em menos de 24h',
  'Estratégias baseadas em neurociência para criar conexões mais profundas',
  'O exercício diário de 5 minutos que transforma sua inteligência emocional',
];

export default function FreeGuidePage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !contact.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          [method]: contact,
          source: 'free-guide',
        }),
      });
      if (res.ok) {
        setStep('success');
      } else {
        setError('Erro ao enviar. Tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="min-h-screen pt-24 pb-20 px-6 relative flex items-center">
        {/* Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] opacity-6 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)' }} />

        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <AnimateOnScroll direction="left">
              <div>
                <div className="inline-flex items-center gap-2 text-xs text-accent border border-accent/20 rounded-full px-4 py-1.5 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Acesso Gratuito
                </div>
                <h1 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-tight mb-5">
                  7 Erros que Fazem
                  <br />
                  <span style={{ color: '#fe0050' }}>Alguém Perder o Interesse</span>
                </h1>
                <div className="w-12 h-px bg-accent mb-6" />
                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  Um guia psicológico profundo sobre os padrões invisíveis que sabotam
                  relacionamentos. Aprenda a identificá-los em você mesmo.
                </p>

                <div className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={15} className="text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-text-secondary text-sm leading-relaxed">{benefit}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-5 rounded-xl border border-white/5 bg-surface">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">R</div>
                    <div>
                      <p className="text-text-primary text-sm font-medium">Rafael Moreira</p>
                      <p className="text-text-muted text-xs">Especialista em Psicologia das Relações</p>
                    </div>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed italic">
                    &ldquo;Este guia é a síntese do que mais vejo repetido nas pessoas que buscam entender por que seus relacionamentos não funcionam.&rdquo;
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Right - Form */}
            <AnimateOnScroll direction="right">
              <div className="relative rounded-3xl border border-white/5 bg-surface overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                {step === 'form' ? (
                  <div className="p-8">
                    <h2 className="font-heading text-2xl font-medium text-text-primary mb-2">
                      Quero o guia gratuito
                    </h2>
                    <p className="text-text-secondary text-sm mb-7">
                      Preencha abaixo e receba acesso imediato.
                    </p>

                    {/* Toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
                      {(['email', 'whatsapp'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => { setMethod(m); setContact(''); }}
                          className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                            method === m
                              ? 'bg-accent text-white'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {m === 'email' ? 'E-mail' : 'WhatsApp'}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-text-muted text-xs mb-1.5 block tracking-wide">
                          Seu nome
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Como posso te chamar?"
                          className="admin-input"
                        />
                      </div>
                      <div>
                        <label className="text-text-muted text-xs mb-1.5 block tracking-wide">
                          {method === 'email' ? 'Seu e-mail' : 'Seu WhatsApp'}
                        </label>
                        <input
                          type={method === 'email' ? 'email' : 'tel'}
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          placeholder={method === 'email' ? 'seu@email.com' : '+55 (00) 00000-0000'}
                          className="admin-input"
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                          <X size={12} />
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white py-3.5 rounded-xl font-medium text-sm transition-all"
                      >
                        {loading ? 'Enviando...' : (
                          <>
                            Quero o Guia Gratuito
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>

                      <p className="text-text-muted text-xs text-center leading-relaxed">
                        Sem spam. Você pode cancelar a qualquer momento. Seus dados estão seguros.
                      </p>
                    </form>
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6 text-3xl">
                      🎉
                    </div>
                    <h2 className="font-heading text-2xl font-medium text-text-primary mb-3">
                      Acesso confirmado!
                    </h2>
                    <p className="text-text-secondary text-sm leading-relaxed mb-6">
                      O guia será enviado em breve. Enquanto isso, explore nossos artigos.
                    </p>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-accent-hover transition-all"
                    >
                      Ler artigos <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
