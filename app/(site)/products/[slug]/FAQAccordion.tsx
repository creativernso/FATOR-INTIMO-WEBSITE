'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProductFAQ } from '@/lib/types';

export default function FAQAccordion({ items }: { items: ProductFAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-surface">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
          >
            <span className="text-text-primary text-sm font-medium">{item.question}</span>
            <ChevronDown
              size={16}
              className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-text-secondary text-sm leading-relaxed border-t border-white/5 pt-3">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
