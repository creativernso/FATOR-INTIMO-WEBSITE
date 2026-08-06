export type VideoEmbed =
  | { type: 'youtube'; src: string; videoId: string }
  | { type: 'vimeo'; src: string; videoId: string }
  | { type: 'direct'; src: string };

export function getVideoEmbed(url: string): VideoEmbed | null {
  // YouTube (including Shorts, e.g. youtube.com/shorts/VIDEO_ID — the
  // vertical format people naturally paste for a UGC-style testimonial).
  // youtube-nocookie + modestbranding/controls/iv_load_policy strip the
  // title, channel, Shorts logo and native control bar so only the video
  // itself shows — same approach already used in VideoTestimonialCard.
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      videoId: ytMatch[1],
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&controls=0&iv_load_policy=3&playsinline=1&hl=pt-BR&cc_lang_pref=pt-BR`,
    };
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0&controls=0`,
    };
  }
  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: 'direct', src: url };
  }
  return null;
}
