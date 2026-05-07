'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-400/5 transition-all ${iconOnly ? 'justify-center' : 'w-full'}`}
    >
      <LogOut size={15} className="flex-shrink-0" />
      {!iconOnly && <span>Sair</span>}
    </button>
  );
}
