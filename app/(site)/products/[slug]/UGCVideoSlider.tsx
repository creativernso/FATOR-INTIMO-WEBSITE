'use client';

import UGCVideo from './UGCVideo';

interface Props {
  urls: string[];
}

export default function UGCVideoSlider({ urls }: Props) {
  // No video configured at all -> fall back to a single "coming soon" card,
  // same as the old single-video behavior.
  const slides = urls.length > 0 ? urls : [undefined];

  if (slides.length === 1) {
    return <UGCVideo url={slides[0]} />;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory justify-center">
      {slides.map((url, i) => (
        <div key={i} className="flex-shrink-0 w-[220px] sm:w-[260px] snap-center">
          <UGCVideo url={url} />
        </div>
      ))}
    </div>
  );
}
