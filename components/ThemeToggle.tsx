'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = (localStorage.getItem('fi-theme') as 'dark' | 'light') || 'dark';
    setTheme(stored);
  }, []);

  const toggle = () => {
    const next: 'dark' | 'light' = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fi-theme', next);
    setTheme(next);
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 350);
  };

  return (
    <button
      onClick={toggle}
      title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      aria-label="Alternar tema"
      className="relative w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-[var(--border-subtle)] bg-[var(--hover-surface)] hover:border-[var(--border-medium)] hover:bg-[var(--hover-surface-2)] text-text-muted hover:text-text-primary"
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: theme === 'light' ? 1 : 0,
          transform: theme === 'light' ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-90deg)',
        }}
      >
        <Moon size={14} />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: theme === 'dark' ? 1 : 0,
          transform: theme === 'dark' ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(90deg)',
        }}
      >
        <Sun size={14} />
      </span>
    </button>
  );
}
