import { Star } from 'lucide-react';
import { Testimonial } from '@/lib/types';

interface Props {
  testimonial: Testimonial;
  featured?: boolean;
}

export default function TestimonialCard({ testimonial, featured }: Props) {
  const displayName = testimonial.anonymous ? 'Anônimo' : testimonial.name;
  const showPhoto = !testimonial.anonymous && !!testimonial.avatar;
  const isFeatured = featured || testimonial.featured;

  const metaParts = [
    displayName,
    testimonial.age ? `${testimonial.age} anos` : null,
    testimonial.role || null,
  ].filter(Boolean);

  return (
    <div className={`relative flex flex-col rounded-3xl transition-all duration-300 overflow-hidden ${
      isFeatured
        ? 'bg-surface border border-accent/15 hover:border-accent/25'
        : 'bg-surface border border-white/6 hover:border-white/12'
    }`}
    style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>

      {/* Top accent line for featured */}
      {isFeatured && (
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent z-10" />
      )}

      {/* ── Portrait image ─────────────────────────── */}
      <div className="px-4 pt-4">
        <div className="relative w-full overflow-hidden rounded-2xl bg-white/5"
          style={{ aspectRatio: '4/5' }}>
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={testimonial.avatar!}
              alt={displayName}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-6xl font-light text-white/15 select-none">
                {testimonial.anonymous ? '?' : displayName.charAt(0)}
              </span>
            </div>
          )}

          {/* Subtle bottom fade so image blends into card */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f0a06]/60 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ── Content ───────────────────────────────── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-6 text-center">

        {/* Metadata — name · age · role */}
        <p className="text-[11px] text-text-muted leading-snug mb-3 tracking-wide">
          {metaParts.map((part, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1.5 opacity-40">·</span>}
              {i === 0 ? <strong className="font-semibold text-text-primary/80">{part}</strong> : part}
            </span>
          ))}
        </p>

        {/* Headline */}
        {testimonial.headline && (
          <h3 className="font-heading text-text-primary font-semibold leading-snug mb-3"
            style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }}>
            {testimonial.headline}
          </h3>
        )}

        {/* Body */}
        <p className="text-text-secondary leading-relaxed flex-1"
          style={{ fontSize: 'clamp(0.78rem, 0.95vw, 0.875rem)' }}>
          {testimonial.content}
        </p>

        {/* Stars */}
        {testimonial.rating && (
          <div className="flex items-center justify-center gap-1 mt-5">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} size={13} className="text-accent fill-accent" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
