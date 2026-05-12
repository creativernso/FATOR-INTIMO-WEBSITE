'use client';

import { useState, useMemo } from 'react';
import { Clock, TrendingUp, Flame } from 'lucide-react';
import { CommunityPost } from '@/lib/types';
import PostCard from './PostCard';

type FeedFilter = 'recentes' | 'em-alta' | 'mais-reagidos';

interface Props {
  posts: CommunityPost[];
}

export default function FeedClient({ posts }: Props) {
  const [filter, setFilter] = useState<FeedFilter>('recentes');

  const sorted = useMemo(() => {
    if (filter === 'em-alta') {
      return [...posts].sort((a, b) => (b.viewCount ?? 0) + b.reactionCount * 2 - ((a.viewCount ?? 0) + a.reactionCount * 2));
    }
    if (filter === 'mais-reagidos') {
      return [...posts].sort((a, b) => b.reactionCount - a.reactionCount);
    }
    return posts;
  }, [posts, filter]);

  const tabs = [
    { id: 'recentes' as FeedFilter, icon: Clock, label: 'Recentes' },
    { id: 'em-alta' as FeedFilter, icon: TrendingUp, label: 'Em alta' },
    { id: 'mais-reagidos' as FeedFilter, icon: Flame, label: 'Mais reagidos' },
  ];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white/3 border border-white/6 rounded-xl p-1 mb-6">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
              filter === id
                ? 'bg-white/10 text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Icon size={11} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Post list */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-surface">
          <p className="text-4xl mb-4 opacity-20">◎</p>
          <p className="text-text-muted text-sm">Nenhuma publicação ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((post) => (
            <PostCard key={post.id} post={post} featured={!!(post.featured || post.pinned)} />
          ))}
        </div>
      )}
    </div>
  );
}
