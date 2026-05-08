'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { CommunityUser } from '@/lib/types';
import { onCommunityAuthChange, getIdToken } from '@/lib/community-auth';

interface CommunityCtx {
  firebaseUser: User | null;
  profile: CommunityUser | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<CommunityCtx>({ firebaseUser: null, profile: null, loading: true, refreshProfile: async () => {} });

export function useCommunity() {
  return useContext(Ctx);
}

export default function CommunityProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CommunityUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch('/api/community/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProfile(await res.json());
      else setProfile(null);
    } catch {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    const token = await getIdToken();
    if (token) await fetchProfile(token);
  };

  useEffect(() => {
    return onCommunityAuthChange(async (user) => {
      setFirebaseUser(user);
      if (user) {
        const token = await user.getIdToken();
        await fetchProfile(token);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <Ctx.Provider value={{ firebaseUser, profile, loading, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}
