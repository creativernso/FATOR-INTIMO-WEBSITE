import type { Metadata } from 'next';
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
  const products = await getProducts();

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-20 px-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(254,0,80,0.07) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-2xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-[0.3em] uppercase mb-5 block">
              Produtos
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-light text-text-primary mb-6 leading-[1.05]">
              Ferramentas de{' '}
              <span style={{ color: '#fe0050' }}>transformação</span>
            </h1>
            <p className="text-text-muted text-sm tracking-wide max-w-md mx-auto leading-relaxed">
              Materiais profundos para quem quer resultados reais, não conteúdo raso.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Product grid */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-text-muted text-sm tracking-wide">Produtos em breve.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {products.map((product, i) => {
                const discount = product.originalPrice
                  ? Math.round((1 - product.price / product.originalPrice) * 100)
                  : null;

                return (
                  <AnimateOnScroll key={product.id} delay={i * 60}>
                    <Link href={`/products/${product.slug}`} className="group block">
                      {/* Cover — portrait */}
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 border border-white/6 bg-surface">
                        <Image
                          src={product.coverImage}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        {/* Subtle gradient at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Discount badge */}
                        {discount && (
                          <div className="absolute top-3 right-3 bg-accent text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-full tracking-wide">
                            {discount}% OFF
                          </div>
                        )}

                        {/* Hover overlay with CTA */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5">
                          <span className="flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-4 py-2 rounded-full tracking-wide">
                            Ver produto
                          </span>
                        </div>
                      </div>

                      {/* Info below image */}
                      <div className="px-0.5">
                        <p className="text-accent text-[0.62rem] tracking-[0.2em] uppercase mb-1.5 font-medium">
                          {product.category}
                        </p>
                        <h2 className="font-heading text-base md:text-lg font-medium text-text-primary leading-snug mb-2.5 group-hover:text-accent transition-colors duration-200 line-clamp-2">
                          {product.title}
                        </h2>
                        <div className="flex items-center gap-2">
                          {product.originalPrice && (
                            <span className="text-text-muted text-xs line-through">
                              R${product.originalPrice}
                            </span>
                          )}
                          <span className="font-heading text-lg font-medium text-text-primary">
                            R${product.price}<span className="text-sm">,00</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </AnimateOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Guarantee strip */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="rounded-2xl border border-white/5 bg-surface p-10 text-center">
              <div className="w-12 h-12 rounded-full border border-accent/20 bg-accent/5 flex items-center justify-center mx-auto mb-4 text-lg">
                🛡️
              </div>
              <h2 className="font-heading text-2xl font-medium text-text-primary mb-2">
                Garantia incondicional de 7 dias
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
                Se por qualquer motivo o produto não transformar sua perspectiva, devolvemos 100% do valor. Sem perguntas, sem burocracia.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
