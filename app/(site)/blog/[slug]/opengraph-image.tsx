import { ImageResponse } from 'next/og';
import { getPosts } from '@/lib/db';

export const runtime = 'nodejs';
export const alt = 'Fator Íntimo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function BlogOgImage({ params }: { params: { slug: string } }) {
  const post = (await getPosts()).find((p) => p.slug === params.slug);
  const title = post?.title ?? 'Fator Íntimo';
  const category = post?.category ?? 'Psicologia das Relações';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0a0705 0%, #1a1410 60%, #2a1a15 100%)',
          color: '#f5f0eb',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, letterSpacing: 6, color: '#fe0050', textTransform: 'uppercase', fontWeight: 600 }}>
            FATOR ÍNTIMO · BLOG
          </span>
          <span style={{ fontSize: 16, color: '#a09080', textTransform: 'uppercase', letterSpacing: 3 }}>
            {category}
          </span>
        </div>

        <div
          style={{
            fontSize: title.length > 80 ? 56 : 72,
            fontWeight: 300,
            lineHeight: 1.1,
            maxWidth: 1040,
            color: '#f5f0eb',
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: 'rgba(254,0,80,0.15)',
                border: '2px solid rgba(254,0,80,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fe0050',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              FÍ
            </div>
            <span style={{ fontSize: 22, color: '#d0c0b0' }}>fatorintimo.com</span>
          </div>
          <span style={{ fontSize: 18, color: '#666' }}>Leia o artigo completo →</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
