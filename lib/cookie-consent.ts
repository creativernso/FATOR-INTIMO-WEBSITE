'use client';

export type ConsentCategory = 'analytics' | 'marketing';

export interface ConsentDecision {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const STORAGE_KEY = 'fi_cookie_consent';
const EVENT_NAME = 'fi-consent-change';

export function getConsent(): ConsentDecision | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentDecision) : null;
  } catch {
    return null;
  }
}

export function saveConsent(decision: Omit<ConsentDecision, 'necessary' | 'decidedAt'>): void {
  if (typeof window === 'undefined') return;
  const full: ConsentDecision = { necessary: true, ...decision, decidedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: full }));
}

export function hasConsent(category: ConsentCategory): boolean {
  return !!getConsent()?.[category];
}

/** Re-runs `cb` immediately (if a decision already exists) and whenever consent changes. */
export function onConsentChange(cb: (decision: ConsentDecision) => void): () => void {
  const existing = getConsent();
  if (existing) cb(existing);
  const handler = (e: Event) => cb((e as CustomEvent<ConsentDecision>).detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
