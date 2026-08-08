import { TrendingUp, Users, FileText, Package, ShoppingBag, BookOpen, Heart, MessageSquare, Download, Star, Eye, ExternalLink, Activity, MapPin, Megaphone, Filter, ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { getPosts, getLeads, getTestimonials, getGuides, getCommunityPosts, getPageViewTotals, getPageViewsByPath, getProducts } from '@/lib/db';
import { getOrders, getAbandonedCheckouts } from '@/lib/orders';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { LiveView } from './LiveView';
import { countryCodeToFlag, countryName } from '@/lib/geo';
import { getPixelEventCounts, getPurchaseMatchQuality } from '@/lib/meta-insights';

export const dynamic = 'force-dynamic';

function groupByDay(items: { createdAt?: string; publishedAt?: string; date?: string }[], days = 30) {
  const now = Date.now();
  const buckets: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    buckets[d.toISOString().split('T')[0]] = 0;
  }
  for (const item of items) {
    const raw = item.createdAt || item.publishedAt || item.date || '';
    const day = raw.split('T')[0];
    if (day in buckets) buckets[day]++;
  }
  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}

function sumByDay(items: { createdAt?: string; amount: number }[], days = 30) {
  const now = Date.now();
  const buckets: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    buckets[d.toISOString().split('T')[0]] = 0;
  }
  for (const item of items) {
    const day = (item.createdAt || '').split('T')[0];
    if (day in buckets) buckets[day] += item.amount;
  }
  return Object.entries(buckets).map(([date, amount]) => ({ date, amount }));
}

function filterByDays<T extends { createdAt?: string; publishedAt?: string; date?: string }>(
  items: T[],
  days: number | null,
): T[] {
  if (!days) return items;
  const cutoff = Date.now() - days * 86400000;
  return items.filter((i) => {
    const ts = new Date(i.createdAt || i.publishedAt || i.date || '').getTime();
    return ts >= cutoff;
  });
}

function calcGrowth(items: { createdAt?: string; publishedAt?: string; date?: string }[]) {
  const now = Date.now();
  const thisMonth = items.filter((i) => {
    const d = new Date(i.createdAt || i.publishedAt || i.date || '').getTime();
    return now - d < 30 * 86400000;
  }).length;
  const lastMonth = items.filter((i) => {
    const d = new Date(i.createdAt || i.publishedAt || i.date || '').getTime();
    return now - d >= 30 * 86400000 && now - d < 60 * 86400000;
  }).length;
  if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
}

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} className="text-text-muted" />
      <p className="text-text-muted tracking-widest uppercase" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.75rem)' }}>
        {children}
      </p>
    </div>
  );
}

type Props = { searchParams: Promise<{ days?: string }> };

