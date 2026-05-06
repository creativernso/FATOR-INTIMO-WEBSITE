import Link from 'next/link';
import { FileText, Package, MessageSquare, Users, ArrowRight } from 'lucide-react';
import { getPosts, getProducts, getTestimonials, getLeads } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const posts = getPosts();
  const products = getProducts();
  const testimonials = getTestimonials();
  const leads = getLeads();

  const stats = [
    { label: 'Artigos', value: posts.length, icon: FileText, href: '/admin/blog', color: 'text-blue-400' },
    { label: 'Produtos', value: products.length, icon: Package, href: '/admin/products', color: 'text-purple-400' },
    { label: 'Depoimentos', value: testimonials.length, icon: MessageSquare, href: '/admin/testimonials', color: 'text-green-400' },
    { label: 'Leads', value: leads.length, icon: Users, href: '/admin/leads', color: 'text-accent' },
  ];

  const recentLeads = leads.slice(-5).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-text-primary text-xl font-medium mb-1">Visão Geral</h2>
        <p className="text-text-muted text-sm">Gerencie todo o conteúdo do Fator Íntimo.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-white/5 bg-surface p-5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <stat.icon size={18} className={stat.color} />
              <ArrowRight size={13} className="text-text-muted group-hover:text-text-primary transition-colors" />
            </div>
            <p className="font-heading text-3xl font-medium text-text-primary">{stat.value}</p>
            <p className="text-text-muted text-xs mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-text-primary text-sm font-medium mb-4">Ações rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { href: '/admin/blog', label: '+ Novo artigo', desc: 'Publicar conteúdo' },
            { href: '/admin/products', label: '+ Novo produto', desc: 'Adicionar ebook' },
            { href: '/admin/testimonials', label: '+ Novo depoimento', desc: 'Adicionar história' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="p-4 rounded-xl border border-white/5 bg-surface hover:border-accent/20 transition-all group"
            >
              <p className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors">
                {action.label}
              </p>
              <p className="text-text-muted text-xs mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent posts */}
        <div className="rounded-xl border border-white/5 bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary text-sm font-medium">Artigos recentes</h3>
            <Link href="/admin/blog" className="text-text-muted text-xs hover:text-accent transition-colors">
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {posts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <FileText size={13} className="text-text-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-secondary text-xs truncate">{post.title}</p>
                  <p className="text-text-muted text-xs">{post.category} · {post.readTime}min</p>
                </div>
                {post.featured && (
                  <span className="text-xs text-accent border border-accent/20 px-2 py-0.5 rounded-full flex-shrink-0">
                    Destaque
                  </span>
                )}
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-text-muted text-xs py-4 text-center">Nenhum artigo ainda.</p>
            )}
          </div>
        </div>

        {/* Recent leads */}
        <div className="rounded-xl border border-white/5 bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary text-sm font-medium">Últimos leads</h3>
            <Link href="/admin/leads" className="text-text-muted text-xs hover:text-accent transition-colors">
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs text-accent flex-shrink-0">
                  {lead.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-secondary text-xs">{lead.name}</p>
                  <p className="text-text-muted text-xs truncate">{lead.email || lead.whatsapp}</p>
                </div>
                <span className="text-text-muted text-xs">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <p className="text-text-muted text-xs py-4 text-center">Nenhum lead ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
