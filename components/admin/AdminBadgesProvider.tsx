'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase';

interface Badges {
  testimonials: number;   // pending
  comunidade: number;     // pending posts
  comments: number;       // unapproved
  leads: number;          // new (last 24h)
}

const BadgesContext = createContext<Badges>({ testimonials: 0, comunidade: 0, comments: 0, leads: 0 });

export function useAdminBadges() {
  return useContext(BadgesContext);
}

export default function AdminBadgesProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<Badges>({ testimonials: 0, comunidade: 0, comments: 0, leads: 0 });

  useEffect(() => {
    const db = getFirestoreClient();

    // Pending testimonials
    const unsub1 = onSnapshot(
      query(collection(db, 'testimonials'), where('status', '==', 'pending')),
      (snap) => setBadges((b) => ({ ...b, testimonials: snap.size })),
    );

    // Pending community posts
    const unsub2 = onSnapshot(
      query(collection(db, 'communityPosts'), where('status', '==', 'pending')),
      (snap) => setBadges((b) => ({ ...b, comunidade: snap.size })),
    );

    // Unapproved comments
    const unsub3 = onSnapshot(
      query(collection(db, 'comments'), where('approved', '==', false)),
      (snap) => setBadges((b) => ({ ...b, comments: snap.size })),
    );

    // New leads in last 48h
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const unsub4 = onSnapshot(
      query(collection(db, 'leads'), where('createdAt', '>=', since)),
      (snap) => setBadges((b) => ({ ...b, leads: snap.size })),
    );

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, []);

  return <BadgesContext.Provider value={badges}>{children}</BadgesContext.Provider>;
}
