'use client';

interface Props {
  phrases: string[];
}

export default function EmotionalMarquee({ phrases }: Props) {
  if (!phrases.length) return null;
  const doubled = [...phrases, ...phrases];

  return (
    <div className="relative w-full overflow-hidden border-y border-white/5 py-3.5"
      style={{ background: 'linear-gradient(90deg, rgba(254,0,80,0.03) 0%, transparent 40%, transparent 60%, rgba(254,0,80,0.03) 100%)' }}>
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgb(var(--bg)), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgb(var(--bg)), transparent)' }} />

      <div className="marquee-track">
        {doubled.map((phrase, i) => (
          <span key={i} className="inline-flex items-center gap-5 px-5">
            <span className="text-sm font-light tracking-wide whitespace-nowrap"
              style={{ color: 'rgba(254,0,80,0.65)' }}>
              {phrase}
            </span>
            <span className="text-xs flex-shrink-0" style={{ color: 'rgba(254,0,80,0.25)' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
