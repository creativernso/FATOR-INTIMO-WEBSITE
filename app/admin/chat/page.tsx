'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  collectionGroup,
  getDocs,
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

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load all sessions via collectionGroup
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

  const sendReply = async () => {
    const text = input.trim();
    if (!text || !activeSession || sending) return;
    setSending(true);
    setInput('');
    try {
      const db = getFirestoreClient();
      await addDoc(collection(db, 'chatSessions', activeSession, 'messages'), {
        text,
        from: 'admin',
        createdAt: serverTimestamp(),
        visitorId: activeSession,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: 'clamp(0.62rem, 0.72vw, 0.7rem)' }}>
          Mensagens
        </p>
        <h2 className="font-body text-text-primary font-medium" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2rem)' }}>
          Live Chat
        </h2>
        <p className="text-text-muted mt-1" style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.95rem)' }}>
          {sessions.length} conversa{sessions.length !== 1 ? 's' : ''} ativa{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>

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
            ) : sessions.map((s) => (
              <button
                key={s.visitorId}
                onClick={() => setActiveSession(s.visitorId)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-white/4 text-left transition-colors ${
                  activeSession === s.visitorId ? 'bg-accent/8 border-l-2 border-l-accent' : 'hover:bg-white/3'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-text-muted" />
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
            ))}
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
                <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
                  <User size={13} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-text-primary text-sm font-medium">Visitante</p>
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
                  onClick={sendReply}
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
    </div>
  );
}
