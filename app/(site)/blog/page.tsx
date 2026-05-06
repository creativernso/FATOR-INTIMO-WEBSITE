import type { Metadata } from 'next';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BlogCard from '@/components/BlogCard';
import { getPosts } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Artigos',
  description: 'Psicologia profunda sobre relacionamentos, atração e comportamento humano.',
};

export const dynamic = 'force-dynamic';

const categories = ['Todos', 'Psicologia', 'Comunicação', 'Atração', 'Autoconhecimento'];

export default async function BlogPage() {
  const posts = getPosts();
  const featured = posts.filter((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs text-accent tracking-widest uppercase mb-4 block">Conteúdo</span>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-text-primary mb-5">
              <span style={{ color: '#fe0050' }}>Artigos</span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto">
              Ideias que expandem sua forma de ver relacionamentos. Escritas para quem leva o autoconhecimento a sério.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          {posts.length === 0 ? (
            <p className="text-center text-text-muted py-20">Artigos em breve.</p>
          ) : (
            <>
              {/* Featured posts */}
              {featured.length > 0 && (
                <>
                  <AnimateOnScroll>
                    <h2 className="font-heading text-2xl font-light text-text-primary mb-6">
                      Artigos em destaque
                    </h2>
                  </AnimateOnScroll>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                    {featured.map((post, i) => (
                      <AnimateOnScroll key={post.id} delay={i * 80}>
                        <BlogCard post={post} featured />
                      </AnimateOnScroll>
                    ))}
                  </div>
                  <div className="h-px bg-white/5 mb-14" />
                </>
              )}

              {/* All posts list */}
              {rest.length > 0 && (
                <>
                  <AnimateOnScroll>
                    <h2 className="font-heading text-2xl font-light text-text-primary mb-6">
                      Todos os artigos
                    </h2>
                  </AnimateOnScroll>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    {rest.map((post, i) => (
                      <AnimateOnScroll key={post.id} delay={i * 50}>
                        <BlogCard post={post} />
                      </AnimateOnScroll>
                    ))}
                  </div>
                </>
              )}

              {rest.length === 0 && featured.length > 0 && (
                <p className="text-center text-text-muted py-4">Mais artigos em breve.</p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
