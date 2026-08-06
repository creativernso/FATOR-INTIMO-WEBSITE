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
    if (file.type !== 'video/mp4' && file.type !== 'video/webm') {
      setError('Apenas vídeos MP4 ou WEBM são permitidos.');
      return;
    }
    setUploading(true);
    setError('');
    setDone(false);

    try {
      // 1) Ask for a short-lived signed URL to upload straight to storage —
      // sending the file itself through our own API route would hit
      // Vercel's ~4.5MB serverless body limit long before 60MB.
      const initRes = await fetch('/api/admin/products/upload-video/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) {
        setError(initData.error || 'Erro ao preparar upload.');
        return;
      }

      // 2) Upload the actual bytes directly to storage.
      const putRes = await fetch(initData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) {
        setError('Erro ao enviar o vídeo.');
        return;
      }

      // 3) Tell our server it's there so it can verify the real file
      // signature and make it public.
      const finalizeRes = await fetch('/api/admin/products/upload-video/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: initData.filePath }),
      });
      const finalizeData = await finalizeRes.json();
      if (finalizeRes.ok) {
        setDone(true);
        onUploaded(finalizeData.url);
      } else {
        setError(finalizeData.error || 'Erro ao validar vídeo.');
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
