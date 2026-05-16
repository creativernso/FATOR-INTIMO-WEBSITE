import Link from 'next/link';
import { Youtube, Instagram, Facebook } from 'lucide-react';
import LogoImage from './LogoImage';
import { getLocale, createT } from '@/lib/i18n';

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.17 8.17 0 0 0 4.78 1.52V6.82a4.85 4.85 0 0 1-1.01-.13z" />
    </svg>
  );
}

const socialLinks = [
  { href: 'https://www.youtube.com/@fatorintimo', icon: Youtube, label: 'YouTube', color: 'hover:text-red-500' },
  { href: 'https://www.instagram.com/fatorintimo/', icon: Instagram, label: 'Instagram', color: 'hover:text-pink-400' },
  { href: 'https://www.facebook.com/profile.php?id=61584890526784', icon: Facebook, label: 'Facebook', color: 'hover:text-blue-400' },
  { href: 'https://www.tiktok.com/@fatorintimo', icon: TikTokIcon, label: 'TikTok', color: 'hover:text-white' },
];

export default async function Footer() {
  const locale = await getLocale();
  const t = createT(locale);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/products', label: t('nav.products') },
    { href: '/testimonials', label: t('nav.stories') },
    { href: '/guia', label: t('nav.guides') },
  ];

  const legalLinks = [
    { href: '/legal/privacidade', label: 'Privacidade' },
    { href: '/legal/termos', label: 'Termos & Condições' },
    { href: '/legal/cookies', label: 'Cookies' },
    { href: '/legal/aviso-legal', label: 'Aviso Legal' },
    { href: '/legal/reembolsos', label: 'Reembolsos' },
    { href: '/legal/diretrizes-comunidade', label: 'Diretrizes da Comunidade' },
    { href: '/legal/direitos-autorais', label: 'Direitos Autorais' },
  ];

  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-block mb-5">
              <LogoImage height={26} />
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs mb-6">
              {t('footer.brand_description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-text-muted ${s.color} hover:border-white/20 transition-all`}
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="md:col-span-2">
            <h4 className="text-text-primary text-xs font-medium tracking-widest uppercase mb-5">{t('footer.nav_heading')}</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-secondary text-sm hover:text-text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-3">
            <h4 className="text-text-primary text-xs font-medium tracking-widest uppercase mb-5">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-secondary text-sm hover:text-text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="text-text-primary text-xs font-medium tracking-widest uppercase mb-5">{t('footer.cta_heading')}</h4>
            <p className="text-text-secondary text-sm mb-5 leading-relaxed">{t('footer.cta_description')}</p>
            <Link
              href="/guia"
              className="inline-block text-sm px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-medium transition-all"
            >
              {t('footer.cta_button')}
            </Link>
            <div className="mt-6">
              <h4 className="text-text-primary text-xs font-medium tracking-widest uppercase mb-3">{t('footer.youtube_heading')}</h4>
              <a
                href="https://www.youtube.com/@fatorintimo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-red-500 transition-colors"
              >
                <Youtube size={14} /> @fatorintimo
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">© {new Date().getFullYear()} Fator Íntimo. {t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`text-text-muted text-xs ${s.color} transition-colors`}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
