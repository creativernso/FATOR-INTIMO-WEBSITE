'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Youtube, Instagram, Facebook } from 'lucide-react';
import LogoImage from './LogoImage';
import ThemeToggle from './ThemeToggle';

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.17 8.17 0 0 0 4.78 1.52V6.82a4.85 4.85 0 0 1-1.01-.13z" />
    </svg>
  );
}

const socialLinks = [
  { href: 'https://www.youtube.com/@fatorintimo', icon: Youtube, label: 'YouTube' },
  { href: 'https://www.instagram.com/fatorintimo/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.facebook.com/profile.php?id=61584890526784', icon: Facebook, label: 'Facebook' },
  { href: 'https://www.tiktok.com/@fatorintimo', icon: TikTokIcon, label: 'TikTok' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const pathname = usePathname();
  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/about', label: 'Sobre' },
    { href: '/blog', label: 'Artigos' },
    { href: '/products', label: 'Produtos' },
    { href: '/guia', label: 'Guias' },
    { href: '/comunidade', label: 'Comunidade' },
    { href: '/testimonials', label: 'Histórias' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const read = () => setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const glassNav = scrolled || theme === 'light';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        glassNav ? 'glass-dark border-b border-white/5 py-3' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="block lg:hidden"><LogoImage height={18} /></span>
            <span className="hidden lg:block"><LogoImage height={18} /></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors duration-200 whitespace-nowrap ${
                  pathname === link.href ? 'text-accent' : 'text-text-primary hover:text-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: socials + language + CTA */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-text-secondary hover:text-accent transition-colors"
              >
                <s.icon size={15} />
              </a>
            ))}
            <ThemeToggle />
            <Link
              href="/comunidade"
              className="ml-1 text-sm px-5 py-2 rounded-full bg-accent hover:bg-accent-hover text-white font-medium transition-all hover:shadow-lg hover:shadow-accent/20 whitespace-nowrap"
            >
              Comunidade Íntima
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-400 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'var(--mobile-menu-bg)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-7">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-heading text-3xl font-light tracking-wide transition-colors ${
                pathname === link.href ? 'text-accent' : 'text-text-primary hover:text-accent'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/comunidade"
            className="mt-2 text-sm px-8 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
          >
            Comunidade Íntima
          </Link>
          <div className="flex items-center gap-5 mt-2">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent transition-colors"
              >
                <s.icon size={20} />
              </a>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
