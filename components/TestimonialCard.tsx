import { Star, Quote } from 'lucide-react';
import { Testimonial } from '@/lib/types';

interface Props {
  testimonial: Testimonial;
  featured?: boolean;
}

export default function TestimonialCard({ testimonial, featured }: Props) {
  const displayName = testimonial.anonymous ? 'Anônimo' : testimonial.name;
  const showPhoto = !testimonial.anonymous && !!testimonial.avatar;
  const isFeatured = featured || testimonial.featured;

  return (
    <div className={`relative rounded-2xl border bg-surface flex flex-col transition-all duration-300 hover:border-white/10 ${
      isFeatured
        ? 'border-accent/20 hover:border-accent/30 p-8'
        : 'border-white/5 p-7'
    }`}>
      {isFeatured && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      )}

      {/* Profile photo — prominent at top */}
      <div className="flex flex-col items-center text-center mb-6">
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonial.avatar!}
            alt={displayName}
            className={`rounded-full object-cover border-2 mb-4 flex-shrink-0 ${
              isFeatured ? 'w-24 h-24 border-accent/30' : 'w-20 h-20 border-white/15'
            }`}
          />
        ) : (
          <div className={`rounded-full bg-white/5 border-2 flex items-center justify-center mb-4 flex-shrink-0 ${
            isFeatured ? 'w-24 h-24 border-accent/20' : 'w-20 h-20 border-white/10'
          }`}>
            <span className={`font-heading font-light text-text-primary ${isFeatured ? 'text-3xl' : 'text-2xl'}`}>
              {testimonial.anonymous ? '?' : displayName.charAt(0)}
            </span>
          </div>
        )}

        <p className="text-text-primary text-sm font-medium leading-tight">{displayName}</p>
        {(testimonial.role || testimonial.age) && (
          <p className="text-text-muted text-xs mt-0.5">
            {testimonial.role || ''}
            {testimonial.age && testimonial.role ? `, ${testimonial.age} anos` : testimonial.age ? `${testimonial.age} anos` : ''}
          </p>
        )}
        {testimonial.rating && (
          <div className="flex gap-0.5 mt-2">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} size={11} className="text-accent fill-accent" />
            ))}
          </div>
        )}
      </div>

      <Quote size={18} className="text-accent/20 mb-3 flex-shrink-0 mx-auto" />

      {testimonial.headline && (
        <p className="font-heading text-text-primary text-base font-medium mb-3 leading-snug text-center">
          &ldquo;{testimonial.headline}&rdquo;
        </p>
      )}

      <p className="text-text-secondary text-sm leading-relaxed flex-1 text-center">
        {testimonial.content}
      </p>

      {testimonial.transformation && (
        <div className="border-l-2 border-accent/30 pl-4 mt-5">
          <p className="text-text-primary text-xs italic leading-relaxed">
            {testimonial.transformation}
          </p>
        </div>
      )}
    </div>
  );
}
