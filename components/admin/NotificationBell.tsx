'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, ShoppingBag, BookOpen, Users, MessageSquare, FileText, AlertTriangle, Heart, Check, X, LucideIcon } from 'lucide-react';
import { AdminNotification } from '@/lib/types';

const TYPE_CONFIG: Record<AdminNotification['type'], { icon: LucideIcon; color: string; bg: string }> = {
  purchase:         { icon: ShoppingBag,   color: 'text-green-400',  bg: 'bg-green-400/10'  },
  guide_download:   { icon: BookOpen,      color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  community_join:   { icon: Users,         color: 'text-purple-400', bg: 'bg-purple-400/10' },
  community_post:   { icon: Heart,         color: 'text-accent',     bg: 'bg-accent/10'     },
  community_report: { icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-400/10'    },
  comment:          { icon: MessageSquare, color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
  testimonial:      { icon: FileText,      color: 'text-sky-400',    bg: 'bg-sky-400/10'    },
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) setNotifications(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: undefined }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = async (id: string) => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) fetchNotifications(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-white flex items-center justify-center font-bold leading-none"
            style={{ fontSize: '9px' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-80 bg-surface border border-white/8 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-text-primary text-sm font-medium">Notificações</span>
              {unread > 0 && (
                <span className="bg-accent/15 text-accent text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unread} nova{unread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-accent transition-colors">
                <Check size={10} /> Marcar todas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-10 text-center text-text-muted text-xs">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="text-white/10 mx-auto mb-2" />
                <p className="text-text-muted text-xs">Nenhuma notificação ainda.</p>
              </div>
            ) : (
              notifications.slice(0, 30).map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.comment;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markOneRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3.5 border-b border-white/4 last:border-0 transition-colors ${
                      n.read ? 'opacity-50' : 'cursor-pointer hover:bg-white/3'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-text-primary text-xs font-medium leading-snug">{n.title}</p>
                        <span className="text-text-muted text-[10px] flex-shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-text-muted text-xs mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                    </div>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/5 text-center">
              <button onClick={() => setOpen(false)} className="text-text-muted text-xs hover:text-accent transition-colors flex items-center gap-1 mx-auto">
                <X size={10} /> Fechar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
