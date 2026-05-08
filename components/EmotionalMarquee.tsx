'use client';

const WELCOME = 'BEM-VINDO AO FATOR ÍNTIMO — UM ESPAÇO PARA ENTENDER O AMOR, AS RELAÇÕES MODERNAS E A PSICOLOGIA POR TRÁS DAS CONEXÕES HUMANAS.';

interface Props {
  phrases: string[];
}

export default function EmotionalMarquee({ phrases }: Props) {
  const allPhrases = [WELCOME, ...phrases];
  const doubled = [...allPhrases, ...allPhrases];

  return (
    <div className="relative w-full overflow-hidden" style={{ backgroundColor: '#fe0050', paddingTop: '2.25rem', paddingBottom: '2.25rem' }}>
      <div className="marquee-track">
        {doubled.map((phrase, i) => (
          <span key={i} className="inline-flex items-center flex-shrink-0" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            <span
              className="font-heading font-semibold whitespace-nowrap text-white uppercase"
              style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', letterSpacing: '0.08em' }}
            >
              {phrase}
            </span>
            <span className="ml-12 flex-shrink-0 text-white/40" style={{ fontSize: '0.55rem' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
