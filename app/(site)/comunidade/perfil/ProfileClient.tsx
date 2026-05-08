'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, Save, LogOut, CheckCircle } from 'lucide-react';
import { useCommunity } from '@/components/community/CommunityProvider';
import AuthModal from '@/components/community/AuthModal';
import { communitySignOut, authedFetch } from '@/lib/community-auth';

export default function ProfileClient() {
  const router = useRouter();
  const { profile, loading, refreshProfile } = useCommunity();
  const [showAuth, setShowAuth] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 pb-28 flex items-center justify-center py-20">
        <Loader size={20} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-6 pb-28">
        <div className="rounded-2xl border border-white/5 bg-surface p-12 text-center">
          <h2 className="font-heading text-2xl font-light text-text-primary mb-3">Entre na comunidade</h2>
          <p className="text-text-muted text-sm mb-8">Crie uma conta para participar das discussões.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all"
          >
            Entrar / Criar conta
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await authedFetch('/api/community/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: name || profile.name, bio: bio !== '' ? bio : profile.bio }),
    });
    await refreshProfile();
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = async () => {
    await communitySignOut();
    router.push('/comunidade');
  };

  return (
    <div className="max-w-xl mx-auto px-6 pb-28">
      {/* Profile card */}
      <div className="rounded-2xl border border-white/5 bg-surface p-7 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-heading ${
            profile.role === 'founder' ? 'bg-accent/15 border border-accent/30 text-accent' : 'bg-white/5 border border-white/10 text-text-primary'
          }`}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <p className={`font-medium text-base ${profile.role === 'founder' ? 'text-accent' : 'text-text-primary'}`}>
              {profile.name}
            </p>
            <p className="text-text-muted text-xs mt-0.5">
              {profile.role === 'founder' ? 'Fundador · Rafael Moreira' :
               profile.role === 'moderator' ? 'Moderador' : 'Membro'}
              {' · '}
              {profile.postCount} {profile.postCount === 1 ? 'publicação' : 'publicações'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-text-muted text-xs mb-1.5">Nome de exibição</label>
            <input
              type="text"
              value={name || profile.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1.5">Sobre você (opcional)</label>
            <textarea
              rows={3}
              value={bio !== '' ? bio : (profile.bio ?? '')}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Uma linha sobre quem você é..."
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            {saving ? <Loader size={13} className="animate-spin" /> : saved ? <CheckCircle size={13} /> : <Save size={13} />}
            {saved ? 'Salvo!' : 'Salvar alterações'}
          </button>
        </form>
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-text-muted hover:text-red-400 text-sm transition-colors"
      >
        <LogOut size={14} /> Sair da comunidade
      </button>
    </div>
  );
}
