import { Star, Quote } from 'lucide-react';
import Image from 'next/image';
import { Testimonial } from '@/lib/types';

interface Props {
  testimonial: Testimonial;
  featured?: boolean;
}

export default function TestimonialCard({ testimonial, featured }: Props) {
  const displayName = testimonial.anonymous ? 'Anônimo' : testimonial.name;
  const showPhoto = !testimonial.anonymous && testimonial.avatar;

  return (
    <div className={`relative rounded-2xl border bg-surface flex flex-col transition-all duration-300 hover:border-white/10 ${
      featured || testimonial.featured
        ? 'border-accent/20 hover:border-accent/30 p-8'
        : 'border-white/5 p-7'
    }`}>
      {(featured || testimonial.featured) && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      )}

      <Quote size={24} className="text-accent/25 mb-4 flex-shrink-0" />

      {testimonial.headline && (
        <p className="font-heading text-text-primary text-base font-medium mb-3 leading-snug">
          &ldquo;{testimonial.headline}&rdquo;
        </p>
      )}

      <p className="text-text-secondary text-sm leading-relaxed mb-5 flex-1">
        {testimonial.content}
      </p>

      {testimonial.transformation && (
        <div className="border-l-2 border-accent/30 pl-4 mb-5">
          <p className="text-text-primary text-xs italic leading-relaxed">
            {testimonial.transformation}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          {showPhoto ? (
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
              <Image src={testimonial.avatar!} alt={displayName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-sm text-text-primary">
                {testimonial.anonymous ? '?' : displayName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="text-text-primary text-sm font-medium leading-tight">{displayName}</p>
            <p className="text-text-muted text-xs">
              {testimonial.role || ''}
              {testimonial.age && testimonial.role ? `, ${testimonial.age} anos` : testimonial.age ? `${testimonial.age} anos` : ''}
            </p>
          </div>
        </div>
        {testimonial.rating && (
          <div className="flex gap-0.5">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} size={11} className="text-accent fill-accent" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