export default async function AnalyticsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const daysParam = sp.days || '30';
  const days = daysParam === 'all' ? null : parseInt(daysParam, 10);

  const [posts, leads, testimonials, guides, allCommunityPosts, orders, pageViewDocs, pixelStats, purchaseMatchQuality, products, abandonedCheckouts, productViews] = await Promise.all([
    getPosts(),
    getLeads(),
    getTestimonials(),
    getGuides(),
    getCommunityPosts(),
    getOrders(),
    getPageViewTotals(days ?? 365),
    getPixelEventCounts(),
    getPurchaseMatchQuality(),
    getProducts(),
    getAbandonedCheckouts(),
    getPageViewsByPath(days ?? 365),
  ]);

  const totalPageViews = pageViewDocs.reduce((s, d) => s + d.total, 0);

  // Apply date filter where relevant
  const filteredLeads = filterByDays(leads, days);
  const filteredOrders = filterByDays(orders.map((o) => ({ ...o, createdAt: o.createdAt })), days);

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.amountTotal, 0) / 100;
  const totalGuideDownloads = guides.reduce((s, g) => s + (g.downloadCount ?? 0), 0);
  const approvedCommunityPosts = allCommunityPosts.filter((p) => p.status === 'approved');
  const avgRating = testimonials.filter((t) => t.rating).reduce((a, t) => a + (t.rating ?? 0), 0) / (testimonials.filter((t) => t.rating).length || 1);

  const emailLeads = leads.filter((l) => l.email).length;
  const leadsGrowth = calcGrowth(leads);
  const ordersGrowth = calcGrowth(orders.map((o) => ({ createdAt: o.createdAt })));
  const postsGrowth = calcGrowth(posts.map((p) => ({ publishedAt: p.publishedAt })));

  const topPosts = [...posts].sort((a, b) => b.readTime - a.readTime).slice(0, 5);
  const topGuides = [...guides].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0)).slice(0, 5);

  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';
  const pixelConfigured = !!fbPixelId;
  const eventsManagerUrl = pixelConfigured
    ? `https://business.facebook.com/events_manager2/list/pixel/${fbPixelId}/overview`
    : 'https://business.facebook.com/events_manager2/';

  const chartDays = days && days <= 30 ? days : 14;
  const leadsByDay = groupByDay(filteredLeads, chartDays);
  const maxLeads = Math.max(...leadsByDay.map((d) => d.count), 1);
  const chartLeadsTotal = leadsByDay.reduce((s, d) => s + d.count, 0);

  const revenueByDay = sumByDay(filteredOrders.map((o) => ({ createdAt: o.createdAt, amount: o.amountTotal / 100 })), chartDays);
  const maxRevenue = Math.max(...revenueByDay.map((d) => d.amount), 1);
  const chartRevenueTotal = revenueByDay.reduce((s, d) => s + d.amount, 0);

  // Top selling products by revenue, within the selected period
  const productSalesMap = new Map<string, { count: number; revenue: number }>();
  for (const order of filteredOrders) {
    const key = order.productTitle || 'Produto';
    const entry = productSalesMap.get(key) ?? { count: 0, revenue: 0 };
    entry.count++;
    entry.revenue += order.amountTotal;
    productSalesMap.set(key, entry);
  }
  const topSellingProducts = Array.from(productSalesMap.entries())
    .map(([title, v]) => ({ title, count: v.count, revenue: v.revenue / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Conversion funnel per product: views → checkout started → purchased.
  // "Checkout started" = every Stripe Checkout Session ever created for the
  // product, whether it completed (order) or expired (abandonedCheckout).
  const filteredAbandoned = filterByDays(abandonedCheckouts, days);
  const pct = (n: number | null) => (n === null ? '–' : `${n.toFixed(1)}%`);
  const funnelByProduct = products
    .map((p) => {
      const views = productViews[`__products__${p.slug}`] || 0;
      const purchased = filteredOrders.filter((o) => o.productId === p.id).length;
      const checkoutsStarted = purchased + filteredAbandoned.filter((c) => c.productId === p.id).length;
      return {
        slug: p.slug,
        title: p.title,
        views,
        checkoutsStarted,
        purchased,
        viewToCheckout: views > 0 ? (checkoutsStarted / views) * 100 : null,
        checkoutToPurchase: checkoutsStarted > 0 ? (purchased / checkoutsStarted) * 100 : null,
      };
    })
    .filter((f) => f.views > 0 || f.checkoutsStarted > 0)
    .sort((a, b) => b.views - a.views);

  // Sessions by country, aggregated across the fetched pageview docs
  const countryTotals: Record<string, number> = {};
  for (const doc of pageViewDocs) {
    if (!doc.countries) continue;
    for (const [code, count] of Object.entries(doc.countries)) {
      countryTotals[code] = (countryTotals[code] || 0) + count;
    }
  }
  const topCountriesOverall = Object.entries(countryTotals)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const totalCountryViews = topCountriesOverall.reduce((s, c) => s + c.count, 0) || 1;

  // Ad-campaign performance: group leads and orders by utm_campaign (falls back to utm_source, then "direct")
  const campaignKey = (item: { utmCampaign?: string; utmSource?: string }) =>
    item.utmCampaign || item.utmSource || 'Direto / Orgânico';
  const campaignMap = new Map<string, { leads: number; orders: number; revenue: number }>();
  for (const lead of filteredLeads) {
    const key = campaignKey(lead);
    const entry = campaignMap.get(key) ?? { leads: 0, orders: 0, revenue: 0 };
    entry.leads++;
    campaignMap.set(key, entry);
  }
  for (const order of filteredOrders) {
    const key = campaignKey(order);
    const entry = campaignMap.get(key) ?? { leads: 0, orders: 0, revenue: 0 };
    entry.orders++;
    entry.revenue += order.amountTotal;
    campaignMap.set(key, entry);
  }
  const campaignPerformance = Array.from(campaignMap.entries())
    .map(([campaign, v]) => ({
      campaign,
      leads: v.leads,
      orders: v.orders,
      revenue: v.revenue / 100,
      conversion: v.leads > 0 ? (v.orders / v.leads) * 100 : null,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.leads - a.leads);

  const stats = [
    { label: 'Page Views', value: totalPageViews.toLocaleString('pt-BR'), icon: Eye, accent: '#06b6d4', growth: null, href: '/admin/analytics' },
    { label: 'Receita Total', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, accent: '#fe0050', growth: ordersGrowth, href: '/admin/orders' },
    { label: 'Leads Totais', value: filteredLeads.length, icon: Users, accent: '#10b981', growth: leadsGrowth, href: '/admin/leads' },
    { label: 'Email Leads', value: emailLeads, icon: MessageSquare, accent: '#3b82f6', growth: null, href: '/admin/leads' },
    { label: 'Pedidos', value: filteredOrders.length, icon: ShoppingBag, accent: '#a855f7', growth: ordersGrowth, href: '/admin/orders' },
    { label: 'Artigos', value: posts.length, icon: FileText, accent: '#f59e0b', growth: postsGrowth, href: '/admin/blog' },
    { label: 'Downloads Guias', value: totalGuideDownloads, icon: Download, accent: '#06b6d4', growth: null, href: '/admin/guide' },
    { label: 'Posts Comunidade', value: approvedCommunityPosts.length, icon: Heart, accent: '#ec4899', growth: null, href: '/admin/comunidade' },
    { label: 'Avaliação Média', value: `⭐ ${avgRating.toFixed(1)}`, icon: Star, accent: '#f59e0b', growth: null, href: '/admin/testimonials' },
  ];

  return (
    <div className="space-y-8 lg:space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: 'clamp(0.62rem, 0.72vw, 0.7rem)' }}>
            Métricas
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2rem)' }}>
            Analytics
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.95rem)' }}>
            Visão consolidada do desempenho da plataforma.
          </p>
        </div>
        <Suspense fallback={null}>
          <AnalyticsFilterBar current={daysParam} />
        </Suspense>
      </div>

      <LiveView />

      {/* ── Visão geral ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionLabel icon={Activity}>Visão geral</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="relative rounded-2xl border bg-surface p-5 hover:scale-[1.01] transition-all duration-300 group overflow-hidden"
              style={{ borderColor: `${stat.accent}40` }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-15 blur-xl" style={{ background: stat.accent }} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.accent}18`, border: `1px solid ${stat.accent}28` }}>
                    <stat.icon size={14} style={{ color: stat.accent }} />
                  </div>
                  {stat.growth !== null && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${stat.growth >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                      {stat.growth >= 0 ? '+' : ''}{stat.growth}%
                    </span>
                  )}
                </div>
                <p className="font-body font-semibold text-text-primary" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', color: stat.accent }}>
                  {stat.value}
                </p>
                <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.78rem)' }}>
                  {stat.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Vendas ─────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionLabel icon={TrendingUp}>Vendas</SectionLabel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue chart */}
          <div className="rounded-2xl border border-[#3a3a40] bg-surface p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>
                  Receita nos últimos {chartDays} dias
                </h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.72rem, 0.82vw, 0.78rem)' }}>
                  {filteredOrders.length} pedidos no período selecionado
                </p>
              </div>
              <div className="text-right">
                <p className="font-body font-semibold text-accent" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)' }}>
                  R$ {chartRevenueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-text-muted" style={{ fontSize: 'clamp(0.65rem, 0.75vw, 0.72rem)' }}>
                  últimos {chartDays} dias
                </p>
              </div>
            </div>

            <div className="flex items-end gap-1 h-24">
              {revenueByDay.map(({ date, amount }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${Math.max(4, (amount / maxRevenue) * 88)}px`,
                      background: amount > 0 ? 'rgba(254,0,80,0.5)' : 'rgba(255,255,255,0.05)',
                      borderTop: amount > 0 ? '1px solid rgba(254,0,80,0.4)' : 'none',
                    }}
                    title={`${date}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                  <span className="text-text-muted" style={{ fontSize: '8px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', opacity: 0.5 }}>
                    {date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead growth chart */}
          <div className="rounded-2xl border border-[#3a3a40] bg-surface p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>
                  Novos leads nos últimos {chartDays} dias
                </h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.72rem, 0.82vw, 0.78rem)' }}>
                  {chartLeadsTotal} leads no período selecionado
                </p>
              </div>
              <div className="text-right">
                <p className="font-body font-semibold text-green-400" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)' }}>
                  {chartLeadsTotal}
                </p>
                <p className="text-text-muted" style={{ fontSize: 'clamp(0.65rem, 0.75vw, 0.72rem)' }}>
                  últimos {chartDays} dias
                </p>
              </div>
            </div>

            <div className="flex items-end gap-1 h-24">
              {leadsByDay.map(({ date, count }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full rounded-t transition-all duration-500 group-hover:opacity-100"
                    style={{
                      height: `${Math.max(4, (count / maxLeads) * 88)}px`,
                      background: count > 0 ? 'rgba(254,0,80,0.5)' : 'rgba(255,255,255,0.05)',
                      borderTop: count > 0 ? '1px solid rgba(254,0,80,0.4)' : 'none',
                    }}
                    title={`${date}: ${count} leads`}
                  />
                  <span className="text-text-muted" style={{ fontSize: '8px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', opacity: 0.5 }}>
                    {date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top selling products */}
        {topSellingProducts.length > 0 && (
          <div className="rounded-2xl border border-[#3a3a40] bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#a855f718', border: '1px solid #a855f738' }}>
                  <Package size={15} style={{ color: '#a855f7' }} />
                </div>
                <div>
                  <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>Produtos mais vendidos</h3>
                  <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>Por receita, no período selecionado</p>
                </div>
              </div>
              <Link href="/admin/orders" className="text-text-muted hover:text-accent transition-colors" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>
                Ver pedidos →
              </Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {topSellingProducts.map((p, i) => (
                <div key={p.title} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <span className="text-text-muted font-heading" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)', minWidth: '18px' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-secondary font-medium truncate" style={{ fontSize: 'clamp(0.8rem, 0.9vw, 0.875rem)' }}>{p.title}</p>
                    <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.72rem)' }}>
                      {p.count} pedido{p.count === 1 ? '' : 's'} · ticket médio R$ {(p.revenue / p.count).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <p className="font-body font-semibold text-green-400 flex-shrink-0" style={{ fontSize: 'clamp(0.85rem, 1vw, 0.95rem)' }}>
                    R$ {p.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion funnel per product */}
        {funnelByProduct.length > 0 && (
          <div className="rounded-2xl border border-[#3a3a40] bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#06b6d418', border: '1px solid #06b6d438' }}>
                <Filter size={15} style={{ color: '#06b6d4' }} />
              </div>
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>Funil de conversão</h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>Visualizações → checkout iniciado → compra, por produto</p>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {funnelByProduct.map((f) => (
                <div key={f.slug} className="px-5 py-4">
                  <p className="text-text-secondary font-medium truncate mb-3" style={{ fontSize: 'clamp(0.8rem, 0.9vw, 0.875rem)' }}>{f.title}</p>
                  <div className="flex items-center">
                    <div className="flex-1 text-center">
                      <p className="font-body font-semibold text-text-primary" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)' }}>{f.views.toLocaleString('pt-BR')}</p>
                      <p className="text-text-muted mt-0.5" style={{ fontSize: '10px' }}>visualizações</p>
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0 w-16">
                      <ChevronRight size={13} className="text-text-muted" />
                      <span className="text-text-muted mt-0.5" style={{ fontSize: '9.5px' }}>{pct(f.viewToCheckout)}</span>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="font-body font-semibold" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)', color: '#3b82f6' }}>{f.checkoutsStarted}</p>
                      <p className="text-text-muted mt-0.5" style={{ fontSize: '10px' }}>checkout iniciado</p>
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0 w-16">
                      <ChevronRight size={13} className="text-text-muted" />
                      <span className="text-text-muted mt-0.5" style={{ fontSize: '9.5px' }}>{pct(f.checkoutToPurchase)}</span>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="font-body font-semibold text-green-400" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)' }}>{f.purchased}</p>
                      <p className="text-text-muted mt-0.5" style={{ fontSize: '10px' }}>comprado</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaign performance */}
        {campaignPerformance.length > 0 && (
          <div className="rounded-2xl border border-[#3a3a40] bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b18', border: '1px solid #f59e0b38' }}>
                <Megaphone size={15} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>Desempenho por campanha</h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>utm_campaign / utm_source dos links de anúncio</p>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {campaignPerformance.slice(0, 8).map((c) => (
                <div key={c.campaign} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-secondary font-medium truncate" style={{ fontSize: 'clamp(0.8rem, 0.9vw, 0.875rem)' }}>{c.campaign}</p>
                    <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.72rem)' }}>
                      {c.leads} leads · {c.orders} pedidos{c.conversion !== null ? ` · ${c.conversion.toFixed(1)}% conversão` : ''}
                    </p>
                  </div>
                  <p className="font-body font-semibold text-green-400 flex-shrink-0" style={{ fontSize: 'clamp(0.85rem, 1vw, 0.95rem)' }}>
                    R$ {c.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion mini-stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#3a3a40] bg-surface p-5">
            <p className="text-text-muted mb-2" style={{ fontSize: 'clamp(0.72rem, 0.82vw, 0.78rem)' }}>Conversão de leads</p>
            <p className="font-body font-semibold" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: '#a855f7' }}>
              {leads.length > 0 ? `${((orders.length / leads.length) * 100).toFixed(1)}%` : '-'}
            </p>
            <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.72rem)' }}>
              {orders.length} vendas de {leads.length} leads
            </p>
          </div>
          <div className="rounded-2xl border border-[#3a3a40] bg-surface p-5">
            <p className="text-text-muted mb-2" style={{ fontSize: 'clamp(0.72rem, 0.82vw, 0.78rem)' }}>Leads com email</p>
            <p className="font-body font-semibold" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: '#3b82f6' }}>
              {leads.length > 0 ? `${Math.round((emailLeads / leads.length) * 100)}%` : '-'}
            </p>
            <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.72rem)' }}>
              {emailLeads} de {leads.length} têm email
            </p>
          </div>
        </div>
      </div>

      {/* ── Tráfego ────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionLabel icon={Eye}>Tráfego</SectionLabel>

        {/* Page views chart */}
        {pageViewDocs.length > 0 && (
          <div className="rounded-2xl border border-[#3a3a40] bg-surface p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>
                  Page Views
                </h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.72rem, 0.82vw, 0.78rem)' }}>
                  {totalPageViews.toLocaleString('pt-BR')} visualizações no período
                </p>
              </div>
              <div className="text-right">
                <p className="font-body font-semibold text-cyan-400" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)' }}>
                  {totalPageViews.toLocaleString('pt-BR')}
                </p>
                <p className="text-text-muted" style={{ fontSize: 'clamp(0.65rem, 0.75vw, 0.72rem)' }}>total</p>
              </div>
            </div>
            <div className="flex items-end gap-1 h-20">
              {(() => {
                const sorted = [...pageViewDocs].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
                const maxPv = Math.max(...sorted.map((d) => d.total), 1);
                return sorted.map(({ date, total }) => (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full rounded-t transition-all duration-500"
                      style={{
                        height: `${Math.max(3, (total / maxPv) * 76)}px`,
                        background: total > 0 ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.05)',
                        borderTop: total > 0 ? '1px solid rgba(6,182,212,0.4)' : 'none',
                      }}
                      title={`${date}: ${total} views`}
                    />
                    <span className="text-text-muted" style={{ fontSize: '7px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', opacity: 0.4 }}>
                      {date.slice(5)}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Sessions by location */}
        {topCountriesOverall.length > 0 && (
          <div className="rounded-2xl border border-[#3a3a40] bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#06b6d418', border: '1px solid #06b6d438' }}>
                <MapPin size={15} style={{ color: '#06b6d4' }} />
              </div>
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>Sessões por país</h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>No período selecionado</p>
              </div>
            </div>
            <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
              {topCountriesOverall.map((c) => {
                const pct = (c.count / totalCountryViews) * 100;
                return (
                  <div key={c.country} className="flex items-center gap-3 text-xs">
                    <span className="w-28 flex-shrink-0 flex items-center gap-1.5 text-text-secondary truncate">
                      <span>{countryCodeToFlag(c.country)}</span> {countryName(c.country)}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-400/60" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-text-muted w-14 text-right tabular-nums">{c.count.toLocaleString('pt-BR')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Ads · Meta Pixel ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionLabel icon={Megaphone}>Ads · Meta Pixel</SectionLabel>

        <div className="rounded-2xl border border-[#3a3a40] bg-surface overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1877f218', border: '1px solid #1877f238' }}>
                <Activity size={15} style={{ color: '#1877f2' }} />
              </div>
              <div>
                <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>Meta Pixel · Facebook Ads</h3>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>
                  {pixelConfigured ? `Pixel ativo: ${fbPixelId}` : 'Pixel não configurado'}
                </p>
              </div>
            </div>
            <a
              href={eventsManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1877f2]/10 text-[#1877f2] border border-[#1877f2]/20 hover:bg-[#1877f2]/15 transition-colors"
            >
              Abrir Events Manager <ExternalLink size={11} />
            </a>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'PageView', desc: 'Disparado em todas as páginas' },
              { label: 'ViewContent', desc: 'Páginas de produto' },
              { label: 'Lead', desc: 'Cadastro guia gratuito' },
              { label: 'Purchase', desc: 'Checkout concluído' },
            ].map((ev) => {
              const match = pixelStats.events.find((e) => e.event.toLowerCase() === ev.label.toLowerCase());
              const isPurchase = ev.label === 'Purchase';
              return (
                <div key={ev.label} className="rounded-xl border border-[#3a3a40] bg-white/2 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${pixelConfigured ? 'bg-green-400 animate-pulse' : 'bg-text-muted/40'}`} />
                    <p className="text-text-primary text-xs font-medium">{ev.label}</p>
                  </div>
                  {pixelConfigured && !pixelStats.error && (
                    <p className="font-body font-semibold text-text-primary" style={{ fontSize: '1.15rem' }}>
                      {(match?.count ?? 0).toLocaleString('pt-BR')}
                    </p>
                  )}
                  <p className="text-text-muted" style={{ fontSize: '11px' }}>{ev.desc}</p>
                  {isPurchase && pixelConfigured && (
                    purchaseMatchQuality.score !== null ? (
                      <p className="text-accent mt-1" style={{ fontSize: '11px' }}>
                        Match quality: {purchaseMatchQuality.score.toFixed(1)}/10
                      </p>
                    ) : purchaseMatchQuality.error ? (
                      <p className="text-text-muted mt-1" style={{ fontSize: '10px' }} title={purchaseMatchQuality.error}>
                        Match quality indisponível
                      </p>
                    ) : null
                  )}
                </div>
              );
            })}
          </div>
          {!pixelConfigured && (
            <div className="px-6 py-4 bg-yellow-400/5 border-t border-yellow-400/10">
              <p className="text-yellow-400/90 text-xs">
                Defina <code className="bg-black/30 px-1.5 py-0.5 rounded">NEXT_PUBLIC_FB_PIXEL_ID</code> nas variáveis de ambiente do Vercel para ativar.
              </p>
            </div>
          )}
          {pixelConfigured && !pixelStats.error && (
            <div className="px-6 py-3 border-t border-white/[0.04]">
              <p className="text-text-muted" style={{ fontSize: '11px' }}>Contagens dos últimos {pixelStats.days} dias (limite da API da Meta).</p>
            </div>
          )}
          {pixelConfigured && pixelStats.error && (
            <div className="px-6 py-4 bg-yellow-400/5 border-t border-yellow-400/10">
              <p className="text-yellow-400/90 text-xs">
                Não foi possível buscar os números do Pixel diretamente ({pixelStats.error}). Pode ser necessário gerar um token com mais permissões em Events Manager → Configurações → Conversions API.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Conteúdo & Comunidade ──────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionLabel icon={BookOpen}>Conteúdo & Comunidade</SectionLabel>

        {/* Reviews analytics */}
        {(() => {
          const reviewed = testimonials.filter((t) => typeof t.rating === 'number' && t.rating! > 0);
          const totalReviews = reviewed.length;
          const avgReview = totalReviews > 0
            ? reviewed.reduce((s, t) => s + (t.rating ?? 0), 0) / totalReviews
            : 0;
          const verifiedReviews = reviewed.filter((t) => t.verifiedPurchase).length;
          const pendingReviews = testimonials.filter((t) => !t.status || t.status === 'pending').length;
          const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          reviewed.forEach((t) => {
            const r = Math.round(t.rating ?? 0);
            if (r >= 1 && r <= 5) dist[r]++;
          });
          const maxDist = Math.max(1, ...Object.values(dist));

          const reviewsByProductTitle = new Map<string, { count: number; sum: number }>();
          reviewed.forEach((t) => {
            if (!t.productPurchased) return;
            const entry = reviewsByProductTitle.get(t.productPurchased) ?? { count: 0, sum: 0 };
            entry.count++;
            entry.sum += t.rating ?? 0;
            reviewsByProductTitle.set(t.productPurchased, entry);
          });
          const topReviewed = Array.from(reviewsByProductTitle.entries())
            .map(([title, v]) => ({ title, count: v.count, avg: v.sum / v.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          if (totalReviews === 0) return null;

          return (
            <div className="rounded-2xl border border-[#3a3a40] bg-surface overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#fe005018', border: '1px solid #fe005038' }}>
                    <Star size={15} className="text-accent fill-accent" />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>Avaliações de produtos</h3>
                    <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>
                      {totalReviews} avaliações · {verifiedReviews} verificadas · {pendingReviews} pendentes
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/testimonials"
                  className="text-text-muted hover:text-accent transition-colors text-xs"
                >
                  Gerenciar →
                </Link>
              </div>
              <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-baseline gap-3 mb-4">
                    <p className="font-heading text-5xl font-light text-text-primary leading-none">{avgReview.toFixed(1)}</p>
                    <p className="text-text-muted text-sm">/ 5</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const n = dist[s] ?? 0;
                      const pct = totalReviews > 0 ? (n / totalReviews) * 100 : 0;
                      const width = (n / maxDist) * 100;
                      return (
                        <div key={s} className="flex items-center gap-2 text-xs">
                          <span className="text-text-muted w-6 flex items-center gap-0.5">
                            {s}<Star size={8} className="text-accent fill-accent" />
                          </span>
                          <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${width}%` }} />
                          </div>
                          <span className="text-text-muted w-10 text-right tabular-nums">{pct.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-widest mb-3">Mais avaliados</p>
                  {topReviewed.length === 0 ? (
                    <p className="text-text-muted text-xs">Nenhum produto avaliado ainda.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {topReviewed.map((p) => (
                        <div key={p.title} className="flex items-center justify-between gap-3">
                          <p className="text-text-secondary text-xs flex-1 truncate">{p.title}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-accent text-xs font-medium tabular-nums flex items-center gap-1">
                              <Star size={10} className="fill-accent" /> {p.avg.toFixed(1)}
                            </span>
                            <span className="text-text-muted text-[10px]">({p.count})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Articles + Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#3a3a40] bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.85rem, 1vw, 0.95rem)' }}>
                Artigos publicados
              </h3>
              <Link href="/admin/blog" className="text-text-muted hover:text-accent transition-colors" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>
                Ver todos →
              </Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {topPosts.length === 0 ? (
                <p className="px-5 py-8 text-text-muted text-center" style={{ fontSize: '0.8rem' }}>Nenhum artigo ainda.</p>
              ) : topPosts.map((post, i) => (
                <div key={post.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <span className="text-text-muted font-heading" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)', minWidth: '18px' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-secondary font-medium truncate" style={{ fontSize: 'clamp(0.8rem, 0.9vw, 0.875rem)' }}>{post.title}</p>
                    <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.72rem)' }}>{post.category} · {post.readTime}min</p>
                  </div>
                  {post.featured && (
                    <span className="text-accent border border-accent/20 bg-accent/5 px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>Destaque</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#3a3a40] bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.85rem, 1vw, 0.95rem)' }}>
                Guias mais baixados
              </h3>
              <Link href="/admin/guide" className="text-text-muted hover:text-accent transition-colors" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>
                Ver todos →
              </Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {topGuides.length === 0 ? (
                <p className="px-5 py-8 text-text-muted text-center" style={{ fontSize: '0.8rem' }}>Nenhum guia ainda.</p>
              ) : topGuides.map((guide, i) => (
                <div key={guide.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <span className="text-text-muted font-heading" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)', minWidth: '18px' }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-secondary font-medium truncate" style={{ fontSize: 'clamp(0.8rem, 0.9vw, 0.875rem)' }}>{guide.title}</p>
                    <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.72rem)' }}>{guide.category || 'Geral'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400 flex-shrink-0" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.75rem)' }}>
                    <Download size={11} /> {guide.downloadCount ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Depoimentos aprovados */}
        <div className="rounded-2xl border border-[#3a3a40] bg-surface p-5 max-w-sm">
          <p className="text-text-muted mb-2" style={{ fontSize: 'clamp(0.72rem, 0.82vw, 0.78rem)' }}>Depoimentos aprovados</p>
          <p className="font-body font-semibold" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: '#10b981' }}>
            {testimonials.filter((t) => t.status === 'approved' || !t.status).length}
          </p>
          <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.72rem)' }}>
            {testimonials.filter((t) => t.status === 'pending').length} aguardando aprovação
          </p>
        </div>
      </div>
    </div>
  );
}
