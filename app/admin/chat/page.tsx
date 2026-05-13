'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Clock, Settings, Plus, Trash2, Check } from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  collectionGroup,
  doc,
} from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase';

interface ChatMessage {
  id: string;
  text: string;
  from: 'visitor' | 'admin';
  createdAt: string;
  visitorId: string;
}

interface Session {
  visitorId: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

interface Presence {
  online: boolean;
  lastSeen: string;
}

interface ChatSettings {
  welcomeMessage: string;
  offlineMessage: string;
  quickReplies: string[];
}

const DEFAULT_SETTINGS: ChatSettings = {
  welcomeMessage: 'Olá! Recebemos sua mensagem e entraremos em contato em breve. 💬',
  offlineMessage: 'Deixe sua mensagem e responderemos em breve.',
  quickReplies: [],
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function isOnline(presence: Presence | undefined): boolean {
  if (!presence?.online) return false;
  return Date.now() - new Date(presence.lastSeen).getTime() < 3 * 60 * 1000;
}

type Tab = 'chat' | 'settings';

export default function AdminChatPage() {
  const [tab, setTab] = useState<Tab>('chat');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, Presence>>({});
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newReply, setNewReply] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load sessions from messages collectionGroup
  useEffect(() => {
    const db = getFirestoreClient();
    const q = query(collectionGroup(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const byVisitor: Record<string, Session> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const visitorId = data.visitorId as string;
        if (!visitorId) return;
        const ts = data.createdAt as Timestamp | null;
        const createdAt = ts ? ts.toDate().toISOString() : new Date().toISOString();
        if (!byVisitor[visitorId] || createdAt > byVisitor[visitorId].lastAt) {
          byVisitor[visitorId] = {
            visitorId,
            lastMessage: data.text as string,
            lastAt: createdAt,
            unread: data.from === 'visitor' && !byVisitor[visitorId] ? 1 : (byVisitor[visitorId]?.unread ?? 0),
          };
        }
      });
      setSessions(Object.values(byVisitor).sort((a, b) => b.lastAt.localeCompare(a.lastAt)));
    });
    return unsub;
  }, []);

  // Load presence from chatSessions collection docs
  useEffect(() => {
    const db = getFirestoreClient();
    const unsub = onSnapshot(collection(db, 'chatSessions'), (snap) => {
      const map: Record<string, Presence> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const ts = data.lastSeen as Timestamp | null;
        map[d.id] = {
          online: !!data.online,
          lastSeen: ts ? ts.toDate().toISOString() : '',
        };
      });
      setPresenceMap(map);
    });
    return unsub;
  }, []);

  // Load messages for active session
  useEffect(() => {
    if (!activeSession) return;
    const db = getFirestoreClient();
    const q = query(
      collection(db, 'chatSessions', activeSession, 'messages'),
      orderBy('createdAt', 'asc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => {
        const data = d.data();
        const ts = data.createdAt as Timestamp | null;
        return {
          id: d.id,
          text: data.text as string,
          from: data.from as 'visitor' | 'admin',
          createdAt: ts ? ts.toDate().toISOString() : new Date().toISOString(),
          visitorId: data.visitorId as string,
        };
      }));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsub;
  }, [activeSession]);

  // Load chat settings
  useEffect(() => {
    fetch('/api/admin/chat/settings')
      .then((r) => r.json())
      .then((data: ChatSettings) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => {});
  }, []);

  const sendReply = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || !activeSession || sending) return;
    setSending(true);
    setInput('');
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: activeSession, text: msgText, from: 'admin' }),
      });
    } finally {
      setSending(false);
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await fetch('/api/admin/chat/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } finally {
      setSettingsSaving(false);
    }
  };

  const addQuickReply = () => {
    const t = newReply.trim();
    if (!t) return;
    setSettings((s) => ({ ...s, quickReplies: [...s.quickReplies, t] }));
    setNewReply('');
  };

  const removeQuickReply = (i: number) => {
    setSettings((s) => ({ ...s, quickReplies: s.quickReplies.filter((_, idx) => idx !== i) }));
  };

  const onlineCount = sessions.filter((s) => isOnline(presenceMap[s.visitorId])).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: 'clamp(0.62rem, 0.72vw, 0.7rem)' }}>
            Mensagens
          </p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2rem)' }}>
            Live Chat
          </h2>
          <p className="text-text-muted mt-1 flex items-center gap-2" style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.95rem)' }}>
            {sessions.length} conversa{sessions.length !== 1 ? 's' : ''}
            {onlineCount > 0 && (
              <span className="flex items-center gap-1 text-green-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {onlineCount} online
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {(['chat', 'settings'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t ? 'bg-accent text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              {t === 'chat' ? <MessageCircle size={14} /> : <Settings size={14} />}
              {t === 'chat' ? 'Conversas' : 'Configurações'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat tab */}
      {tab === 'chat' && (
        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden" style={{ height: '65vh', display: 'flex' }}>
          {/* Session list */}
          <div className="w-64 lg:w-72 flex-shrink-0 border-r border-white/5 flex flex-col">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-text-muted text-xs font-medium tracking-widest uppercase">Conversas</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  <MessageCircle size={28} className="text-white/10" />
                  <p className="text-text-muted text-xs">Nenhuma mensagem ainda.</p>
                </div>
              ) : sessions.map((s) => {
                const online = isOnline(presenceMap[s.visitorId]);
                return (
                  <button
                    key={s.visitorId}
                    onClick={() => setActiveSession(s.visitorId)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-white/4 text-left transition-colors ${
                      activeSession === s.visitorId ? 'bg-accent/8 border-l-2 border-l-accent' : 'hover:bg-white/3'
                    }`}
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
                        <User size={13} className="text-text-muted" />
                      </div>
                      {online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0f0a04]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-secondary text-xs font-medium truncate">
                        {s.visitorId.slice(0, 16)}...
                      </p>
                      <p className="text-text-muted mt-0.5 truncate" style={{ fontSize: '11px' }}>{s.lastMessage}</p>
                    </div>
                    <span className="text-text-muted flex-shrink-0 mt-0.5" style={{ fontSize: '10px' }}>
                      {timeAgo(s.lastAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message area */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeSession ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                <MessageCircle size={36} className="text-white/10" />
                <p className="text-text-muted text-sm">Selecione uma conversa para responder.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
                      <User size={13} className="text-text-muted" />
                    </div>
                    {isOnline(presenceMap[activeSession]) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0f0a04]" />
                    )}
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium flex items-center gap-2">
                      Visitante
                      {isOnline(presenceMap[activeSession]) && (
                        <span className="text-green-400 text-xs font-normal">● Online agora</span>
                      )}
                    </p>
                    <p className="text-text-muted" style={{ fontSize: '11px' }}>{activeSession}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'admin'
                          ? 'bg-accent text-white rounded-br-sm'
                          : 'bg-white/8 text-text-secondary rounded-bl-sm border border-white/8'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 opacity-60 flex items-center gap-1 ${msg.from === 'admin' ? 'justify-end' : ''}`}>
                          <Clock size={9} /> {timeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Quick replies */}
                {settings.quickReplies.length > 0 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5 border-t border-white/5 pt-2">
                    {settings.quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => sendReply(reply)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-text-muted hover:border-accent/30 hover:text-accent transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reply box */}
                <div className="border-t border-white/5 p-4 flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    placeholder="Responder ao visitante..."
                    className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/30 transition-colors"
                  />
                  <button
                    onClick={() => sendReply()}
                    disabled={!input.trim() || sending}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  >
                    <Send size={13} /> Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-2xl border border-white/5 bg-surface p-6 space-y-5">
            <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }}>
              Mensagens Automáticas
            </h3>

            <div className="space-y-2">
              <label className="text-text-muted text-xs uppercase tracking-widest">Resposta de boas-vindas</label>
              <p className="text-text-muted text-xs">Enviada automaticamente após a primeira mensagem do visitante.</p>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => setSettings((s) => ({ ...s, welcomeMessage: e.target.value }))}
                rows={3}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/30 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-text-muted text-xs uppercase tracking-widest">Mensagem offline</label>
              <p className="text-text-muted text-xs">Exibida no widget quando nenhum admin está disponível.</p>
              <textarea
                value={settings.offlineMessage}
                onChange={(e) => setSettings((s) => ({ ...s, offlineMessage: e.target.value }))}
                rows={2}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/30 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface p-6 space-y-4">
            <h3 className="text-text-primary font-medium" style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1rem)' }}>
              Respostas Rápidas
            </h3>
            <p className="text-text-muted text-xs">Atalhos visíveis no chat para o admin clicar e enviar rapidamente.</p>

            <div className="space-y-2">
              {settings.quickReplies.length === 0 ? (
                <p className="text-text-muted text-sm py-2">Nenhuma resposta rápida configurada.</p>
              ) : settings.quickReplies.map((reply, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-2.5">
                  <p className="flex-1 text-text-secondary text-sm">{reply}</p>
                  <button
                    onClick={() => removeQuickReply(i)}
                    className="text-text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addQuickReply()}
                placeholder="Nova resposta rápida..."
                className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/30 transition-colors"
              />
              <button
                onClick={addQuickReply}
                disabled={!newReply.trim()}
                className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 disabled:opacity-40 text-text-primary px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={settingsSaving}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all"
          >
            {settingsSaved ? <><Check size={14} /> Salvo!</> : settingsSaving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      )}
    </div>
  );
}
