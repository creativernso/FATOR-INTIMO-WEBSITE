import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Fator Íntimo - Psicologia das Relações';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: 'linear-gradient(135deg, #0a0705 0%, #1a1410 60%, #2a1a15 100%)',
          color: '#f5f0eb',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 80,
            fontSize: 18,
            letterSpacing: 8,
            color: '#fe0050',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          FATOR ÍNTIMO
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 300,
            lineHeight: 1.05,
            maxWidth: 980,
            marginTop: 140,
          }}
        >
          Entenda o amor.
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 300,
            lineHeight: 1.05,
            color: '#fe0050',
            marginTop: 4,
          }}
        >
          Domine suas relações.
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#a09080',
            marginTop: 36,
            maxWidth: 860,
            lineHeight: 1.4,
          }}
        >
          Psicologia das relações, inteligência emocional e comportamento humano.
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            fontSize: 22,
            color: '#888',
          }}
        >
          fatorintimo.com
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(to right, transparent, #fe0050, transparent)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
