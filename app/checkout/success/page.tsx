import { stripe } from '@/lib/stripe';
import { getProducts } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Download, Instagram, ArrowRight, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id || !stripe) return <FallbackPage />;

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    return <FallbackPage />;
  }

  if (session.payment_status !== 'paid') return <PendingPage />;

  const productId = session.metadata?.productId;
  const product = productId ? getProducts().find((p) => p.id === productId) : null;
  const firstName = session.customer_details?.name?.split(' ')[0] || '';
  const email = session.customer_details?.email || '';
  const downloadHref = `/api/download?session_id=${session_id}&redirect=1`;

  return (
    <div className="min-h-screen bg-black flex flex-col" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#fe0050] to-transparent" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="text-[11px] tracking-[4px] uppercase text-[#fe0050] font-medium">
          Fator Íntimo
        </Link>
        <Link href="/products" className="text-xs text-[#555] hover:text-[#999] transition-colors">
          Ver outros produtos
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-2xl mx-auto text-center space-y-10">

          {/* Success icon */}
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(254,0,80,0.15) 0%, transparent 70%)',
                border: '1px solid rgba(254,0,80,0.3)',
                boxShadow: '0 0 40px rgba(254,0,80,0.15)',
              }}
            >
              <Check size={32} strokeWidth={1.5} className="text-[#fe0050]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <p className="text-xs tracking-[4px] uppercase text-[#fe0050]">Compra confirmada</p>
            <h1
              className="text-[#f5f0eb] font-light leading-tight"
              style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', letterSpacing: '-0.03em' }}
            >
              Seja bem-vindo<br />ao outro lado.
            </h1>
            <p className="text-[#6b6055]" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
              {firstName ? `Seu acesso chegou, ${firstName}.` : 'Seu acesso chegou.'}
              {product && (
                <span className="block mt-1 text-[#9a8f85]">
                  <span className="text-[#f5f0eb]">{product.title}</span> está pronto para transformar sua forma de se relacionar.
                </span>
              )}
            </p>
          </div>

          {/* Download button */}
          <div className="space-y-4">
            <a
              href={downloadHref}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-white font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #fe0050 0%, #c4003d 100%)',
                boxShadow: '0 8px 40px rgba(254,0,80,0.35)',
                fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              }}
            >
              <Download size={18} strokeWidth={1.5} />
              Baixar agora
              <ArrowRight size={16} strokeWidth={1.5} />
            </a>

            {email && (
              <p className="text-[#4a4540] text-xs tracking-wide">
                O link também foi enviado para{' '}
                <span className="text-[#6b6055]">{email}</span>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

          {/* Product summary */}
          {product && (
            <div className="flex flex-col sm:flex-row items-center gap-8 text-left">
              {product.coverImage && (
                <div className="flex-shrink-0 w-28 h-36 rounded-xl overflow-hidden border border-white/8" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                  <Image
                    src={product.coverImage}
                    alt={product.title}
                    width={112}
                    height={144}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] tracking-[3px] uppercase text-[#fe0050] mb-1">O que você desbloqueou</p>
                  <p className="text-[#f5f0eb] font-medium text-lg">{product.title}</p>
                  <p className="text-[#6b6055] text-sm mt-1">{product.hook}</p>
                </div>
                {product.benefits && product.benefits.length > 0 && (
                  <ul className="space-y-2">
                    {product.benefits.slice(0, 4).map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#9a8f85]">
                        <Check size={13} className="text-[#fe0050] flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

          {/* Social */}
          <div className="space-y-4">
            <p className="text-[#555] text-sm">
              Siga o Fator Íntimo para conteúdo sobre psicologia, atração e relações
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://instagram.com/fatorintimo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-[#9a8f85] hover:border-white/20 hover:text-[#f5f0eb] transition-all text-sm"
              >
                <Instagram size={15} />
                @fatorintimo
              </a>
            </div>
          </div>

          {/* Guarantee */}
          <div className="flex items-center justify-center gap-2 text-[#3a3530]">
            <Shield size={13} />
            <p className="text-xs tracking-wide">Garantia de 7 dias. Sem perguntas.</p>
          </div>
        </div>
      </main>

      {/* Bottom line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <footer className="py-6 text-center">
        <p className="text-[#2a2520] text-xs">© Fator Íntimo · fatorintimo.com</p>
      </footer>
    </div>
  );
}

function FallbackPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="h-px w-full absolute top-0 bg-gradient-to-r from-transparent via-[#fe0050] to-transparent" />
      <p className="text-[11px] tracking-[4px] uppercase text-[#fe0050] mb-8">Fator Íntimo</p>
      <h1 className="text-[#f5f0eb] text-3xl font-light mb-4" style={{ letterSpacing: '-0.02em' }}>
        Acesso confirmado.
      </h1>
      <p className="text-[#6b6055] text-sm mb-8 max-w-sm">
        Seu ebook foi enviado por email. Se não encontrar, verifique a pasta de spam ou entre em contato.
      </p>
      <Link
        href="/"
        className="text-xs tracking-widest uppercase text-[#fe0050] hover:opacity-70 transition-opacity"
      >
        Voltar ao início →
      </Link>
    </div>
  );
}

function PendingPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="h-px w-full absolute top-0 bg-gradient-to-r from-transparent via-[#fe0050] to-transparent" />
      <p className="text-[11px] tracking-[4px] uppercase text-[#fe0050] mb-8">Fator Íntimo</p>
      <h1 className="text-[#f5f0eb] text-3xl font-light mb-4" style={{ letterSpacing: '-0.02em' }}>
        Processando pagamento…
      </h1>
      <p className="text-[#6b6055] text-sm mb-8 max-w-sm">
        Seu pagamento está sendo processado. Você receberá o ebook por email assim que confirmado.
      </p>
      <Link href="/" className="text-xs tracking-widest uppercase text-[#fe0050] hover:opacity-70 transition-opacity">
        Voltar ao início →
      </Link>
    </div>
  );
}
