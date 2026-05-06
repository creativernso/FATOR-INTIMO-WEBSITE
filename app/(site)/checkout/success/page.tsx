import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, ArrowRight, Mail } from 'lucide-react';
import { stripe } from '@/lib/stripe';
import { getProducts } from '@/lib/db';

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
  const downloadUrl = session.metadata?.downloadUrl;
  const product = productId ? getProducts().find((p) => p.id === productId) : null;
  const email = session.customer_details?.email ?? '';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-28">
      <div className="max-w-lg w-full">

        {/* Success card */}
        <div className="relative rounded-2xl border border-white/8 bg-surface p-10 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />

          <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={30} className="text-green-400" />
          </div>

          <h1 className="font-heading text-3xl font-medium text-text-primary mb-2">
            Compra confirmada!
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-1">
            {product ? `${product.title} foi adquirido com sucesso.` : 'Seu pedido foi confirmado.'}
          </p>
          {email && (
            <p className="text-text-muted text-xs mb-8">
              Confirmação enviada para <span className="text-text-secondary">{email}</span>
            </p>
          )}

          {/* Download button */}
          {downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent-hover text-white font-medium py-4 px-8 rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 text-base mb-4"
            >
              <Download size={18} />
              Baixar agora
            </a>
          ) : (
            <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-4 text-left">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-text-primary text-sm font-medium mb-1">Acesso enviado por email</p>
                  <p className="text-text-muted text-xs leading-relaxed">
                    O link de download será enviado para o seu email em alguns minutos. Verifique também a pasta de spam.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Ver outros produtos <ArrowRight size={13} />
          </Link>
        </div>

        {/* Guarantee reminder */}
        <p className="text-center text-text-muted text-xs mt-6">
          Lembre-se: você tem <span className="text-text-secondary">7 dias de garantia</span> incondicional.
        </p>
      </div>
    </div>
  );
}
