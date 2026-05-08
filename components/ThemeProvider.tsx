'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = (localStorage.getItem('fi-theme') as 'dark' | 'light') || 'dark';
    document.documentElement.setAttribute('data-theme', stored);
  }, []);

  return <>{children}</>;
}
