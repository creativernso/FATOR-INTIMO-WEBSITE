import type { Metadata } from 'next';
import { Youtube, Instagram, Facebook, ExternalLink, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { getLatestVideos } from '@/lib/youtube';

export const metadata: Metadata = {
  title: 'Redes Sociais',
  description: 'Acompanhe o Fator Íntimo no YouTube, Instagram, Facebook e TikTok.',
};

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.17 8.17 0 0 0 4.78 1.52V6.82a4.85 4.85 0 0 1-1.01-.13z" />
    </svg>
  );
}

// Sample post data — update these with real post thumbnails/links as content grows
const instagramPosts = [
  { img: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=400&q=80', url: 'https://www.instagram.com/fatorintimo/' },
  { img: 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=400&q=80', url: 'https://www.instagram.com/fatorintimo/' },
  { img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', url: 'https://www.instagram.com/fatorintimo/' },
  { img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', url: 'https://www.instagram.com/fatorintimo/' },
  { img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80', url: 'https://www.instagram.com/fatorintimo/' },
  { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', url: 'https://www.instagram.com/fatorintimo/' },
];

const tiktokPosts = [
  { img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80', title: 'Por que você atrai sempre o mesmo tipo de pessoa', views: '24k', url: 'https://www.tiktok.com/@fatorintimo' },
  { img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&q=80', title: 'O erro que faz alguém perder o interesse em 3 dias', views: '61k', url: 'https://www.tiktok.com/@fatorintimo' },
  { img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80', title: 'Teoria do apego em 60 segundos', views: '38k', url: 'https://www.tiktok.com/@fatorintimo' },
];

const facebookPosts = [
  { img: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=600&q=80', title: 'Por que pessoas inteligentes tomam decisões péssimas no amor', date: '2 dias atrás', url: 'https://www.facebook.com/profile.php?id=61584890526784' },
  { img: 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=600&q=80', title: 'O silêncio estratégico nos relacionamentos', date: '5 dias atrás', url: 'https://www.facebook.com/profile.php?id=61584890526784' },
];

export default async function SocialPage() {
  const ytVideos = await getLatestVideos(3);
  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-14 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] opacity-5 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Presença Digital</span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5">
              Redes <span style={{ color: '#fe0050' }}>Sociais</span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto">
              Todo o conteúdo do Fator Íntimo em um só lugar.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── YOUTUBE ── */}
      <section className="py-14 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center">
                  <Youtube size={17} className="text-[#FF0000]" />
                </div>
                <div>
                  <h2 className="text-text-primary font-medium text-lg">YouTube</h2>
                  <p className="text-text-muted text-xs">@fatorintimo</p>
                </div>
              </div>
              <a
                href="https://www.youtube.com/@fatorintimo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#FF0000] border border-[#FF0000]/20 hover:bg-[#FF0000]/10 px-4 py-1.5 rounded-full transition-all"
              >
                Inscrever-se <ExternalLink size={12} />
              </a>
            </div>
          </AnimateOnScroll>

          {/* Latest videos grid */}
          {ytVideos.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-surface p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center mx-auto mb-4">
                <Youtube size={20} className="text-[#FF0000]" />
              </div>
              <p className="text-text-primary text-sm font-medium mb-1">Em breve por aqui</p>
              <p className="text-text-muted text-xs mb-5 leading-relaxed max-w-xs mx-auto">
                Os primeiros vídeos do canal estão a caminho. Inscreva-se para ser notificado assim que chegarem.
              </p>
              <a
                href="https://www.youtube.com/@fatorintimo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#FF0000] border border-[#FF0000]/20 hover:bg-[#FF0000]/10 px-5 py-2 rounded-full transition-all"
              >
                Inscrever-se no canal <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {ytVideos.map((video, i) => (
                <AnimateOnScroll key={video.id} delay={i * 80}>
                  <div className="rounded-2xl overflow-hidden border border-white/5 bg-surface flex flex-col">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    <div className="px-4 py-3 border-t border-white/5">
                      <p className="text-text-secondary text-xs line-clamp-2">{video.title}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="py-14 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Instagram size={17} className="text-pink-400" />
                </div>
                <div>
                  <h2 className="text-text-primary font-medium text-lg">Instagram</h2>
                  <p className="text-text-muted text-xs">@fatorintimo</p>
                </div>
              </div>
              <a
                href="https://www.instagram.com/fatorintimo/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-pink-400 border border-pink-500/20 hover:bg-pink-500/10 px-4 py-1.5 rounded-full transition-all"
              >
                Seguir <ExternalLink size={12} />
              </a>
            </div>
          </AnimateOnScroll>

          {/* Instagram grid */}
          <div className="grid grid-cols-3 gap-1.5 md:gap-2 rounded-2xl overflow-hidden border border-white/5">
            {instagramPosts.map((post, i) => (
              <AnimateOnScroll key={i} delay={i * 60}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square block overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.img}
                    alt="Instagram post"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <Instagram size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll>
            <div className="mt-5 text-center">
              <a
                href="https://www.instagram.com/fatorintimo/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-pink-400 transition-colors"
              >
                Ver perfil completo <ArrowRight size={13} />
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── TIKTOK ── */}
      <section className="py-14 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <TikTokIcon size={17} />
                </div>
                <div>
                  <h2 className="text-text-primary font-medium text-lg">TikTok</h2>
                  <p className="text-text-muted text-xs">@fatorintimo</p>
                </div>
              </div>
              <a
                href="https://www.tiktok.com/@fatorintimo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary border border-white/10 hover:bg-white/5 px-4 py-1.5 rounded-full transition-all"
              >
                Seguir <ExternalLink size={12} />
              </a>
            </div>
          </AnimateOnScroll>

          {/* TikTok grid — portrait cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tiktokPosts.map((post, i) => (
              <AnimateOnScroll key={i} delay={i * 80}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl overflow-hidden border border-white/5 bg-surface hover:border-white/15 transition-all"
                >
                  <div className="relative" style={{ paddingBottom: '177%' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.img}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {/* Play */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/25 transition-all">
                        <Play size={16} className="text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    {/* Views */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <Play size={11} className="text-white/70 fill-white/70" />
                      <span className="text-white/80 text-xs font-medium">{post.views}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-text-secondary text-xs leading-snug line-clamp-2">{post.title}</p>
                  </div>
                </a>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll>
            <div className="mt-5 text-center">
              <a
                href="https://www.tiktok.com/@fatorintimo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Ver perfil completo <ArrowRight size={13} />
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── FACEBOOK ── */}
      <section className="py-14 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Facebook size={17} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-text-primary font-medium text-lg">Facebook</h2>
                  <p className="text-text-muted text-xs">Fator Íntimo</p>
                </div>
              </div>
              <a
                href="https://www.facebook.com/profile.php?id=61584890526784"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 px-4 py-1.5 rounded-full transition-all"
              >
                Curtir página <ExternalLink size={12} />
              </a>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facebookPosts.map((post, i) => (
              <AnimateOnScroll key={i} delay={i * 80}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 p-4 rounded-xl border border-white/5 bg-surface hover:border-blue-500/15 hover:bg-blue-500/5 transition-all"
                >
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Facebook size={10} className="text-blue-400" />
                      </div>
                      <span className="text-text-muted text-xs">Fator Íntimo</span>
                    </div>
                    <h3 className="text-text-primary text-sm font-medium leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors mb-1">
                      {post.title}
                    </h3>
                    <p className="text-text-muted text-xs">{post.date}</p>
                  </div>
                </a>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll>
            <div className="mt-5 text-center">
              <a
                href="https://www.facebook.com/profile.php?id=61584890526784"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-blue-400 transition-colors"
              >
                Ver página completa <ArrowRight size={13} />
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 pb-28 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="relative rounded-2xl border border-white/5 bg-surface p-10 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <h2 className="font-heading text-2xl md:text-3xl font-light text-text-primary mb-3">
                Quer ir mais fundo?
              </h2>
              <p className="text-text-secondary text-sm mb-7 leading-relaxed max-w-md mx-auto">
                Além das redes sociais, temos artigos, guias e produtos para transformação real.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/free-guide" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full text-sm font-medium transition-all">
                  Guia Gratuito
                </Link>
                <Link href="/blog" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-6 py-3 rounded-full text-sm transition-all">
                  Ler Artigos
                </Link>
                <Link href="/products" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-6 py-3 rounded-full text-sm transition-all">
                  Ver Produtos
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
