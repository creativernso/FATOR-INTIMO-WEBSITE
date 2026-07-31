import type { Metadata } from 'next';
import { Mail, Youtube, Instagram, Facebook } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contato',
  description: 'Fale com o Fator Íntimo. Dúvidas sobre produtos, parcerias, suporte ou qualquer outro assunto.',
  path: '/contato',
  keywords: ['contato fator íntimo', 'suporte fator íntimo', 'fale conosco'],
});

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

export default function ContactPage() {
  return (
    <section className="pt-36 pb-28 px-6 text-center relative overflow-hidden min-h-screen">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.06) 0%, transparent 65%)' }}
      />
      <div className="relative max-w-xl mx-auto">
        <AnimateOnScroll>
          <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">Contato</span>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5 leading-[1.05]">
            Fale <span style={{ color: '#fe0050' }}>conosco</span>.
          </h1>
          <p className="text-text-secondary text-base leading-relaxed max-w-md mx-auto mb-10">
            Dúvidas sobre produtos, parcerias, suporte ou qualquer outro assunto: estamos aqui para ajudar.
          </p>

          <a
            href="mailto:contato@fatorintimo.com"
            className="inline-flex items-center gap-3 border border-accent/30 hover:bg-accent/10 text-accent px-7 py-4 rounded-2xl text-base font-medium transition-all mb-4"
          >
            <Mail size={18} />
            contato@fatorintimo.com
          </a>
          <p className="text-text-muted text-xs mb-12">Respondemos em até 2 dias úteis.</p>

          <div className="flex items-center justify-center gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={`w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-text-muted transition-colors ${s.color}`}
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
