import type { Metadata } from 'next';
import { MousePointerClick, ShoppingBag, Wallet, Clock } from 'lucide-react';
import { getAffiliateByToken, getReferralsByAffiliate } from '@/lib/affiliates';
import CopyReferralLink from './CopyReferralLink';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Painel do Afiliado',
  description: 'Acompanhe seus cliques, vendas e comissões.',
  robots: { index: false, follow: false, nocache: true },
};

function money(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function AffiliateDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const affiliate = await getAffiliateByToken(token);

  if (!affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-28 text-center">
        <div>
          <h1 className="font-heading text-3xl font-light text-text-primary mb-3">Painel não encontrado.</h1>
          <p className="text-text-muted text-sm">Verifique se o link que você acessou está correto.</p>
        </div>
      </div>
    );
  }

  if (affiliate.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-28 text-center">
        <div className="max-w-md">
          <div className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
            <Clock size={24} className="text-yellow-400" />
          </div>
          <h1 className="font-heading text-3xl font-light text-text-primary mb-3">
            {affiliate.status === 'pending' ? 'Solicitação em análise.' : 'Solicitação não aprovada.'}
          </h1>
          <p className="text-text-muted text-sm leading-relaxed">
            {affiliate.status === 'pending'
              ? 'Olá, ' + affiliate.name + '. Sua solicitação para o programa de afiliados ainda está sendo revisada. Você receberá um email assim que for aprovada.'
              : 'Sua solicitação para o programa de afiliados não foi aprovada desta vez.'}
          </p>
        </div>
      </div>
    );
  }

  const referrals = await getReferralsByAffiliate(affiliate.id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fatorintimo.com';
  const referralLink = `${baseUrl}/?ref=${affiliate.code}`;

  const totalSales = referrals.reduce((s, r) => s + r.saleAmount, 0);
  const totalCommission = referrals.reduce((s, r) => s + r.commissionAmount, 0);
  const pendingCommission = referrals.filter((r) => r.status === 'pending').reduce((s, r) => s + r.commissionAmount, 0);
  const paidCommission = referrals.filter((r) => r.status === 'paid').reduce((s, r) => s + r.commissionAmount, 0);

  return (
    <div className="min-h-screen px-6 py-28">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs text-accent tracking-[0.3em] uppercase mb-4 block">Painel do afiliado</span>
          <h1 className="font-heading text-4xl font-light text-text-primary mb-2">
            Olá, {affiliate.name.split(' ')[0]}.
          </h1>
          <p className="text-text-muted text-sm">Você ganha {affiliate.commissionRate}% de comissão em cada venda pelo seu link.</p>
        </div>

        <div className="mb-8">
          <p className="text-text-muted text-xs mb-2 uppercase tracking-widest">Seu link de afiliado</p>
          <CopyReferralLink link={referralLink} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-2xl border border-white/5 bg-surface p-4 text-center">
            <MousePointerClick size={16} className="text-cyan-400 mx-auto mb-2" />
            <p className="font-body font-semibold text-xl text-text-primary">{affiliate.clicks}</p>
            <p className="text-text-muted text-[11px] mt-0.5">Cliques</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface p-4 text-center">
            <ShoppingBag size={16} className="text-purple-400 mx-auto mb-2" />
            <p className="font-body font-semibold text-xl text-text-primary">{referrals.length}</p>
            <p className="text-text-muted text-[11px] mt-0.5">Vendas</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface p-4 text-center">
            <Wallet size={16} className="text-green-400 mx-auto mb-2" />
            <p className="font-body font-semibold text-xl text-text-primary">{money(totalCommission)}</p>
            <p className="text-text-muted text-[11px] mt-0.5">Comissão total</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/5 p-4">
            <p className="text-text-muted text-xs mb-1">Pendente</p>
            <p className="font-body font-semibold text-lg text-yellow-400">{money(pendingCommission)}</p>
          </div>
          <div className="rounded-2xl border border-green-400/15 bg-green-400/5 p-4">
            <p className="text-text-muted text-xs mb-1">Já pago</p>
            <p className="font-body font-semibold text-lg text-green-400">{money(paidCommission)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.04]">
            <h2 className="text-text-primary font-medium text-sm">Vendas pelo seu link</h2>
            <p className="text-text-muted text-xs mt-0.5">{totalSales > 0 ? `${money(totalSales)} em vendas geradas` : 'Nenhuma venda ainda'}</p>
          </div>
          {referrals.length === 0 ? (
            <p className="px-5 py-10 text-text-muted text-center text-sm">
              Suas vendas aparecem aqui assim que alguém comprar pelo seu link.
            </p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-secondary text-sm font-medium truncate">{r.productTitle || 'Produto'}</p>
                    <p className="text-text-muted text-xs mt-0.5">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className="text-accent text-sm font-medium flex-shrink-0">{money(r.commissionAmount)}</p>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      r.status === 'paid'
                        ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                        : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                    }`}
                  >
                    {r.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
