import Link from 'next/link';
import { ArrowRight, Youtube, Instagram, Facebook } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import TypewriterText from '@/components/TypewriterText';
import BlogCard from '@/components/BlogCard';
import ProductCard from '@/components/ProductCard';
import TestimonialCard from '@/components/TestimonialCard';
import { getPosts, getProducts, getTestimonials } from '@/lib/db';
import { getLatestVideos } from '@/lib/youtube';

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.17 8.17 0 0 0 4.78 1.52V6.82a4.85 4.85 0 0 1-1.01-.13z" />
    </svg>
  );
}

export const dynamic = 'force-dynamic';

const painPoints = [
  {
    icon: '◦',
    text: 'Sente que as pessoas perdem o interesse rapidamente, sem entender o porquê',
  },
  {
    icon: '◦',
    text: 'Você se dedica demais e recebe de volta muito pouco ou nada',
  },
  {
    icon: '◦',
    text: 'Repete os mesmos padrões em relacionamentos diferentes',
  },
  {
    icon: '◦',
    text: 'Confunde atração com amor, e acaba se machucando',
  },
  {
    icon: '◦',
    text: 'Sente que não sabe como se comunicar sem parecer carente ou distante',
  },
];

const principles = [
  {
    number: '01',
    title: 'Psicologia Profunda',
    desc: 'Não são dicas superficiais. São os mecanismos reais que governam atração, apego e comportamento humano.',
  },
  {
    number: '02',
    title: 'Inteligência Emocional',
    desc: 'Aprenda a ler emoções, as suas e as dos outros, com precisão e sem julgamento.',
  },
  {
    number: '03',
    title: 'Transformação Real',
    desc: 'Mudança de padrão. Não de comportamento superficial. Entenda por que você faz o que faz.',
  },
];

