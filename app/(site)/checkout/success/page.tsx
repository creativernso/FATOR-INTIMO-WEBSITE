import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, Instagram, Youtube, ArrowRight } from 'lucide-react';
import { stripe } from '@/lib/stripe';
import { getProducts } from '@/lib/db';
import DownloadButton from './DownloadButton';

export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id || !stripe) redirect('/products');

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    redirect('/products');
  }

  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    redirect('/products');
  }

  const productId = session.metadata?.productId;
  const product = productId ? getProducts().find((p) => p.id === productId) : null;
  const email = session.customer_details?.email ?? '';
  const name = session.customer_details?.name ?? '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-28">
      <div className="w-full max-w-lg">

        {/* Success card */}
        <div className="relative rounded-2xl border border-white/8 bg-surface overflow-hidden mb-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />

          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={28} className="text-green-400" />
            </div>

            <span className="text-xs text-accent tracking-widest uppercase mb-3 block">Compra confirmada</span>
            <h1 className="font-body text-3xl font-medium text-text-primary mb-2">
              Bem-vindo ao próximo nível.
            </h1>
            {product && (
              <p className="text-text-secondary text-sm mb-1">
                <span className="text-text-primary font-medium">{product.title}</span> foi adquirido.
              </p>
            )}
            {email && (
              <p className="text-text-muted text-xs mt-1">
                Confirmação enviada para <span className="text-text-secondary">{email}</span>
              </p>
            )}
          </div>

          {/* Download section */}
          <div className="border-t border-white/5 p-8">
            <DownloadButton sessionId={session_id} />
          </div>

          {/* Email notice */}
          <div className="border-t border-white/5 px-8 py-5">
            <div className="flex items-start gap-3">
              <Mail size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-text-muted text-xs leading-relaxed">
                {name ? `${name}, um` : 'Um'} email de confirmação foi enviado para <span className="text-text-secondary">{email || 'o seu email'}</span> com o link de download. Verifique também o spam.
              </p>
            </div>
          </div>
        </div>

        {/* Social follow card */}
        <div className="rounded-2xl border border-white/5 bg-surface p-7 mb-5">
          <p className="text-text-primary text-sm font-medium mb-1">Continue a jornada</p>
          <p className="text-text-muted text-xs mb-5">
            Acompanhe o Fator Íntimo para conteúdo diário sobre psicologia e relações.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://www.instagram.com/fatorintimo/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-pink-500/20 hover:bg-pink-500/10 text-pink-400 px-5 py-2.5 rounded-full text-sm transition-all"
            >
              <Instagram size={14} /> @fatorintimo
            </a>
            <a
              href="https://www.youtube.com/@fatorintimo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 px-5 py-2.5 rounded-full text-sm transition-all"
            >
              <Youtube size={14} /> YouTube
            </a>
          </div>
        </div>

        {/* Guarantee + navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs">
            🛡️ Garantia incondicional de <span className="text-text-secondary">7 dias</span>
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
          >
            Ver outros produtos <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
