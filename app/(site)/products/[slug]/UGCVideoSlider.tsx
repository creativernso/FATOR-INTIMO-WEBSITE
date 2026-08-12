'use client';

import { useEffect, useRef, useState } from 'react';
import UGCVideo from './UGCVideo';

interface Props {
  urls: string[];
}

const SCROLL_SPEED_PX_PER_SEC = 36;

export default function UGCVideoSlider({ urls }: Props) {
  // No video configured at all -> fall back to a single "coming soon" card,
  // same as the old single-video behavior.
  const slides = urls.length > 0 ? urls : [undefined];
  const canAutoScroll = slides.length > 1;

  const trackRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [anyPlaying, setAnyPlaying] = useState(0);

  // Drifts the row left -> right on a loop, pausing while the visitor is
  // hovering/touching it or actually watching one of the videos (so a
  // playing video never scrolls out from under them). setInterval rather
  // than requestAnimationFrame, since rAF is fully paused by the browser on
  // background/inactive tabs and this should still creep along there.
  useEffect(() => {
    if (!canAutoScroll) return;
    const el = trackRef.current;
    if (!el) return;

    let lastTs = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTs) / 1000;
      lastTs = now;

      if (hovered || anyPlaying > 0) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const next = el.scrollLeft + SCROLL_SPEED_PX_PER_SEC * dt;
      el.scrollLeft = next >= maxScroll ? 0 : next;
    }, 30);
    return () => clearInterval(id);
  }, [canAutoScroll, hovered, anyPlaying]);

  if (slides.length === 1) {
    return <UGCVideo url={slides[0]} />;
  }

  return (
    <div
      ref={trackRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      className="flex gap-5 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6"
    >
      {slides.map((url, i) => (
        <div key={i} className="flex-shrink-0 w-[240px] sm:w-[280px]">
          <UGCVideo
            url={url}
            onPlayingChange={(playing) => setAnyPlaying((c) => Math.max(0, c + (playing ? 1 : -1)))}
          />
        </div>
      ))}
    </div>
  );
}
