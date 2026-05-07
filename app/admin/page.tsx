import Link from 'next/link';
import { FileText, Package, MessageSquare, Users, ArrowUpRight, Plus, ShoppingBag } from 'lucide-react';
import { getPosts, getProducts, getTestimonials, getLeads } from '@/lib/db';
import { getOrders } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const posts = getPosts();
  const products = getProducts();
  const testimonials = getTestimonials();
  const leads = getLeads();
  const orders = getOrders();

  const stats = [
    { label: 'Artigos', value: posts.length, icon: FileText, href: '/admin/blog', accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
    { label: 'Produtos', value: products.length, icon: Package, href: '/admin/products', accent: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.15)' },
    { label: 'Pedidos', value: orders.length, icon: ShoppingBag, href: '/admin/orders', accent: '#fe0050', bg: 'rgba(254,0,80,0.08)', border: 'rgba(254,0,80,0.15)' },
    { label: 'Leads', value: leads.length, icon: Users, href: '/admin/leads', accent: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
  ];

  const recentLeads = leads.slice(-6).reverse();

  return (
    <div className="space-y-8 lg:space-y-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-2" style={{ fontSize: 'clamp(0.65rem, 0.75vw, 0.75rem)' }}>
            Visão geral
          </p>
          <h2
            className="font-body text-text-primary font-medium"
            style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2rem)' }}
          >
            Bom dia, Admin.
          </h2>
          <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.95rem)' }}>
            Gerencie todo o conteúdo do Fator Íntimo.
          </p>
        </div>
        <Link
          href="/admin/blog"
          className="hidden sm:flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
          style={{ fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)' }}
        >
          <Plus size={14} />
          Novo conteúdo
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="relative rounded-2xl border p-5 lg:p-6 hover:scale-[1.02] transition-all duration-300 group overflow-hidden"
            style={{ background: stat.bg, borderColor: stat.border }}
          >
            {/* Glow */}
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-xl transition-opacity group-hover:opacity-40"
              style={{ background: stat.accent }}
            />
            <div className="relative">
              <div className="flex items-start justify-between mb-4 lg:mb-5">
                <div
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center"
                  style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                >
                  <stat.icon size={16} style={{ color: stat.accent }} />
                </div>
                <ArrowUpRight
                  size={15}
                  className="text-text-muted group-hover:text-text-primary transition-colors"
                />
              </div>
              <p
                className="font-body font-semibold text-text-primary leading-none"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: stat.accent }}
              >
                {stat.value}
              </p>
              <p className="text-text-muted mt-1.5 font-medium" style={{ fontSize: 'clamp(0.75rem, 0.85vw, 0.875rem)' }}>
                {stat.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3
          className="text-text-primary font-medium mb-4"
          style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}
        >
          Ações rápidas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          {[
            { href: '/admin/blog', label: 'Novo artigo', desc: 'Publicar conteúdo editorial', icon: FileText, color: '#3b82f6' },
            { href: '/admin/products', label: 'Novo produto', desc: 'Adicionar ebook ou curso', icon: Package, color: '#a855f7' },
            { href: '/admin/testimonials', label: 'Novo depoimento', desc: 'Adicionar história de cliente', icon: MessageSquare, color: '#10b981' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-4 p-4 lg:p-5 rounded-2xl border border-white/5 bg-surface hover:border-white/10 hover:bg-white/3 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}
              >
                <Plus size={15} style={{ color: action.color }} />
              </div>
              <div>
                <p
                  className="text-text-primary font-medium group-hover:text-accent transition-colors"
                  style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.9rem)' }}
                >
                  {action.label}
                </p>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.78rem)' }}>
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">

        {/* Recent posts */}
        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 lg:px-6 py-4 lg:py-5 border-b border-white/5">
            <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}>
              Artigos recentes
            </h3>
            <Link
              href="/admin/blog"
              className="text-text-muted hover:text-accent transition-colors flex items-center gap-1"
              style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.78rem)' }}
            >
              Ver todos <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-white/4">
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center gap-4 px-5 lg:px-6 py-3.5 lg:py-4 hover:bg-white/2 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <FileText size={13} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-text-secondary font-medium truncate"
                    style={{ fontSize: 'clamp(0.8rem, 0.9vw, 0.875rem)' }}
                  >
                    {post.title}
                  </p>
                  <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.75rem)' }}>
                    {post.category} · {post.readTime}min leitura
                  </p>
                </div>
                {post.featured && (
                  <span
                    className="text-accent border border-accent/20 bg-accent/5 px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ fontSize: 'clamp(0.62rem, 0.72vw, 0.7rem)' }}
                  >
                    Destaque
                  </span>
                )}
              </div>
            ))}
            {posts.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-text-muted" style={{ fontSize: 'clamp(0.78rem, 0.9vw, 0.875rem)' }}>
                  Nenhum artigo ainda.
                </p>
                <Link href="/admin/blog" className="text-accent hover:underline mt-2 block" style={{ fontSize: 'clamp(0.78rem, 0.9vw, 0.875rem)' }}>
                  Criar o primeiro →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent leads */}
        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 lg:px-6 py-4 lg:py-5 border-b border-white/5">
            <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}>
              Últimos leads
            </h3>
            <Link
              href="/admin/leads"
              className="text-text-muted hover:text-accent transition-colors flex items-center gap-1"
              style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.78rem)' }}
            >
              Ver todos <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-white/4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 px-5 lg:px-6 py-3.5 lg:py-4 hover:bg-white/2 transition-colors">
                <div
                  className="w-8 h-8 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0 text-accent font-semibold uppercase"
                  style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.75rem)' }}
                >
                  {lead.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-text-secondary font-medium"
                    style={{ fontSize: 'clamp(0.8rem, 0.9vw, 0.875rem)' }}
                  >
                    {lead.name}
                  </p>
                  <p className="text-text-muted mt-0.5 truncate" style={{ fontSize: 'clamp(0.68rem, 0.78vw, 0.75rem)' }}>
                    {lead.email || lead.whatsapp}
                  </p>
                </div>
                <span className="text-text-muted flex-shrink-0" style={{ fontSize: 'clamp(0.65rem, 0.75vw, 0.72rem)' }}>
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-text-muted" style={{ fontSize: 'clamp(0.78rem, 0.9vw, 0.875rem)' }}>
                  Nenhum lead ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
