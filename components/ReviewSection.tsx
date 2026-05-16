'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, ThumbsUp, ShieldCheck, MapPin, Loader2, CheckCircle, X, PenLine } from 'lucide-react';
import StarRating from '@/components/StarRating';

interface Review {
  id: string;
  name: string;
  content: string;
  headline?: string;
  rating?: number;
  avatar?: string;
  photoUrl?: string;
  location?: string;
  anonymous?: boolean;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
  submittedAt?: string;
  featured?: boolean;
  adminReply?: { text: string; repliedAt: string };
}

interface Aggregate {
  avg: number;
  count: number;
  total: number;
  distribution: Record<number, number>;
}

type Sort = 'recent' | 'rating' | 'helpful';

interface Props {
  /** product slug (paid ebook) OR guide slug (free guide), exactly one */
  productSlug?: string;
  guideSlug?: string;
  /** display name of the thing being reviewed (used in headers & form) */
  productTitle: string;
  /** label tweaks for guides */
  variant?: 'product' | 'guide';
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 30 * 86400) return `há ${Math.floor(diff / 86400)} dias`;
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ReviewSection({ productSlug, guideSlug, productTitle, variant }: Props) {
  const targetType: 'product' | 'guide' = variant ?? (guideSlug ? 'guide' : 'product');
  const queryParam = productSlug
    ? `productSlug=${encodeURIComponent(productSlug)}`
    : `guideSlug=${encodeURIComponent(guideSlug ?? '')}`;
  const searchParams = useSearchParams();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>('recent');
  const [pageSize, setPageSize] = useState(5);
  const [formOpen, setFormOpen] = useState(false);
  const [prefillName, setPrefillName] = useState('');
  const [prefillEmail, setPrefillEmail] = useState('');
  const [helpfulMap, setHelpfulMap] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?${queryParam}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAggregate(data.aggregate);
    } finally {
      setLoading(false);
    }
  }, [queryParam]);

  useEffect(() => { load(); }, [load]);

  // Auto-open the form and pre-fill name/email when arriving from a review-request email
  useEffect(() => {
    const wantsToReview = searchParams?.get('review') === '1';
    const name = searchParams?.get('name') || '';
    const email = searchParams?.get('email') || '';
    if (name) setPrefillName(name);
    if (email) setPrefillEmail(email);
    if (wantsToReview) {
      setFormOpen(true);
      // Smooth-scroll to this section after mount
      setTimeout(() => {
        document.getElementById('avaliacoes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [searchParams]);

  // Restore "I've already clicked helpful" from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fi_review_helpful');
      if (stored) setHelpfulMap(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const markHelpful = async (id: string) => {
    if (helpfulMap.has(id)) return;
    const next = new Set(helpfulMap);
    next.add(id);
    setHelpfulMap(next);
    try {
      localStorage.setItem('fi_review_helpful', JSON.stringify(Array.from(next)));
    } catch {}
    // Optimistic UI bump
    setReviews((rs) =>
      rs.map((r) => (r.id === id ? { ...r, helpfulCount: (r.helpfulCount ?? 0) + 1 } : r)),
    );
    fetch(`/api/reviews/${id}/helpful`, { method: 'POST' }).catch(() => {});
  };

  const sorted = [...reviews].sort((a, b) => {
    // Featured always first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    if (sort === 'helpful') return (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0);
    return new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime();
  });
  const visible = sorted.slice(0, pageSize);

  const hasReviews = reviews.length > 0;
  const avg = aggregate?.avg ?? 0;
  const count = aggregate?.count ?? 0;
  const dist = aggregate?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxDist = Math.max(1, ...Object.values(dist));

  return (
    <section id="avaliacoes" className="py-16 px-6 border-t border-white/5 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-10">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs text-accent tracking-[0.3em] uppercase mb-3">Avaliações</p>
              <h2 className="font-heading text-3xl md:text-4xl font-light text-text-primary leading-tight">
                {hasReviews
                  ? 'O que estão falando'
                  : (targetType === 'guide' ? 'Seja o primeiro a comentar' : 'Seja o primeiro a avaliar')}
              </h2>
            </div>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-full text-sm font-medium transition-all self-start lg:self-auto whitespace-nowrap shadow-lg shadow-accent/15"
            >
              <PenLine size={14} /> {targetType === 'guide' ? 'Avaliar guia' : 'Avaliar produto'}
            </button>
          </div>

          {hasReviews && (
            <>
              {/* Summary card */}
              <div className="rounded-2xl border border-white/8 bg-surface p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12">
                {/* Big rating */}
                <div className="flex flex-col items-center lg:items-start gap-2 lg:border-r lg:border-white/8 lg:pr-12">
                  <p className="font-heading text-6xl font-light text-text-primary leading-none">
                    {avg.toFixed(1)}
                  </p>
                  <StarRating rating={avg} size={18} showCount={false} />
                  <p className="text-text-muted text-sm">
                    {count} {count === 1 ? 'avaliação' : 'avaliações'}
                  </p>
                </div>
                {/* Distribution */}
                <div className="flex flex-col gap-2 min-w-0">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const n = dist[stars] ?? 0;
                    const pct = count > 0 ? (n / count) * 100 : 0;
                    const widthPct = maxDist > 0 ? (n / maxDist) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-text-muted w-8 flex-shrink-0">
                          {stars} <Star size={11} className="text-accent fill-accent" />
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-700"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <span className="text-text-muted text-xs w-12 text-right tabular-nums">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sort tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {([
                  { id: 'recent' as Sort, label: 'Mais recentes' },
                  { id: 'rating' as Sort, label: 'Melhor nota' },
                  { id: 'helpful' as Sort, label: 'Mais úteis' },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSort(opt.id); setPageSize(5); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sort === opt.id
                        ? 'bg-accent text-white'
                        : 'bg-white/[0.03] border border-white/[0.06] text-text-muted hover:border-white/[0.1] hover:text-text-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Review list */}
              <div className="grid gap-4">
                {visible.map((r) => {
                  const displayName = r.anonymous ? 'Anônimo' : r.name;
                  const initial = (displayName?.[0] ?? '?').toUpperCase();
                  const userClicked = helpfulMap.has(r.id);
                  return (
                    <article
                      key={r.id}
                      className={`rounded-2xl border bg-surface p-5 lg:p-6 transition-all ${
                        r.featured ? 'border-accent/25 shadow-lg shadow-accent/[0.06]' : 'border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {r.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.avatar}
                              alt={displayName}
                              className="w-11 h-11 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                              <span className="font-heading text-base text-accent">{initial}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Top row: name + meta */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-text-primary text-sm font-medium">{displayName}</p>
                            {r.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-1.5 py-0.5">
                                <ShieldCheck size={9} /> Compra verificada
                              </span>
                            )}
                            {r.featured && !r.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-accent bg-accent/10 border border-accent/20 rounded-full px-1.5 py-0.5">
                                Destaque
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-text-muted text-xs mb-3 flex-wrap">
                            <StarRating rating={r.rating ?? 0} size={12} showCount={false} />
                            {r.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={9} /> {r.location}
                              </span>
                            )}
                            <span>{timeAgo(r.submittedAt)}</span>
                          </div>

                          {r.headline && (
                            <p className="text-text-primary text-base font-medium leading-snug mb-2">
                              {r.headline}
                            </p>
                          )}
                          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                            {r.content}
                          </p>

                          {r.photoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.photoUrl}
                              alt="Foto da avaliação"
                              className="mt-3 max-h-64 rounded-xl border border-white/8 object-cover"
                            />
                          )}

                          {/* Admin reply */}
                          {r.adminReply?.text && (
                            <div className="mt-4 rounded-xl bg-accent/[0.05] border-l-2 border-accent/40 pl-4 py-3 pr-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-[8px] font-bold text-accent">FÍ</div>
                                <p className="text-accent text-xs font-medium">Resposta do Fator Íntimo</p>
                                <span className="text-text-muted text-[10px]">{timeAgo(r.adminReply.repliedAt)}</span>
                              </div>
                              <p className="text-text-secondary text-xs leading-relaxed whitespace-pre-line">
                                {r.adminReply.text}
                              </p>
                            </div>
                          )}

                          {/* Helpful */}
                          <div className="mt-4">
                            <button
                              onClick={() => markHelpful(r.id)}
                              disabled={userClicked}
                              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                                userClicked
                                  ? 'border-accent/30 bg-accent/10 text-accent'
                                  : 'border-white/[0.08] text-text-muted hover:border-accent/25 hover:text-accent'
                              }`}
                            >
                              <ThumbsUp size={11} />
                              {userClicked ? 'Marcado como útil' : 'Foi útil'}
                              {(r.helpfulCount ?? 0) > 0 && <span className="opacity-70">· {r.helpfulCount}</span>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Load more */}
              {sorted.length > pageSize && (
                <div className="text-center">
                  <button
                    onClick={() => setPageSize((p) => p + 5)}
                    className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    Mostrar mais avaliações ({sorted.length - pageSize} restantes)
                  </button>
                </div>
              )}
            </>
          )}

          {!hasReviews && !loading && (
            <div className="text-center py-12 rounded-2xl border border-white/[0.06] bg-surface">
              <Star size={32} className="text-accent/30 mx-auto mb-4" />
              <p className="text-text-primary text-base mb-2">Ainda não há avaliações</p>
              <p className="text-text-muted text-sm">Seja a primeira voz a compartilhar a sua experiência.</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-text-muted text-sm">
              <Loader2 size={16} className="inline-block animate-spin mr-2" /> Carregando avaliações...
            </div>
          )}
        </div>
      </div>

      {/* Submit form modal */}
      {formOpen && (
        <ReviewForm
          productSlug={productSlug}
          guideSlug={guideSlug}
          productTitle={productTitle}
          prefillName={prefillName}
          prefillEmail={prefillEmail}
          onClose={() => setFormOpen(false)}
          onSubmitted={() => { setFormOpen(false); load(); }}
        />
      )}
    </section>
  );
}

// ── Submit form modal ────────────────────────────────────────────────────────

function ReviewForm({
  productSlug,
  guideSlug,
  productTitle,
  prefillName,
  prefillEmail,
  onClose,
  onSubmitted,
}: {
  productSlug?: string;
  guideSlug?: string;
  productTitle: string;
  prefillName?: string;
  prefillEmail?: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(prefillName || '');
  const [email, setEmail] = useState(prefillEmail || '');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<null | { verified: boolean; status: string }>(null);

  const submit = async () => {
    setError('');
    if (rating === 0) {
      setError('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    if (!name.trim() || !content.trim()) {
      setError('Nome e mensagem são obrigatórios.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug,
          guideSlug,
          name,
          email,
          location,
          headline,
          content,
          rating,
          anonymous,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Erro ao enviar. Tente novamente.');
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      setSuccess({ verified: data.verifiedPurchase, status: data.status });
      // Wait 2.5s then close + reload (so visitor sees confirmation)
      setTimeout(() => onSubmitted(), 2500);
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-surface border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/60 overflow-hidden my-0 sm:my-8 max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2 border-b border-white/5">
          <div>
            <p className="text-xs text-accent tracking-[0.25em] uppercase mb-1">Avaliar</p>
            <h3 className="font-heading text-xl font-medium text-text-primary leading-tight">{productTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/25 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h4 className="font-heading text-2xl font-light text-text-primary mb-2">Obrigado!</h4>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
                {success.verified
                  ? 'Sua avaliação foi publicada como compra verificada. Já está visível para outros leitores.'
                  : 'Sua avaliação foi recebida e está em moderação. Em breve estará visível.'}
              </p>
            </div>
          ) : (
            <>
              {/* Star picker */}
              <div>
                <label className="text-text-muted text-xs uppercase tracking-widest block mb-3">Sua nota</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onMouseEnter={() => setHoverRating(r)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(r)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={
                          (hoverRating || rating) >= r
                            ? 'text-accent fill-accent'
                            : 'text-accent/20'
                        }
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-accent text-sm font-medium">{rating}/5</span>
                  )}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">Título (opcional)</label>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  maxLength={120}
                  placeholder="Em uma frase, o que sentiu?"
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/30 transition-colors"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">Sua avaliação *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Conte como o produto te impactou. O que mudou? O que aprendeu?"
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/30 transition-colors resize-none"
                />
                <p className="text-text-muted text-xs mt-1.5 text-right">{content.length} / 2000</p>
              </div>

              {/* Name + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">Nome *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como deseja aparecer"
                    className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">Cidade / país</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="São Paulo, BR"
                    className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/30 transition-colors"
                  />
                </div>
              </div>

              {/* Email (verified purchase) */}
              <div>
                <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
                  Email da compra (opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/30 transition-colors"
                />
                <p className="text-text-muted text-xs mt-1.5 leading-relaxed">
                  Se você comprou esse produto, informe o email do pedido para receber o selo <strong className="text-green-400">Compra verificada</strong> automaticamente. Nunca exibimos seu email publicamente.
                </p>
              </div>

              {/* Anonymous */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-text-secondary text-sm">Publicar como anônimo</span>
              </label>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="border-t border-white/5 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={submitting || rating === 0 || !name.trim() || !content.trim()}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Enviando...' : 'Publicar avaliação'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
