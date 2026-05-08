'use client';

const WELCOME = 'BEM-VINDO AO FATOR ÍNTIMO — UM ESPAÇO PARA ENTENDER O AMOR, AS RELAÇÕES MODERNAS E A PSICOLOGIA POR TRÁS DAS CONEXÕES HUMANAS.';

interface Props {
  phrases: string[];
}

export default function EmotionalMarquee({ phrases }: Props) {
  const allPhrases = [WELCOME, ...phrases];
  const doubled = [...allPhrases, ...allPhrases];

  return (
    <div className="relative w-full overflow-hidden" style={{ backgroundColor: '#fe0050', paddingTop: '1.75rem', paddingBottom: '1.75rem' }}>
      <div className="marquee-track">
        {doubled.map((phrase, i) => (
          <span key={i} className="inline-flex items-center flex-shrink-0" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            <span
              className="font-heading font-light whitespace-nowrap text-black uppercase"
              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.15rem)', letterSpacing: '0.1em' }}
            >
              {phrase}
            </span>
            <span className="ml-12 flex-shrink-0 text-black/25" style={{ fontSize: '0.55rem' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
