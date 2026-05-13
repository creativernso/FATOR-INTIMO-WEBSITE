'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Badges {
  testimonials: number;
  comunidade: number;
  comments: number;
  leads: number;
  chat: number;
}

const DEFAULT: Badges = { testimonials: 0, comunidade: 0, comments: 0, leads: 0, chat: 0 };

const BadgesContext = createContext<Badges>(DEFAULT);

export function useAdminBadges() {
  return useContext(BadgesContext);
}

export default function AdminBadgesProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<Badges>(DEFAULT);

  useEffect(() => {
    let cancelled = false;
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/admin/badges', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setBadges({ ...DEFAULT, ...data });
      } catch {}
    };
    fetchBadges();
    const id = setInterval(fetchBadges, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return <BadgesContext.Provider value={badges}>{children}</BadgesContext.Provider>;
}
