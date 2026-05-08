'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  height?: number;
  className?: string;
}

export default function LogoImage({ height = 36, className = '' }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span
        className={`font-heading text-text-primary ${className}`}
        style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: `${height * 0.7}px`, letterSpacing: '0.04em' }}
      >
        Fator <span style={{ color: '#fe0050' }}>Íntimo</span>
      </span>
    );
  }

  return (
    <Image
      src="/LOGO.png"
      alt="Fator Íntimo"
      width={Math.round(height * 9.4)}
      height={height}
      className={`object-contain ${className}`}
      style={{ height, width: 'auto' }}
      priority
      onError={() => setError(true)}
    />
  );
}
