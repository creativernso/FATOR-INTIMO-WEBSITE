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
    <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory -mx-6 px-6">
      {slides.map((url, i) => (
        <div key={i} className="flex-shrink-0 w-[240px] sm:w-[280px] snap-center">
          <UGCVideo url={url} />
        </div>
      ))}
    </div>
  );
}
