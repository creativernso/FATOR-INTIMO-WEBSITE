'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PenLine, LogIn } from 'lucide-react';
import { useCommunity } from '@/components/community/CommunityProvider';
import AuthModal from '@/components/community/AuthModal';

export default function CommunityHeroButtons() {
  const { profile, loading } = useCommunity();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return <div className="h-14" />;

  return (
    <>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/comunidade/nova-publicacao"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:shadow-accent/20"
        >
          <PenLine size={14} /> Iniciar uma conversa
        </Link>

        {!profile && (
          <button
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-7 py-3.5 rounded-full text-sm transition-all"
          >
            <LogIn size={14} /> Entrar / Criar conta
          </button>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
