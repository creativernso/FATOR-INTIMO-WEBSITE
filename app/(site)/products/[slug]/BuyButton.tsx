'use client';

import { useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';

export default function BuyButton({ productId, label = 'Comprar agora' }: { productId: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Erro ao iniciar pagamento.');
        setLoading(false);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-medium py-4 px-8 rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 text-base"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
        {loading ? 'Redirecionando...' : label}
      </button>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
