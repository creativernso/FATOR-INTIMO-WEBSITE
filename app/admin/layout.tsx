'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Package,
  MessageSquare,
  ExternalLink,
  Users,
  ShoppingBag,
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquare },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/login') return <>{children}</>;

  const currentPage = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );

  return (
    <div className="min-h-screen flex bg-background" style={{ fontFamily: 'var(--font-inter)' }}>

      {/* Sidebar */}
      <aside
        className="admin-sidebar w-[72px] lg:w-[260px] flex-shrink-0 flex flex-col border-r border-white/5 relative admin-chrome"
      >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-white/5 flex items-center gap-3 min-h-[72px] lg:min-h-[80px]">
          <div
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10"
            style={{ background: 'var(--logo-bg)' }}
          >
            <Image src="/FAV.png" alt="Fator Íntimo" width={22} height={22} className="object-contain" />
          </div>
          <div className="hidden lg:block leading-none">
            <span className="font-body text-sm font-medium block tracking-wide text-text-primary">Fator Íntimo</span>
            <span className="text-[11px] tracking-widest uppercase mt-0.5 block text-text-muted">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 lg:p-4 space-y-1 pt-4">
          <p className="hidden lg:block text-[10px] tracking-widest uppercase px-3 mb-3 text-text-muted opacity-60">
            Navegação
          </p>
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full" />
                )}
                <item.icon size={16} className="flex-shrink-0" />
                <span className="hidden lg:block font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 lg:p-4 border-t border-white/5 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <ExternalLink size={15} className="flex-shrink-0" />
            <span className="hidden lg:block">Ver site</span>
          </Link>
          <div className="hidden lg:block">
            <LogoutButton />
          </div>
          <div className="lg:hidden flex justify-center">
            <LogoutButton iconOnly />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="admin-chrome flex-shrink-0 border-b border-white/5 px-6 lg:px-10 flex items-center justify-between min-h-[72px] lg:min-h-[80px]"
        >
          <div className="flex items-center gap-3">
            <div>
              <h1
                className="font-body font-medium leading-none text-text-primary"
                style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)' }}
              >
                {currentPage?.label ?? 'Admin'}
              </h1>
              <p className="text-text-muted mt-0.5" style={{ fontSize: 'clamp(0.7rem, 0.85vw, 0.8rem)' }}>
                Fator Íntimo · Painel de gestão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-text-muted" style={{ fontSize: 'clamp(0.65rem, 0.75vw, 0.75rem)' }}>
                Online
              </span>
            </div>
            <ThemeToggle />
            <div
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-accent/30 flex items-center justify-center text-accent font-semibold flex-shrink-0"
              style={{ background: 'radial-gradient(circle, rgba(254,0,80,0.15), transparent)', fontSize: 'clamp(0.7rem, 0.85vw, 0.8rem)' }}
            >
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto" style={{ padding: 'clamp(1.25rem, 2.5vw, 2.5rem)' }}>
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
