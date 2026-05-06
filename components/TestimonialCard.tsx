import { Star, Quote } from 'lucide-react';
import { Testimonial } from '@/lib/types';

interface Props {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: Props) {
  return (
    <div className="relative rounded-2xl border border-white/5 bg-surface p-7 hover:border-white/10 transition-all duration-300 flex flex-col">
      <Quote size={28} className="text-accent/30 mb-4 flex-shrink-0" />

      <p className="text-text-secondary text-sm leading-relaxed mb-5 flex-1">
        {testimonial.content}
      </p>

      {testimonial.transformation && (
        <div className="border-l-2 border-accent/40 pl-4 mb-5">
          <p className="text-text-primary text-xs italic leading-relaxed">
            {testimonial.transformation}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center border border-white/10">
            <span className="font-heading text-sm text-text-primary">
              {testimonial.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-text-primary text-sm font-medium leading-tight">{testimonial.name}</p>
            <p className="text-text-muted text-xs">{testimonial.role}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} size={12} className="text-accent fill-accent" />
          ))}
        </div>
      </div>
    </div>
  );
}
