import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import { Product } from '@/lib/types';

interface Props {
  product: Product;
  featured?: boolean;
}

export default function ProductCard({ product, featured = false }: Props) {
  if (featured) {
    return (
      <div className="relative group rounded-2xl overflow-hidden border border-white/5 bg-surface hover:border-accent/20 transition-all duration-500">
        {product.originalPrice && (
          <div className="absolute top-4 right-4 z-10 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
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
        <div className="p-6">
          <span className="text-xs text-text-muted tracking-widest uppercase mb-2 block">
            {product.category}
          </span>
          <h3 className="font-heading text-2xl font-medium text-text-primary mb-2">
            {product.title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed italic mb-4">
            &ldquo;{product.hook}&rdquo;
          </p>
          <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-end justify-between">
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
              href={product.checkoutUrl}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-accent/20"
            >
              Comprar agora
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-surface hover:border-white/10 transition-all group">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image src={product.coverImage} alt={product.title} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-heading text-base font-medium text-text-primary group-hover:text-accent transition-colors">
          {product.title}
        </h4>
        <p className="text-text-secondary text-xs mb-2 line-clamp-1">{product.hook}</p>
        <div className="flex items-center justify-between">
          <span className="text-accent text-sm font-medium">R$ {product.price},00</span>
          <Link
            href={product.checkoutUrl}
            className="text-xs text-text-secondary hover:text-accent transition-colors flex items-center gap-1"
          >
            Comprar <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
