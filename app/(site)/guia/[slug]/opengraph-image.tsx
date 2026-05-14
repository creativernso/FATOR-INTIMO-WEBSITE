import { ImageResponse } from 'next/og';
import { getGuideBySlug } from '@/lib/db';

export const runtime = 'nodejs';
export const alt = 'Fator Íntimo - Guia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function GuideOgImage({ params }: { params: { slug: string } }) {
  const guide = await getGuideBySlug(params.slug);
  const title = guide?.title ?? 'Guia gratuito';
  const subtitle = guide?.subtitle ?? 'Fator Íntimo';

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
          FATOR ÍNTIMO · GUIA GRATUITO
        </div>

        <div
          style={{
            fontSize: title.length > 60 ? 60 : 74,
            fontWeight: 300,
            lineHeight: 1.05,
            maxWidth: 1040,
            marginTop: 60,
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div style={{ fontSize: 24, color: '#a09080', marginTop: 22, maxWidth: 940, fontStyle: 'italic', lineHeight: 1.4 }}>
            {subtitle}
          </div>
        )}

        <div
          style={{
            marginTop: 44,
            display: 'inline-flex',
            padding: '14px 32px',
            background: '#fe0050',
            borderRadius: 50,
            color: '#fff',
            fontSize: 24,
            fontWeight: 600,
            width: 'fit-content',
          }}
        >
          Baixar grátis
        </div>

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
