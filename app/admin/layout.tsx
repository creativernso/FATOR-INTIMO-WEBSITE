'use client';

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
  ChevronRight,
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquare },
  { href: '/admin/leads', label: 'Leads', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-surface border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image src="/FAV.png" alt="Fator Íntimo" width={20} height={20} className="object-contain" />
            </div>
            <div className="leading-none">
              <span className="font-heading text-sm font-medium text-text-primary block">Fator Íntimo</span>
              <span className="text-xs text-text-muted">Admin</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <item.icon size={15} />
                {item.label}
                {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <ExternalLink size={15} />
            Ver site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              if (!isActive) return null;
              return (
                <h1 key={item.href} className="text-text-primary font-medium text-sm">
                  {item.label}
                </h1>
              );
            })}
          </div>
          <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs text-accent font-medium">
            A
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
