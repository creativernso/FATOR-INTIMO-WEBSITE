const CHANNEL_ID = 'UCK4p8KGE0Eevo6-MyP5hfXA';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export interface YTVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
}

export async function getLatestVideos(count = 3): Promise<YTVideo[]> {
  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
    return entries.slice(0, count).map((entry) => {
      const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? '';
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? '';
      return {
        id,
        title,
        published,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    });
  } catch {
    return [];
  }
}
