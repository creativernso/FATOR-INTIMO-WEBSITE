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

  // The track renders the video list twice back to back. To loop, once the
  // scroll position passes the width of ONE copy we jump back by exactly
  // that width instead of resetting to 0 — since the second copy is
  // pixel-identical to the first, that jump is invisible and the row keeps
  // drifting rightward forever instead of snapping backward.
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
      const oneSetWidth = el.scrollWidth / 2;
      if (oneSetWidth <= el.clientWidth) return;

      let next = el.scrollLeft + SCROLL_SPEED_PX_PER_SEC * dt;
      if (next >= oneSetWidth) next -= oneSetWidth;
      el.scrollLeft = next;
    }, 30);
    return () => clearInterval(id);
  }, [canAutoScroll, hovered, anyPlaying]);

  if (slides.length === 1) {
    return <UGCVideo url={slides[0]} />;
  }

  const track = canAutoScroll ? [...slides, ...slides] : slides;

  return (
    <div
      ref={trackRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      className="flex gap-5 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6"
    >
      {track.map((url, i) => (
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
