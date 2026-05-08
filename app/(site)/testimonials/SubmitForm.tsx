'use client';

import { useState, useRef } from 'react';
import { Send, Loader, Eye, EyeOff, Upload, X, Star, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PRODUCTS = [
  'Por Que o Amor Falha Hoje e Como Salvá-lo',
  'Blog / Artigos',
  'Guia Gratuito',
  'Outro',
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={`transition-colors ${(hover || value) >= star ? 'text-accent fill-accent' : 'text-white/20'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function SubmitForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [age, setAge] = useState('');
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [transformation, setTransformation] = useState('');
  const [rating, setRating] = useState(5);
  const [product, setProduct] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Apenas imagens são permitidas.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Imagem deve ter no máximo 5MB.'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError('Escreva seu depoimento.'); return; }
    if (!anonymous && !name.trim()) { setError('Informe seu nome ou marque anônimo.'); return; }
    setSending(true);
    setError('');

    let avatarUrl: string | undefined;

    if (photoFile && !anonymous) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', photoFile);
        const res = await fetch('/api/testimonials/upload-photo', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) avatarUrl = data.url;
      } catch { /* photo upload failed silently */ }
      setUploading(false);
    }

    try {
      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          age: age ? Number(age) : undefined,
          headline: headline.trim(),
          content: content.trim(),
          transformation: transformation.trim(),
          rating,
          productPurchased: product,
          socialHandle: socialHandle.trim(),
          anonymous,
          avatar: avatarUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.error || 'Erro ao enviar.');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-6">
        <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="font-heading text-3xl font-light text-text-primary mb-3">
          História recebida.
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Obrigado por compartilhar. Sua história será revisada e, se aprovada, publicada em breve.
        </p>
        <button
          onClick={() => router.push('/testimonials')}
          className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-6 py-3 rounded-full text-sm transition-all"
        >
          Ver histórias publicadas
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 px-6 pb-28">

      {/* Anonymous toggle */}
      <div
        onClick={() => setAnonymous((v) => !v)}
        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all select-none ${
          anonymous
            ? 'bg-accent/8 border-accent/25 text-accent'
            : 'border-white/8 hover:border-white/15 text-text-muted'
        }`}
      >
        <div className="flex items-center gap-3">
          {anonymous ? <EyeOff size={16} /> : <Eye size={16} />}
          <div>
            <p className="text-sm font-medium" style={{ color: anonymous ? 'inherit' : 'var(--color-text-primary)' }}>
              Publicar anonimamente
            </p>
            <p className="text-xs opacity-70 mt-0.5">
              {anonymous ? 'Seu nome e foto não serão exibidos publicamente.' : 'Sua identidade ficará visível.'}
            </p>
          </div>
        </div>
        <div className={`w-10 h-5 rounded-full transition-colors relative ${anonymous ? 'bg-accent' : 'bg-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
      </div>

      {/* Identity */}
      {!anonymous && (
        <div className="space-y-4">
          <p className="text-text-muted text-xs tracking-widest uppercase">Sua identidade</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-xs mb-1.5">Nome *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1.5">Profissão (opcional)</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Psicóloga, Designer..."
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1.5">Idade (opcional)</label>
              <input type="number" min={16} max={99} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex: 28"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1.5">@ Rede social (opcional)</label>
              <input type="text" value={socialHandle} onChange={(e) => setSocialHandle(e.target.value)} placeholder="@seuperfil"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-text-muted text-xs mb-2">Foto de perfil (opcional)</label>
            {photoPreview ? (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="preview" className="w-14 h-14 rounded-full object-cover border border-white/10" />
                <button type="button" onClick={removePhoto}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors">
                  <X size={12} /> Remover
                </button>
              </div>
            ) : (
              <>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border border-white/8 hover:border-accent/30 text-text-muted hover:text-accent px-4 py-2.5 rounded-xl text-sm transition-all">
                  <Upload size={13} /> Enviar foto
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Story */}
      <div className="space-y-4">
        <p className="text-text-muted text-xs tracking-widest uppercase">Sua história</p>
        <div>
          <label className="block text-text-muted text-xs mb-1.5">Título da sua história (opcional)</label>
          <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
            placeholder="Ex: Como parei de sabotar meus relacionamentos"
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1.5">Depoimento / História completa *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={7} required
            placeholder="Conte sua experiência, o que mudou, como você se sentia antes e depois..."
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors resize-none leading-relaxed" />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1.5">Transformação principal (opcional)</label>
          <input type="text" value={transformation} onChange={(e) => setTransformation(e.target.value)}
            placeholder="Ex: Entendi por que eu afastava as pessoas e mudei isso."
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
      </div>

      {/* Context */}
      <div className="space-y-4">
        <p className="text-text-muted text-xs tracking-widest uppercase">Contexto</p>
        <div>
          <label className="block text-text-muted text-xs mb-2">Relacionado a qual conteúdo?</label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((p) => (
              <button key={p} type="button" onClick={() => setProduct(p === product ? '' : p)}
                className={`px-3.5 py-2 rounded-full text-xs border transition-all ${
                  product === p ? 'bg-accent/10 border-accent/30 text-accent' : 'border-white/8 text-text-muted hover:border-white/20'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-2">Avaliação</label>
          <StarRating value={rating} onChange={setRating} />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3 border border-red-400/20">{error}</p>
      )}

      <button type="submit" disabled={sending || !content.trim()}
        className="w-full flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-4 rounded-2xl font-medium text-sm transition-all">
        {sending ? (
          <><Loader size={15} className="animate-spin" /> {uploading ? 'Enviando foto...' : 'Enviando...'}</>
        ) : (
          <><Send size={15} /> Enviar minha história</>
        )}
      </button>

      <p className="text-text-muted text-xs text-center leading-relaxed">
        Seu depoimento será revisado antes da publicação. Respeitamos sua privacidade.
      </p>
    </form>
  );
}
