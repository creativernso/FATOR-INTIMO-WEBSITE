import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';

interface Props {
  product: Product;
  featured?: boolean;
}

export default function ProductCard({ product }: Props) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group rounded-2xl border border-white/5 bg-surface p-3 transition-all duration-500 hover:border-accent/20">

      {/* Cover — portrait */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-surface">
        <Image
          src={product.coverImage}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {discount && (
          <div className="absolute top-3 right-3 bg-accent text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-full tracking-wide">
            {discount}% OFF
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="px-1 pb-1">
        <p className="text-accent text-[0.62rem] tracking-[0.2em] uppercase mb-1.5 font-medium">
          {product.category}
        </p>
        <h2 className="font-heading text-base md:text-lg font-medium text-text-primary leading-snug mb-3 line-clamp-2">
          {product.title}
        </h2>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-accent/70 text-xs line-through">
                R${product.originalPrice}
              </span>
            )}
            <span className="font-heading text-lg font-medium text-text-primary">
              R${product.price}<span className="text-sm">,00</span>
            </span>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3.5 py-2 rounded-full transition-all whitespace-nowrap"
          >
            Ver produto <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
