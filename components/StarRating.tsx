import { Star } from 'lucide-react';

interface Props {
  rating: number;          // average rating, e.g. 4.7
  count?: number;          // number of reviews
  size?: number;           // px size of each star
  showCount?: boolean;     // show "(12 avaliações)" next to stars
  className?: string;
}

/**
 * Inline star rating display.
 * Renders 5 stars filled proportionally to `rating` (0-5).
 * Optionally shows the count next to it.
 */
export default function StarRating({
  rating,
  count,
  size = 14,
  showCount = true,
  className = '',
}: Props) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const fillPct = Math.max(0, Math.min(1, clamped - i)) * 100;
          return (
            <span key={i} className="relative inline-flex" style={{ width: size, height: size }}>
              {/* Empty star background */}
              <Star size={size} className="text-accent/25 absolute inset-0" strokeWidth={1.5} />
              {/* Filled overlay clipped to fill % */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPct}%` }}
              >
                <Star size={size} className="text-accent fill-accent" strokeWidth={1.5} />
              </span>
            </span>
          );
        })}
      </div>
      {showCount && typeof count === 'number' && count > 0 && (
        <span className="text-text-muted text-xs">
          {clamped.toFixed(1)} · {count} {count === 1 ? 'leitor transformado' : 'leitores transformados'}
        </span>
      )}
    </div>
  );
}
