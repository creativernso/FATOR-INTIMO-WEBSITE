'use client';

import { useState, useRef } from 'react';
import { Upload, Check, Loader2, Video } from 'lucide-react';

interface Props {
  onUploaded: (url: string) => void;
}

export default function UploadVideo({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    setDone(false);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/admin/products/upload-video', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        onUploaded(data.url);
      } else {
        setError(data.error || 'Erro ao fazer upload.');
      }
    } catch {
      setError('Erro de conexão.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`w-full flex items-center justify-center gap-2 border rounded-lg px-4 py-2.5 text-sm transition-all ${
          done
            ? 'border-green-400/30 text-green-400 bg-green-400/5'
            : 'border-white/10 text-text-muted hover:border-white/20 hover:text-text-primary'
        }`}
      >
        {uploading ? (
          <><Loader2 size={14} className="animate-spin" /> Enviando...</>
        ) : done ? (
          <><Check size={14} /> Vídeo enviado com sucesso</>
        ) : (
          <><Upload size={14} /> Fazer upload do vídeo</>
        )}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
        <Video size={10} /> Máx. 60MB · MP4 ou WEBM · reproduzido sem logo/marca do YouTube
      </p>
    </div>
  );
}
