'use client';

import { useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';

interface ProductOption {
  slug: string;
  title: string;
}

export default function ProductLinkPicker({
  baseUrl,
  code,
  products,
}: {
  baseUrl: string;
  code: string;
  products: ProductOption[];
}) {
  const [slug, setSlug] = useState(products[0]?.slug ?? '');
  const [copied, setCopied] = useState(false);

  const link = slug ? `${baseUrl}/products/${slug}?ref=${code}` : '';

  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  if (products.length === 0) return null;

  return (
    <div>
      <select
        value={slug}
        onChange={(e) => { setSlug(e.target.value); setCopied(false); }}
        className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent/40 transition-colors mb-2.5"
      >
        {products.map((p) => (
          <option key={p.slug} value={p.slug}>{p.title}</option>
        ))}
      </select>

      <button
        onClick={copy}
        className="w-full flex items-center justify-between gap-3 bg-white/4 hover:bg-white/6 border border-white/8 rounded-xl px-4 py-3.5 transition-colors text-left"
      >
        <span className="text-text-primary text-sm truncate">{link}</span>
        <span className={`flex items-center gap-1.5 text-xs font-medium flex-shrink-0 ${copied ? 'text-green-400' : 'text-accent'}`}>
          {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado' : 'Copiar'}
        </span>
      </button>
    </div>
  );
}
