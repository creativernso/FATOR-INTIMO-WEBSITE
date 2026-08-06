export type VideoEmbed =
  | { type: 'youtube'; src: string; videoId: string }
  | { type: 'vimeo'; src: string; videoId: string }
  | { type: 'direct'; src: string };

export function getVideoEmbed(url: string): VideoEmbed | null {
  // YouTube (including Shorts, e.g. youtube.com/shorts/VIDEO_ID — the
  // vertical format people naturally paste for a UGC-style testimonial)
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      videoId: ytMatch[1],
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }
  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: 'direct', src: url };
  }
  return null;
}
