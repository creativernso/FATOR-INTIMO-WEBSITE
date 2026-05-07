'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/orders';
import { ShoppingBag, Mail, TrendingUp, RefreshCw } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders');
    setOrders(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleResend = async (id: string) => {
    setResending(id);
    await fetch(`/api/admin/orders/${id}/resend`, { method: 'POST' });
    setResending(null);
  };

  const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

  const totalRevenue = orders.reduce((sum, o) => sum + o.amountTotal, 0) / 100;
  const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size;

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>
            Financeiro
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.2rem', '1.8vw', '1.6rem') }}>
            Pedidos
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem') }}>
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} realizados
          </p>
        </div>
      </div>

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
              <tr className="border-b border-white/5">
                {['Cliente', 'Produto', 'Valor', 'Data', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`text-left px-5 lg:px-6 py-4 text-text-muted font-medium tracking-widest uppercase ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 2 ? 'hidden sm:table-cell' : ''} ${i === 3 ? 'hidden lg:table-cell' : ''} ${i === 4 ? 'text-right' : ''}`}
                    style={{ fontSize: fs('0.62rem', '0.7vw', '0.68rem') }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {[...orders].reverse().map((order) => (
                <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-5 lg:px-6 py-4 lg:py-5">
                    <p className="text-text-primary font-medium" style={{ fontSize: fs('0.82rem', '0.95vw', '0.9rem') }}>
                      {order.customerName || '—'}
                    </p>
                    <p className="text-text-muted mt-0.5 truncate max-w-[180px]" style={{ fontSize: fs('0.7rem', '0.78vw', '0.75rem') }}>
                      {order.customerEmail}
                    </p>
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden md:table-cell">
                    <p className="text-text-secondary" style={{ fontSize: fs('0.78rem', '0.88vw', '0.84rem') }}>
                      {order.productTitle || '—'}
                    </p>
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden sm:table-cell">
                    <p className="text-text-primary font-medium" style={{ fontSize: fs('0.82rem', '0.92vw', '0.875rem') }}>
                      R$ {(order.amountTotal / 100).toFixed(2).replace('.', ',')}
                    </p>
                  </td>
                  <td className="px-5 lg:px-6 py-4 hidden lg:table-cell text-text-muted" style={{ fontSize: fs('0.75rem', '0.85vw', '0.8rem') }}>
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })}
                    <span className="block text-text-muted" style={{ fontSize: fs('0.68rem', '0.76vw', '0.72rem') }}>
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
    </div>
  );
}
