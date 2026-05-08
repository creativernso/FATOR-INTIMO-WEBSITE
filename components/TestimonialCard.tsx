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

  const meta = [
    displayName,
    testimonial.age ? `${testimonial.age} anos` : null,
    testimonial.role || null,
  ].filter(Boolean).join(' · ');

  return (
    <div className={`relative rounded-2xl border bg-surface flex flex-col overflow-hidden transition-all duration-300 hover:border-white/10 ${
      isFeatured ? 'border-accent/20 hover:border-accent/30' : 'border-white/5'
    }`}>
      {isFeatured && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent z-10" />
      )}

      {/* Full-width portrait photo */}
      <div className="w-full aspect-[4/3] bg-white/4 overflow-hidden flex-shrink-0">
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonial.avatar!}
            alt={displayName}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-heading text-5xl font-light text-white/20">
              {testimonial.anonymous ? '?' : displayName.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-6 py-5 text-center">
        {/* Name · age · role */}
        <p className="text-text-muted text-xs mb-4 leading-snug">{meta}</p>

        {/* Headline */}
        {testimonial.headline && (
          <p className="font-heading text-text-primary text-base font-semibold mb-3 leading-snug">
            {testimonial.headline}
          </p>
        )}

        {/* Body */}
        <p className="text-text-secondary text-sm leading-relaxed flex-1">
          {testimonial.content}
        </p>

        {/* Stars */}
        {testimonial.rating && (
          <div className="flex gap-1 justify-center mt-5">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} size={14} className="text-accent fill-accent" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
