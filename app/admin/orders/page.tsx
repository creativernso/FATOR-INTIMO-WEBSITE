'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/orders';
import { CartRecoverySettings } from '@/lib/types';
import { ShoppingBag, Mail, TrendingUp, RefreshCw, AlertTriangle, Send, Check, Settings, Undo2 } from 'lucide-react';

interface AbandonedCheckoutRow {
  id: string;
  sessionId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  customerEmail: string;
  customerName?: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
  recoveryEmailSentAt?: string;
  recovered: boolean;
}

const DEFAULT_CART_SETTINGS: CartRecoverySettings = {
  enabled: false,
  delayHours: 2,
  subject: 'Você esqueceu de finalizar sua compra',
  body: 'Olá {nome},\n\nVocê começou a garantir {produto} mas o pagamento não foi concluído. Ainda dá tempo de finalizar o seu acesso.',
  ctaLabel: 'Concluir minha compra',
};

type Tab = 'orders' | 'abandoned';

export default function AdminOrders() {
  const [tab, setTab] = useState<Tab>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);

  const [checkouts, setCheckouts] = useState<AbandonedCheckoutRow[]>([]);
  const [checkoutsLoading, setCheckoutsLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [cartSettings, setCartSettings] = useState<CartRecoverySettings>(DEFAULT_CART_SETTINGS);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders');
    setOrders(await res.json());
    setLoading(false);
  };

  const fetchCheckouts = async () => {
    const res = await fetch('/api/admin/checkouts');
    if (res.ok) setCheckouts(await res.json());
    setCheckoutsLoading(false);
  };

  const fetchCartSettings = async () => {
    const res = await fetch('/api/admin/cart-recovery-settings');
    if (res.ok) setCartSettings({ ...DEFAULT_CART_SETTINGS, ...(await res.json()) });
  };

  useEffect(() => {
    fetchOrders();
    fetchCheckouts();
    fetchCartSettings();
  }, []);

  const handleResend = async (id: string) => {
    setResending(id);
    await fetch(`/api/admin/orders/${id}/resend`, { method: 'POST' });
    setResending(null);
  };

  const handleSendRecovery = async (id: string) => {
    setSendingId(id);
    try {
      await fetch(`/api/admin/checkouts/${id}/send-recovery`, { method: 'POST' });
      await fetchCheckouts();
    } finally {
      setSendingId(null);
    }
  };

  const saveCartSettings = async () => {
    setSettingsSaving(true);
    try {
      await fetch('/api/admin/cart-recovery-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartSettings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } finally {
      setSettingsSaving(false);
    }
  };

  const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

  const totalRevenue = orders.reduce((sum, o) => sum + o.amountTotal, 0) / 100;
  const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size;

  const recoveredCount = checkouts.filter((c) => c.recovered).length;
  const recoveryRate = checkouts.length > 0 ? (recoveredCount / checkouts.length) * 100 : 0;
  const lostRevenue = checkouts.filter((c) => !c.recovered).reduce((s, c) => s + c.amountTotal, 0) / 100;

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Financeiro
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            {tab === 'orders' ? 'Pedidos' : 'Carrinhos abandonados'}
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {tab === 'orders'
              ? `${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'} realizados`
              : `${checkouts.length} ${checkouts.length === 1 ? 'checkout iniciado e não concluído' : 'checkouts iniciados e não concluídos'}`}
          </p>
        </div>
        <div className="flex gap-2">
          {([
            { id: 'orders', label: 'Pedidos' },
            { id: 'abandoned', label: 'Carrinhos abandonados' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-accent text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'orders' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Receita total',
                value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                icon: TrendingUp,
                accent: '#fe0050',
                bg: 'rgba(254,0,80,0.06)',
                border: 'rgba(254,0,80,0.12)',
              },
              {
                label: 'Total de pedidos',
                value: orders.length,
                icon: ShoppingBag,
                accent: '#a855f7',
                bg: 'rgba(168,85,247,0.06)',
                border: 'rgba(168,85,247,0.12)',
              },
              {
                label: 'Clientes únicos',
                value: uniqueCustomers,
                icon: Mail,
                accent: '#10b981',
                bg: 'rgba(16,185,129,0.06)',
                border: 'rgba(16,185,129,0.12)',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border p-5 lg:p-6"
                style={{ background: stat.bg, borderColor: stat.border }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                  >
                    <stat.icon size={16} style={{ color: stat.accent }} />
                  </div>
                </div>
                <p
                  className="font-body font-semibold leading-none"
                  style={{ fontSize: fs('1.5rem', '2.5vw', '2.2rem'), color: stat.accent }}
                >
                  {stat.value}
                </p>
                <p className="text-text-muted mt-1.5" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-text-muted" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
                Carregando...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={20} className="text-text-muted" />
                </div>
                <p className="text-text-muted" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>
                  Nenhum pedido ainda.
                </p>
                <p className="text-text-muted mt-1" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem') }}>
                  Os pedidos aparecem aqui após a confirmação de pagamento.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #333333' }}>
                    {['Cliente', 'Produto', 'Valor', 'Data', ''].map((h, i) => (
                      <th
                        key={i}
                        className={`text-left px-5 lg:px-6 py-4 font-medium tracking-widest uppercase ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 2 ? 'hidden sm:table-cell' : ''} ${i === 3 ? 'hidden lg:table-cell' : ''} ${i === 4 ? 'text-right' : ''}`}
                        style={{ fontSize: fs('0.62rem', '0.7vw', '0.68rem'), color: '#666666' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderColor: '#333333' }}>
                  {[...orders].reverse().map((order) => (
                    <tr key={order.id} className="hover:bg-white/2 transition-colors group" style={{ borderBottom: '1px solid #333333' }}>
                      <td className="px-5 lg:px-6 py-4 lg:py-5">
                        <p className="font-medium" style={{ fontSize: fs('0.82rem', '0.95vw', '0.9rem'), color: '#e0e0e0' }}>
                          {order.customerName || '-'}
                        </p>
                        <p className="mt-0.5 truncate max-w-[180px]" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem'), color: '#888888' }}>
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-5 lg:px-6 py-4 hidden md:table-cell">
                        <p style={{ fontSize: fs('0.78rem', '0.88vw', '0.84rem'), color: '#aaaaaa' }}>
                          {order.productTitle || '-'}
                        </p>
                      </td>
                      <td className="px-5 lg:px-6 py-4 hidden sm:table-cell">
                        <p className="font-medium" style={{ fontSize: fs('0.82rem', '0.92vw', '0.875rem'), color: '#e0e0e0' }}>
                          R$ {(order.amountTotal / 100).toFixed(2).replace('.', ',')}
                        </p>
                      </td>
                      <td className="px-5 lg:px-6 py-4 hidden lg:table-cell" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem'), color: '#888888' }}>
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                        <span className="block" style={{ fontSize: fs('0.68rem', '0.76vw', '0.72rem'), color: '#666666' }}>
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleResend(order.id)}
                            disabled={resending === order.id}
                            title="Reenviar email"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/8 border border-transparent hover:border-accent/20 transition-all disabled:opacity-50"
                            style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}
                          >
                            <RefreshCw size={12} className={resending === order.id ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Reenviar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'abandoned' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Receita potencial perdida',
                value: `R$ ${lostRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                icon: AlertTriangle,
                accent: '#f59e0b',
                bg: 'rgba(245,158,11,0.06)',
                border: 'rgba(245,158,11,0.12)',
              },
              {
                label: 'Carrinhos abandonados',
                value: checkouts.length,
                icon: ShoppingBag,
                accent: '#a855f7',
                bg: 'rgba(168,85,247,0.06)',
                border: 'rgba(168,85,247,0.12)',
              },
              {
                label: 'Taxa de recuperação',
                value: `${recoveryRate.toFixed(1)}%`,
                icon: Undo2,
                accent: '#10b981',
                bg: 'rgba(16,185,129,0.06)',
                border: 'rgba(16,185,129,0.12)',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border p-5 lg:p-6"
                style={{ background: stat.bg, borderColor: stat.border }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                  >
                    <stat.icon size={16} style={{ color: stat.accent }} />
                  </div>
                </div>
                <p
                  className="font-body font-semibold leading-none"
                  style={{ fontSize: fs('1.5rem', '2.5vw', '2.2rem'), color: stat.accent }}
                >
                  {stat.value}
                </p>
                <p className="text-text-muted mt-1.5" style={{ fontSize: fs('0.72rem', '0.82vw', '0.78rem') }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Recovery email settings */}
          <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="w-full flex items-center justify-between px-5 lg:px-6 py-4"
            >
              <span className="flex items-center gap-2 text-text-primary font-medium" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>
                <Settings size={14} /> E-mail automático de recuperação
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${cartSettings.enabled ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-white/5 text-text-muted border border-white/10'}`}>
                  {cartSettings.enabled ? 'Ativado' : 'Desativado'}
                </span>
              </span>
              <span className="text-text-muted text-xs">{showSettings ? 'Ocultar' : 'Configurar'}</span>
            </button>

            {showSettings && (
              <div className="px-5 lg:px-6 pb-6 pt-2 space-y-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCartSettings((s) => ({ ...s, enabled: !s.enabled }))}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${cartSettings.enabled ? 'bg-accent' : 'bg-white/10'}`}
                  >
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: cartSettings.enabled ? '22px' : '2px' }} />
                  </button>
                  <span className="text-text-secondary text-sm">Enviar automaticamente todo dia (via cron)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-muted text-xs uppercase tracking-widest block mb-1.5">Enviar após (horas)</label>
                    <input
                      type="number"
                      min={1}
                      value={cartSettings.delayHours}
                      onChange={(e) => setCartSettings((s) => ({ ...s, delayHours: Number(e.target.value) }))}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs uppercase tracking-widest block mb-1.5">Texto do botão</label>
                    <input
                      value={cartSettings.ctaLabel}
                      onChange={(e) => setCartSettings((s) => ({ ...s, ctaLabel: e.target.value }))}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-xs uppercase tracking-widest block mb-1.5">Assunto</label>
                  <input
                    value={cartSettings.subject}
                    onChange={(e) => setCartSettings((s) => ({ ...s, subject: e.target.value }))}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-xs uppercase tracking-widest block mb-1.5">Mensagem de introdução</label>
                  <p className="text-text-muted text-xs mb-1.5">
                    Aparece acima do produto no e-mail. A imagem, o título, o preço e o botão são preenchidos automaticamente com os dados do produto abandonado. Use {'{nome}'}, {'{produto}'} e {'{link}'}.
                  </p>
                  <textarea
                    rows={3}
                    value={cartSettings.body}
                    onChange={(e) => setCartSettings((s) => ({ ...s, body: e.target.value }))}
                    className="admin-input resize-none"
                  />
                </div>

                <button
                  onClick={saveCartSettings}
                  disabled={settingsSaving}
                  className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  {settingsSaved ? <><Check size={14} /> Salvo!</> : settingsSaving ? 'Salvando...' : 'Salvar configurações'}
                </button>
                <p className="text-text-muted text-xs">
                  O envio automático roda uma vez por dia (cron diário), então o horário exato pode variar dentro do dia.
                </p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
            {checkoutsLoading ? (
              <div className="p-16 text-center text-text-muted" style={{ fontSize: fs('0.8rem', '0.9vw', '0.875rem') }}>
                Carregando...
              </div>
            ) : checkouts.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={20} className="text-text-muted" />
                </div>
                <p className="text-text-muted" style={{ fontSize: fs('0.85rem', '0.95vw', '0.9rem') }}>
                  Nenhum carrinho abandonado ainda.
                </p>
                <p className="text-text-muted mt-1" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem') }}>
                  Aparecem aqui quando alguém inicia o checkout, informa o e-mail e não conclui o pagamento.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #333333' }}>
                    {['Cliente', 'Produto', 'Valor', 'Abandonado em', 'Status', ''].map((h, i) => (
                      <th
                        key={i}
                        className={`text-left px-5 lg:px-6 py-4 font-medium tracking-widest uppercase ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 2 ? 'hidden sm:table-cell' : ''} ${i === 3 ? 'hidden lg:table-cell' : ''} ${i === 5 ? 'text-right' : ''}`}
                        style={{ fontSize: fs('0.62rem', '0.7vw', '0.68rem'), color: '#666666' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderColor: '#333333' }}>
                  {checkouts.map((c) => (
                    <tr key={c.id} className="hover:bg-white/2 transition-colors group" style={{ borderBottom: '1px solid #333333' }}>
                      <td className="px-5 lg:px-6 py-4 lg:py-5">
                        <p className="font-medium" style={{ fontSize: fs('0.82rem', '0.95vw', '0.9rem'), color: '#e0e0e0' }}>
                          {c.customerName || '-'}
                        </p>
                        <p className="mt-0.5 truncate max-w-[180px]" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem'), color: '#888888' }}>
                          {c.customerEmail}
                        </p>
                      </td>
                      <td className="px-5 lg:px-6 py-4 hidden md:table-cell">
                        <p style={{ fontSize: fs('0.78rem', '0.88vw', '0.84rem'), color: '#aaaaaa' }}>
                          {c.productTitle || '-'}
                        </p>
                      </td>
                      <td className="px-5 lg:px-6 py-4 hidden sm:table-cell">
                        <p className="font-medium" style={{ fontSize: fs('0.82rem', '0.92vw', '0.875rem'), color: '#e0e0e0' }}>
                          R$ {(c.amountTotal / 100).toFixed(2).replace('.', ',')}
                        </p>
                      </td>
                      <td className="px-5 lg:px-6 py-4 hidden lg:table-cell" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem'), color: '#888888' }}>
                        {new Date(c.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        <span className="block" style={{ fontSize: fs('0.68rem', '0.76vw', '0.72rem'), color: '#666666' }}>
                          {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        {c.recovered ? (
                          <span className="flex items-center gap-1.5 text-emerald-400" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                            <Check size={12} /> Recuperado
                          </span>
                        ) : c.recoveryEmailSentAt ? (
                          <span className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                            <Mail size={12} /> E-mail enviado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-400" style={{ fontSize: fs('0.72rem', '0.8vw', '0.75rem') }}>
                            <AlertTriangle size={12} /> Aguardando
                          </span>
                        )}
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        {!c.recovered && (
                          <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleSendRecovery(c.id)}
                              disabled={sendingId === c.id}
                              title="Enviar e-mail de recuperação"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/8 border border-transparent hover:border-accent/20 transition-all disabled:opacity-50"
                              style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}
                            >
                              <Send size={12} className={sendingId === c.id ? 'animate-pulse' : ''} />
                              <span className="hidden sm:inline">{c.recoveryEmailSentAt ? 'Reenviar' : 'Enviar'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
