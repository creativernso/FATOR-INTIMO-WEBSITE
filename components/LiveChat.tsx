'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  from: 'visitor' | 'admin';
  createdAt: string;
}

interface ChatSettings {
  welcomeMessage: string;
  quickReplies: string[];
}

const DEFAULT_WELCOME = 'Olá! Recebemos sua mensagem e entraremos em contato em breve. 💬';

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('fi_chat_visitor_id');
  if (!id) {
    id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('fi_chat_visitor_id', id);
  }
  return id;
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({ welcomeMessage: DEFAULT_WELCOME, quickReplies: [] });
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const lastIdsRef = useRef<string>('');

  useEffect(() => {
    setVisitorId(getVisitorId());
  }, []);

  // Load chat settings (via Firestore client doc — fall back silently if denied)
  useEffect(() => {
    fetch('/api/chat/settings-public').then((r) => r.json()).then((data) => {
      if (data?.welcomeMessage) setSettings({ welcomeMessage: data.welcomeMessage, quickReplies: data.quickReplies || [] });
    }).catch(() => {});
  }, []);

  // Poll messages every 2 seconds while chat exists
  const fetchMessages = useCallback(async () => {
    if (!visitorId) return;
    try {
      const res = await fetch(`/api/chat/messages?visitorId=${encodeURIComponent(visitorId)}`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs: ChatMessage[] = data.messages || [];
      const sig = msgs.map((m) => m.id).join(',');
      if (sig === lastIdsRef.current) return;
      lastIdsRef.current = sig;
      setMessages(msgs);
      if (!open || minimized) {
        const newAdminMsgs = msgs.filter((m) => m.from === 'admin' && !seenRef.current.has(m.id));
        if (newAdminMsgs.length > 0) setUnread((u) => u + newAdminMsgs.length);
      }
    } catch {}
  }, [visitorId, open, minimized]);

  useEffect(() => {
    if (!visitorId) return;
    fetchMessages();
    const id = setInterval(fetchMessages, 2500);
    return () => clearInterval(id);
  }, [visitorId, fetchMessages]);

  // Presence heartbeat
  useEffect(() => {
    if (!visitorId) return;
    const ping = (online: boolean) =>
      fetch('/api/chat/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, online }),
        keepalive: true,
      }).catch(() => {});
    ping(true);
    const id = setInterval(() => ping(true), 30000);
    const handleUnload = () => ping(false);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', handleUnload);
      ping(false);
    };
  }, [visitorId]);

  useEffect(() => {
    if (open && !minimized) {
      messages.forEach((m) => seenRef.current.add(m.id));
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [open, minimized, messages]);

  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || !visitorId || sending) return;
    setSending(true);
    setInput('');
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, text: msgText, from: 'visitor' }),
      });
      if (!res.ok) {
        console.error('[chat] send failed:', await res.text());
      }
      // Refresh messages immediately
      await fetchMessages();
    } catch (err) {
      console.error('[chat] send error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Chat window */}
      {open && !minimized && (
        <div
          className="w-80 sm:w-96 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
          style={{ background: '#130e09', boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(254,0,80,0.08)' }}
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8"
            style={{ background: 'linear-gradient(to right, rgba(254,0,80,0.08), transparent)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-[10px] font-bold text-accent">FÍ</div>
              <div>
                <p className="text-text-primary text-xs font-medium">Fator Íntimo</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-text-muted" style={{ fontSize: '10px' }}>Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(true)} className="w-7 h-7 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 flex items-center justify-center transition-all">
                <Minimize2 size={12} />
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 flex items-center justify-center transition-all">
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-4 h-64 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm">💬</div>
                <p className="text-text-muted text-xs leading-relaxed max-w-48">
                  Olá! Como podemos ajudar você hoje?
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.from === 'visitor'
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-white/8 text-text-secondary rounded-bl-sm border border-white/8'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {settings.quickReplies.length > 0 && messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {settings.quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(reply)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-accent/20 text-accent hover:bg-accent/10 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-white/8 p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Escreva uma mensagem..."
              className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent/30 transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="w-8 h-8 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 flex items-center justify-center transition-all flex-shrink-0"
            >
              <Send size={12} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {open && minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-accent/20 text-accent text-xs font-medium transition-all hover:bg-accent/10"
          style={{ background: '#130e09' }}
        >
          <MessageCircle size={13} />
          Fator Íntimo · Chat
          {unread > 0 && (
            <span className="w-4 h-4 bg-accent rounded-full text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>
          )}
        </button>
      )}

      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); setUnread(0); }}
          className="relative w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-xl shadow-accent/30 hover:shadow-accent/50 transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle size={22} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full text-accent text-[10px] font-bold flex items-center justify-center border-2 border-accent animate-bounce">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
