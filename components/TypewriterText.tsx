'use client';

import { useEffect, useState, useRef } from 'react';

export default function TypewriterText({
  text,
  className = '',
  style = {},
  startDelay = 600,
  speed = 55,
  eraseSpeed = 30,
  pauseAfterType = 1800,
  pauseAfterErase = 500,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  startDelay?: number;
  speed?: number;
  eraseSpeed?: number;
  pauseAfterType?: number;
  pauseAfterErase?: number;
}) {
  const [displayed, setDisplayed] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const phaseRef = useRef<'typing' | 'pausing' | 'erasing' | 'waiting'>('waiting');
  const indexRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phase = phaseRef.current;

      if (phase === 'waiting') {
        phaseRef.current = 'typing';
        timeout = setTimeout(tick, startDelay);
      } else if (phase === 'typing') {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
        if (indexRef.current >= text.length) {
          phaseRef.current = 'pausing';
          timeout = setTimeout(tick, pauseAfterType);
        } else {
          timeout = setTimeout(tick, speed);
        }
      } else if (phase === 'pausing') {
        phaseRef.current = 'erasing';
        timeout = setTimeout(tick, 0);
      } else if (phase === 'erasing') {
        indexRef.current -= 1;
        setDisplayed(text.slice(0, indexRef.current));
        if (indexRef.current <= 0) {
          phaseRef.current = 'typing';
          timeout = setTimeout(tick, pauseAfterErase);
        } else {
          timeout = setTimeout(tick, eraseSpeed);
        }
      }
    };

    timeout = setTimeout(tick, startDelay);
    return () => clearTimeout(timeout);
  }, [text, startDelay, speed, eraseSpeed, pauseAfterType, pauseAfterErase]);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <span className={className} style={style}>
      {displayed}
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '0.85em',
          background: '#fe0050',
          marginLeft: '2px',
          verticalAlign: 'middle',
          opacity: cursorVisible ? 1 : 0,
          transition: 'opacity 0.1s',
        }}
      />
    </span>
  );
}
