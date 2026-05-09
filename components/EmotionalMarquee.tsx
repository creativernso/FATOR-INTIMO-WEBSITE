'use client';

const WELCOME = 'Bem-vindo ao Fator Íntimo. Um espaço para entender o amor, as relações modernas e a psicologia por trás das conexões humanas.';

interface Props {
  phrases: string[];
}

export default function EmotionalMarquee({ phrases }: Props) {
  const allPhrases = [WELCOME, ...phrases];
  const doubled = [...allPhrases, ...allPhrases];

  return (
    <div className="relative overflow-hidden mx-4 md:mx-0 rounded-2xl md:rounded-none" style={{ backgroundColor: '#fe0050', paddingTop: '2.25rem', paddingBottom: '2.25rem' }}>
      <div className="marquee-track">
        {doubled.map((phrase, i) => (
          <span key={i} className="inline-flex items-center flex-shrink-0" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            <span
              className="font-heading font-light whitespace-nowrap text-white text-[1.5rem] md:text-[clamp(4rem,7vw,5.5rem)]"
              style={{ letterSpacing: '-0.02em' }}
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
