'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder: 'posts' | 'products' | 'testimonials';
  label?: string;
  aspect?: 'video' | 'square' | 'portrait';
}

async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 1400;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
      if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('conversion failed'))),
        'image/webp',
        0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('load failed')); };
    img.src = objectUrl;
  });
}

export default function ImageUpload({ value, onChange, folder, label, aspect = 'video' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
  const aspectClass = aspect === 'square' ? 'aspect-square' : aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-video';

  const processFile = useCallback(async (file: File) => {
    setError('');
    if (!ALLOWED.includes(file.type)) { setError('Formato inválido. Use JPG, PNG ou WEBP.'); return; }
    if (file.size > 15 * 1024 * 1024) { setError('Imagem muito grande. Máximo 15MB.'); return; }
    setUploading(true);
    try {
      const blob = await optimizeImage(file);
      const fd = new FormData();
      fd.append('file', blob, 'image.webp');
      fd.append('folder', folder);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('upload failed');
      const { url } = await res.json();
      onChange(url);
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      {label && <label className="text-text-muted text-xs mb-1.5 block">{label}</label>}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-surface">
          <div className={`relative w-full ${aspectClass}`}>
            <Image src={value} alt="Preview" fill className="object-cover" unoptimized sizes="600px" />
          </div>
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg transition-all"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? 'Enviando...' : 'Trocar'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={uploading}
              className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-400 text-xs px-3 py-2 rounded-lg transition-all"
            >
              <X size={12} /> Remover
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative w-full ${aspectClass} rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 select-none ${
            uploading
              ? 'border-white/10 bg-surface cursor-default'
              : dragOver
              ? 'border-accent/50 bg-accent/5 shadow-lg shadow-accent/10'
              : 'border-white/10 hover:border-white/25 hover:bg-white/2'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Loader2 size={20} className="text-accent animate-spin" />
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-text-secondary text-xs font-medium">Otimizando e enviando...</p>
                <p className="text-text-muted text-xs">Aguarde um momento</p>
              </div>
            </>
          ) : (
            <>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${dragOver ? 'bg-accent/20 scale-110' : 'bg-white/5'}`}>
                {dragOver
                  ? <Upload size={18} className="text-accent" />
                  : <ImageIcon size={18} className="text-text-muted" />}
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-text-secondary text-xs font-medium">
                  {dragOver ? 'Solte a imagem aqui' : 'Arraste ou clique para enviar'}
                </p>
                <p className="text-text-muted text-xs">JPG · PNG · WEBP · Máx. 15MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