export default async function Home() {
  const [allPostsRaw, allProducts, allTestimonials, ytVideos] = await Promise.all([
    getPosts(),
    getProducts(),
    getTestimonials(),
    getLatestVideos(1),
  ]);
  const allPosts = allPostsRaw.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  const posts = allPosts.slice(0, 3);
  const products = allProducts.filter((p) => p.featured).slice(0, 3);
  const testimonials = allTestimonials.slice(0, 3);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative flex flex-col pt-72 md:pt-64 pb-20 md:pb-48 overflow-hidden">
        {/* Background image — desktop */}
        <div className="absolute inset-0 pointer-events-none hidden md:block hero-bg-animate"
          style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
        {/* Background image — mobile & tablet */}
        <div className="absolute inset-0 pointer-events-none block md:hidden hero-bg-animate"
          style={{ backgroundImage: 'url(/background-mobil.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto w-full px-6 text-center sm:text-left">
          <AnimateOnScroll delay={0}>
            <h1 className="font-heading font-light text-text-primary mb-8" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: '1.1' }}>
              Entenda o amor.
              <br />
              <TypewriterText text="Domine suas relações." style={{ color: '#fe0050' }} startDelay={700} />
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link
                href="/free-guide"
                className="group inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-full font-medium text-sm transition-all hover:shadow-xl hover:shadow-accent/25"
              >
                Baixar Guia Gratuito
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 text-white hover:text-white border border-white/20 hover:border-white/40 px-8 py-4 rounded-full text-sm transition-all"
              >
                Ver Produtos
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── BLOG POSTS ── */}
      {posts.length > 0 && (
        <section className="pt-10 pb-28 md:py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <span className="text-xs text-accent tracking-widest uppercase mb-3 block">Conteúdo</span>
                  <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary">
                    Artigos <span style={{ color: '#fe0050' }}>recentes</span>
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="hidden md:flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  Ver todos <ArrowRight size={14} />
                </Link>
              </div>
            </AnimateOnScroll>

            {/* ── LATEST YOUTUBE VIDEO ── */}
            {ytVideos.length > 0 && (
              <AnimateOnScroll>
                <div className="mb-10 rounded-2xl overflow-hidden border border-white/5 bg-surface">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${ytVideos[0].id}?rel=0&modestbranding=1`}
                      title={ytVideos[0].title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Youtube size={14} className="text-[#FF0000]" />
                      <span className="text-text-secondary text-xs truncate max-w-xs">{ytVideos[0].title}</span>
                    </div>
                    <a
                      href="https://www.youtube.com/@fatorintimo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      Ver canal <ArrowRight size={11} />
                    </a>
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <AnimateOnScroll key={post.id} delay={i * 100}>
                  <BlogCard post={post} featured />
                </AnimateOnScroll>
              ))}
            </div>

            {/* YouTube CTA */}
            <AnimateOnScroll>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/blog" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Ver todos os artigos →
                </Link>
                <div className="hidden sm:block w-px h-4 bg-white/10" />
                <a
                  href="https://www.youtube.com/@fatorintimo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/20 hover:border-[#FF0000]/40 text-[#FF0000] px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                >
                  <Youtube size={16} className="group-hover:scale-110 transition-transform" />
                  Ver mais conteúdos no YouTube
                </a>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* ── PROBLEM ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <span className="text-xs text-accent tracking-widest uppercase mb-4 block">O Problema</span>
              <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary mb-5">
                Você reconhece algum destes <span style={{ color: '#fe0050' }}>padrões?</span>
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto text-sm leading-relaxed">
                Se sim, não é fraqueza. São padrões programados que você pode entender e mudar.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {painPoints.map((point, i) => (
              <AnimateOnScroll key={i} delay={i * 80} direction="up">
                <div className="p-6 rounded-2xl border border-white/5 bg-surface hover:border-accent/15 transition-all duration-300">
                  <div className="w-8 h-px bg-accent mb-4" />
                  <p className="text-text-secondary text-sm leading-relaxed">{point.text}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)' }} />
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimateOnScroll direction="left">
              <div>
                <span className="text-xs text-accent tracking-widest uppercase mb-4 block">A Solução</span>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-tight mb-6">
                  Fator Íntimo é
                  <br />
                  <span style={{ color: '#fe0050' }}>psicologia que funciona</span>
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  Não é autoajuda genérica. É um sistema de compreensão profunda do comportamento humano
                  em relacionamentos, baseado em psicologia real, neurociência e anos de observação.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  Conheça a abordagem <ArrowRight size={14} />
                </Link>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right">
              <div className="space-y-5">
                {principles.map((p, i) => (
                  <div key={i} className="flex gap-5 p-5 rounded-xl border border-white/5 bg-surface">
                    <span className="font-heading text-3xl text-accent/20 font-light flex-shrink-0 leading-none">
                      {p.number}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-medium text-text-primary mb-1">{p.title}</h3>
                      <p className="text-text-secondary text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      {products.length > 0 && (
        <section className="py-28 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-14">
                <span className="text-xs text-accent tracking-widest uppercase mb-3 block">Produtos</span>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary mb-4">
                  Ferramentas de <span style={{ color: '#fe0050' }}>transformação</span>
                </h2>
                <p className="text-text-secondary text-sm max-w-lg mx-auto leading-relaxed">
                  Materiais profundos para quem quer resultados reais, não conteúdo raso.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <AnimateOnScroll key={product.id} delay={i * 100}>
                  <ProductCard product={product} featured />
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll>
              <div className="text-center mt-10">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm border border-white/10 hover:border-white/20 px-6 py-3 rounded-full text-text-secondary hover:text-text-primary transition-all"
                >
                  Ver todos os produtos <ArrowRight size={14} />
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS STRIP ── */}
      {testimonials.length > 0 && (
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <span className="text-xs text-accent tracking-widest uppercase mb-3 block">Histórias</span>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary">
                  <span style={{ color: '#fe0050' }}>Transformações</span> reais
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <AnimateOnScroll key={t.id} delay={i * 100}>
                  <TestimonialCard testimonial={t} />
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll>
              <div className="text-center mt-10">
                <Link
                  href="/testimonials"
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  Ver todas as histórias →
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* ── SOCIAL STRIP ── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-8">
              <span className="text-xs text-text-muted tracking-widest uppercase">Siga nas redes</span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { href: 'https://www.youtube.com/@fatorintimo', icon: Youtube, label: '@fatorintimo', sub: 'YouTube', color: 'hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500' },
                { href: 'https://www.instagram.com/fatorintimo/', icon: Instagram, label: '@fatorintimo', sub: 'Instagram', color: 'hover:border-pink-500/30 hover:bg-pink-500/5 hover:text-pink-400' },
                { href: 'https://www.facebook.com/profile.php?id=61584890526784', icon: Facebook, label: 'Fator Íntimo', sub: 'Facebook', color: 'hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-400' },
                { href: 'https://www.tiktok.com/@fatorintimo', icon: TikTokIcon, label: '@fatorintimo', sub: 'TikTok', color: 'hover:border-white/30 hover:bg-white/5 hover:text-white' },
              ].map((s) => (
                <a
                  key={s.sub}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 border border-white/8 bg-surface rounded-xl px-5 py-3 text-text-secondary transition-all duration-300 ${s.color}`}
                >
                  <s.icon size={18} />
                  <div className="text-left">
                    <p className="text-xs font-medium leading-none">{s.sub}</p>
                    <p className="text-xs opacity-60 mt-0.5">{s.label}</p>
                  </div>
                </a>
              ))}
              <Link
                href="/social"
                className="flex items-center gap-2 border border-white/8 bg-surface rounded-xl px-5 py-3 text-text-secondary hover:text-accent hover:border-accent/20 transition-all text-sm"
              >
                Ver tudo <ArrowRight size={13} />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <div className="relative rounded-3xl border border-white/5 bg-surface overflow-hidden p-14">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-10"
                style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)' }} />

              <span className="text-xs text-accent tracking-widest uppercase mb-5 block">Comece Agora</span>
              <h2 className="font-heading text-3xl md:text-4xl font-light text-text-primary mb-4">
                O primeiro passo é sempre
                <br />
                <span style={{ color: '#fe0050' }}>o mais importante</span>
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-md mx-auto">
                Baixe o guia gratuito <strong className="text-text-primary">7 Erros que Fazem Alguém Perder o Interesse</strong> e comece a entender os padrões invisíveis que sabotam suas relações.
              </p>
              <Link
                href="/free-guide"
                className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-9 py-4 rounded-full font-medium text-sm transition-all hover:shadow-xl hover:shadow-accent/25"
              >
                Quero o Guia Gratuito
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
