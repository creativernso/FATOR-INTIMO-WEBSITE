'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';

interface BadgeCounts {
  testimonials: number;
  comunidade: number;
  comments: number;
  leads: number;
  chat: number;
}

interface BadgesContextValue {
  badges: BadgeCounts;       // effective: raw minus seen, clamped to 0
  rawCounts: BadgeCounts;    // current totals from the server
  dismiss: (section: keyof BadgeCounts) => void;
}

const ZERO: BadgeCounts = { testimonials: 0, comunidade: 0, comments: 0, leads: 0, chat: 0 };

const BadgesContext = createContext<BadgesContextValue>({
  badges: ZERO,
  rawCounts: ZERO,
  dismiss: () => {},
});

export function useAdminBadges() {
  return useContext(BadgesContext);
}

const STORAGE_KEY = 'fi_admin_badge_seen';

function loadSeen(): BadgeCounts {
  if (typeof window === 'undefined') return ZERO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ZERO;
    return { ...ZERO, ...JSON.parse(raw) };
  } catch {
    return ZERO;
  }
}

function saveSeen(seen: BadgeCounts) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {}
}

function computeEffective(raw: BadgeCounts, seen: BadgeCounts): BadgeCounts {
  return {
    testimonials: Math.max(0, raw.testimonials - seen.testimonials),
    comunidade:   Math.max(0, raw.comunidade   - seen.comunidade),
    comments:     Math.max(0, raw.comments     - seen.comments),
    leads:        Math.max(0, raw.leads        - seen.leads),
    chat:         Math.max(0, raw.chat         - seen.chat),
  };
}

export default function AdminBadgesProvider({ children }: { children: ReactNode }) {
  const [rawCounts, setRawCounts] = useState<BadgeCounts>(ZERO);
  const [seen, setSeen] = useState<BadgeCounts>(ZERO);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Keep a ref to the latest rawCounts so dismiss() doesn't churn references
  const rawCountsRef = useRef(rawCounts);
  useEffect(() => { rawCountsRef.current = rawCounts; }, [rawCounts]);

  // Hydrate "seen" from localStorage on first mount
  useEffect(() => {
    setSeen(loadSeen());
    setHasHydrated(true);
  }, []);

  // Poll the server for current counts every 8s
  useEffect(() => {
    let cancelled = false;
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/admin/badges', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setRawCounts({ ...ZERO, ...data });
        setHasFetched(true);
      } catch {}
    };
    fetchBadges();
    const id = setInterval(fetchBadges, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Shrink "seen" if the server count drops below it (e.g. admin approved items).
  // Crucially we only run this after BOTH the localStorage hydrate AND the first
  // server fetch — otherwise the initial rawCounts=ZERO would wipe out the
  // freshly-loaded localStorage values and the badge would reappear on every
  // page navigation.
  useEffect(() => {
    if (!hasHydrated || !hasFetched) return;
    setSeen((s) => {
      const next: BadgeCounts = {
        testimonials: Math.min(s.testimonials, rawCounts.testimonials),
        comunidade:   Math.min(s.comunidade,   rawCounts.comunidade),
        comments:     Math.min(s.comments,     rawCounts.comments),
        leads:        Math.min(s.leads,        rawCounts.leads),
        chat:         Math.min(s.chat,         rawCounts.chat),
      };
      const changed =
        next.testimonials !== s.testimonials ||
        next.comunidade   !== s.comunidade   ||
        next.comments     !== s.comments     ||
        next.leads        !== s.leads        ||
        next.chat         !== s.chat;
      if (!changed) return s;
      saveSeen(next);
      return next;
    });
  }, [rawCounts, hasHydrated, hasFetched]);

  // Stable dismiss — always reads the latest rawCounts via the ref so this
  // function never needs to be recreated (and never causes layout useEffects
  // to re-run on every poll).
  const dismiss = useCallback((section: keyof BadgeCounts) => {
    setSeen((s) => {
      const currentRaw = rawCountsRef.current[section];
      if (s[section] === currentRaw) return s;
      const next = { ...s, [section]: currentRaw };
      saveSeen(next);
      return next;
    });
  }, []);

  const effective = computeEffective(rawCounts, seen);

  return (
    <BadgesContext.Provider value={{ badges: effective, rawCounts, dismiss }}>
      {children}
    </BadgesContext.Provider>
  );
}
