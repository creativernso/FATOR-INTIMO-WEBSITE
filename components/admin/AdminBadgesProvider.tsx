'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface BadgeCounts {
  testimonials: number;
  comunidade: number;
  comments: number;
  leads: number;
  chat: number;
}

interface BadgesContextValue {
  // Effective badge counts (raw minus what the admin has already "seen")
  badges: BadgeCounts;
  // Raw current counts from the server (for components that need totals, not deltas)
  rawCounts: BadgeCounts;
  // Mark a section as visited — drops its effective badge to 0 until new items arrive
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

  // Hydrate "seen" from localStorage on first mount
  useEffect(() => {
    setSeen(loadSeen());
  }, []);

  // Poll the server for current counts
  useEffect(() => {
    let cancelled = false;
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/admin/badges', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setRawCounts({ ...ZERO, ...data });
      } catch {}
    };
    fetchBadges();
    const id = setInterval(fetchBadges, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // If the server count drops below what we had recorded as "seen" (e.g. admin
  // approved 2 pending items), shrink seen to match — otherwise the badge stays
  // hidden forever even when new items arrive later.
  useEffect(() => {
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
  }, [rawCounts]);

  const dismiss = useCallback((section: keyof BadgeCounts) => {
    setSeen((s) => {
      if (s[section] === rawCounts[section]) return s;
      const next = { ...s, [section]: rawCounts[section] };
      saveSeen(next);
      return next;
    });
  }, [rawCounts]);

  const effective = computeEffective(rawCounts, seen);

  return (
    <BadgesContext.Provider value={{ badges: effective, rawCounts, dismiss }}>
      {children}
    </BadgesContext.Provider>
  );
}
