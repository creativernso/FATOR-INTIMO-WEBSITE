'use client';

import { useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';

export default function CopyReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
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
  );
}
