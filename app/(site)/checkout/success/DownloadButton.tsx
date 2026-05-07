'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function DownloadButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/download?session_id=${sessionId}`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        setError('O download ainda está sendo preparado. Verifique o seu email.');
      }
    } catch {
      setError('Erro ao gerar o link. Verifique o seu email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-medium py-4 px-8 rounded-xl transition-all hover:shadow-xl hover:shadow-accent/25 text-base"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        {loading ? 'Gerando link...' : 'Baixar agora'}
      </button>
      {error && (
        <p className="text-text-muted text-xs text-center leading-relaxed">{error}</p>
      )}
    </div>
  );
}
