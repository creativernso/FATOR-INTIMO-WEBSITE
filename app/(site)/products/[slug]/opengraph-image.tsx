import { ImageResponse } from 'next/og';
import { getProducts } from '@/lib/db';

export const runtime = 'nodejs';
export const alt = 'Fator Íntimo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ProductOgImage({ params }: { params: { slug: string } }) {
  const product = (await getProducts()).find((p) => p.slug === params.slug);
  const title = product?.title ?? 'Fator Íntimo';
  const hook = product?.hook ?? '';
  const price = product?.price;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0a0705 0%, #1a1410 60%, #2a1a15 100%)',
          color: '#f5f0eb',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 80,
            fontSize: 16,
            letterSpacing: 6,
            color: '#fe0050',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          FATOR ÍNTIMO · MATERIAL
        </div>

        <div
          style={{
            fontSize: title.length > 60 ? 60 : 76,
            fontWeight: 300,
            lineHeight: 1.05,
            maxWidth: 1040,
            marginTop: 60,
          }}
        >
          {title}
        </div>

        {hook && (
          <div style={{ fontSize: 26, color: '#a09080', marginTop: 26, maxWidth: 940, fontStyle: 'italic', lineHeight: 1.4 }}>
            &ldquo;{hook}&rdquo;
          </div>
        )}

        {price && (
          <div
            style={{
              marginTop: 48,
              display: 'inline-flex',
              padding: '14px 32px',
              background: '#fe0050',
              borderRadius: 50,
              color: '#fff',
              fontSize: 28,
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            R$ {price}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            fontSize: 18,
            color: '#888',
          }}
        >
          fatorintimo.com
        </div>
      </div>
    ),
    { ...size },
  );
}
