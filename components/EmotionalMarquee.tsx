'use client';

const WELCOME = 'Bem-vindo ao Fator Íntimo — um espaço para entender o amor, as relações modernas e a psicologia por trás das conexões humanas.';

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
              className="font-heading font-light whitespace-nowrap text-white"
              style={{ fontSize: 'clamp(3rem, 5.6vw, 4.4rem)', letterSpacing: '-0.02em' }}
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
