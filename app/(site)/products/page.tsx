import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { getProducts } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Ferramentas de transformação para quem quer entender e dominar seus relacionamentos.',
};

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = getProducts();

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] opacity-5 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse, #fe0050 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Loja</span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5">
              Ferramentas de <span style={{ color: '#fe0050' }}>transformação</span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto">
              Materiais desenvolvidos para quem quer resultados reais. Não conteúdo superficial.
              Psicologia profunda em formato prático e acessível.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {products.length === 0 ? (
            <p className="text-center text-text-muted py-20">
              Produtos em breve. Fique de olho.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <AnimateOnScroll key={product.id} delay={i * 80}>
                  <div className="relative group rounded-2xl overflow-hidden border border-white/5 bg-surface hover:border-accent/20 transition-all duration-500 flex flex-col">
                    {product.originalPrice && (
                      <div className="absolute top-4 right-4 z-10 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-4 left-4 z-10 border border-white/20 text-text-secondary text-xs px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">
                        Destaque
                      </div>
                    )}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={product.coverImage}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs text-text-muted tracking-widest uppercase mb-2 block">
                        {product.category}
                      </span>
                      <h2 className="font-heading text-2xl font-medium text-text-primary mb-2">
                        {product.title}
                      </h2>
                      <p className="text-text-secondary text-sm italic mb-4">
                        &ldquo;{product.hook}&rdquo;
                      </p>
                      <p className="text-text-secondary text-sm leading-relaxed mb-5 flex-1">
                        {product.description}
                      </p>
                      {product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                          {product.tags.map((tag) => (
                            <span key={tag} className="text-xs text-text-muted border border-white/5 px-2.5 py-1 rounded-full bg-background/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          {product.originalPrice && (
                            <p className="text-text-muted text-xs line-through mb-0.5">
                              R$ {product.originalPrice},00
                            </p>
                          )}
                          <p className="text-2xl font-heading font-medium text-text-primary">
                            R$ {product.price},<span className="text-sm">00</span>
                          </p>
                        </div>
                        <Link
                          href={`/products/${product.slug}`}
                          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-accent/20"
                        >
                          Ver produto
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="rounded-2xl border border-white/5 bg-surface p-10 text-center">
              <div className="w-14 h-14 rounded-full border border-accent/30 flex items-center justify-center mx-auto mb-5 text-2xl">
                🛡️
              </div>
              <h2 className="font-heading text-2xl font-medium text-text-primary mb-3">
                Garantia de 7 dias
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
                Se por qualquer motivo o produto não atender às suas expectativas, devolvemos 100%
                do valor investido. Sem perguntas, sem burocracia.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
