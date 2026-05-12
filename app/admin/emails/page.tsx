'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send, Users, Mail, CheckCircle, AlertCircle, Loader, Plus, Trash2,
  BarChart2, Zap, ChevronDown, ChevronUp, Upload, Download, X, FlaskConical,
  Clock, Play, Pause, Settings,
} from 'lucide-react';
import { EmailCampaign, EmailAutomation, Lead } from '@/lib/types';

const fs = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

type Tab = 'campaigns' | 'contacts' | 'automations' | 'analytics';
type Segment = EmailCampaign['segment'];

const SEGMENTS: { val: Segment; label: string; desc: string }[] = [
  { val: 'all', label: 'Todos', desc: 'Todos os leads com e-mail' },
  { val: 'guide_downloaded', label: 'Baixaram guia', desc: 'Leads que já baixaram um guia' },
  { val: 'no_purchase', label: 'Sem compra', desc: 'Leads que nunca compraram' },
];

const TEMPLATES = [
  { label: 'Novo artigo', subject: 'Novo artigo no Fator Íntimo', body: 'Olá, {nome}!\n\nPublicamos um novo artigo que pode transformar a forma como você entende seus relacionamentos.\n\nAcesse agora em fatorintimo.com/blog\n\nCom carinho,\nFator Íntimo' },
  { label: 'Novo produto', subject: 'Novidade exclusiva para você', body: 'Olá, {nome}!\n\nTemos uma novidade especial para você. Nosso novo material está disponível com condições exclusivas para quem já faz parte da nossa comunidade.\n\nAcesse: fatorintimo.com/products\n\nFator Íntimo' },
  { label: 'Newsletter', subject: 'Insights da semana — Fator Íntimo', body: 'Olá, {nome}!\n\nAqui estão os principais insights desta semana sobre psicologia das relações.\n\n[Escreva o conteúdo aqui]\n\nFator Íntimo' },
  { label: 'Re-engajamento', subject: 'Sentimos sua falta, {nome}', body: 'Olá, {nome}!\n\nFaz algum tempo que não nos conectamos. Queremos lembrar que nossa comunidade está aqui para você.\n\nConfira o que há de novo: fatorintimo.com\n\nFator Íntimo' },
  { label: 'Oferta especial', subject: '⏰ Oferta especial — apenas para você', body: 'Olá, {nome}!\n\nPreparamos uma condição especial exclusiva para membros da nossa lista.\n\nAproveite antes que expire: fatorintimo.com/products\n\nFator Íntimo' },
];

const TRIGGER_LABELS: Record<EmailAutomation['trigger'], string> = {
  signup: 'Após cadastro',
  guide_download: 'Após baixar guia',
  purchase: 'Após compra',
  inactive_30d: 'Inativo por 30 dias',
  inactive_60d: 'Inativo por 60 dias',
};

const DEFAULT_AUTOMATIONS: Omit<EmailAutomation, 'id' | 'totalSent' | 'createdAt'>[] = [
  { name: 'Boas-vindas', trigger: 'signup', delayDays: 0, subject: 'Bem-vindo ao Fator Íntimo, {nome}!', body: 'Olá, {nome}!\n\nSeja bem-vindo ao Fator Íntimo. Você deu um passo importante ao se juntar a nós.\n\nAqui você encontrará guias, artigos e uma comunidade de pessoas que, assim como você, buscam relacionamentos mais conscientes e profundos.\n\nComece explorando nossos guias gratuitos: fatorintimo.com/guia\n\nCom carinho,\nFator Íntimo', active: true },
  { name: 'Follow-up do guia (3 dias)', trigger: 'guide_download', delayDays: 3, subject: 'Você já leu o guia, {nome}?', body: 'Olá, {nome}!\n\nHá 3 dias você baixou nosso guia. Conseguiu dar uma olhada?\n\nCaso queira aprofundar o que aprendeu, temos mais recursos esperando por você em fatorintimo.com\n\nFator Íntimo', active: true },
  { name: 'Re-engajamento (30 dias)', trigger: 'inactive_30d', delayDays: 30, subject: 'Sentimos sua falta, {nome}', body: 'Olá, {nome}!\n\nFaz um tempo que não nos vemos por aqui. Você está bem?\n\nPublicamos muito conteúdo novo sobre psicologia emocional e relacionamentos. Venha conferir: fatorintimo.com\n\nFator Íntimo', active: false },
];

function statusBadge(status: EmailCampaign['status']) {
  const map: Record<string, string> = {
    sent: 'text-green-400 bg-green-400/10 border-green-400/20',
    sending: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    scheduled: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    failed: 'text-red-400 bg-red-400/10 border-red-400/20',
    draft: 'text-text-muted bg-white/5 border-white/10',
  };
  const labels: Record<string, string> = { sent: 'Enviado', sending: 'Enviando...', scheduled: 'Agendado', failed: 'Falhou', draft: 'Rascunho' };
  return { cls: map[status] || '', label: labels[status] || status };
}

function timeAgo(iso: string) {
  if (!iso) return '—';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminEmails() {
  const [tab, setTab] = useState<Tab>('campaigns');

  // ── Campaign state ───────────────────────────────────────
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [segment, setSegment] = useState<Segment>('all');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [campaignResult, setCampaignResult] = useState<EmailCampaign | null>(null);
  const [campaignError, setCampaignError] = useState('');

  // ── Contact state ────────────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadSource, setLeadSource] = useState('all');
  const [csvImporting, setCsvImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Automation state ─────────────────────────────────────
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [editingAuto, setEditingAuto] = useState<EmailAutomation | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);

  // ── Test email ───────────────────────────────────────────
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);

  // Initial load
  useEffect(() => {
    fetch('/api/leads').then((r) => r.json()).then(setLeads);
    fetch('/api/admin/campaigns').then((r) => r.json()).then((d) => Array.isArray(d) && setCampaigns(d));
    fetch('/api/admin/automations').then((r) => r.json()).then((d) => Array.isArray(d) && setAutomations(d));
  }, []);

  const emailLeads = leads.filter((l) => l.email);
  const totalSent = campaigns.filter((c) => c.status === 'sent').reduce((s, c) => s + c.sentCount, 0);

  // ── Campaign actions ─────────────────────────────────────
  const handleSendCampaign = async () => {
    if (!subject.trim() || !emailBody.trim()) { setCampaignError('Preencha o assunto e o corpo.'); return; }
    setSending(true); setCampaignError(''); setCampaignResult(null);
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, emailBody, segment, scheduledAt: scheduledAt || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setCampaignResult(data);
        setCampaigns((prev) => [data, ...prev.filter((c) => c.id !== data.id)]);
        setShowComposer(false);
        setSubject(''); setEmailBody(''); setScheduledAt('');
      } else {
        setCampaignError(data.error || 'Erro ao enviar.');
      }
    } catch { setCampaignError('Erro de conexão.'); }
    finally { setSending(false); }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Excluir campanha?')) return;
    await fetch('/api/admin/campaigns', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setCampaigns((p) => p.filter((c) => c.id !== id));
  };

  // ── CSV import ───────────────────────────────────────────
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvImporting(true);
    const text = await file.text();
    const lines = text.split('\n').slice(1).filter(Boolean);
    let added = 0;
    for (const line of lines) {
      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      const [name, email] = cols;
      if (!email?.includes('@')) continue;
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name || email, email, source: 'csv_import' }),
        });
        added++;
      } catch { /* skip */ }
    }
    const updated = await fetch('/api/leads').then((r) => r.json());
    setLeads(updated);
    setCsvImporting(false);
    alert(`${added} contatos importados com sucesso.`);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCSVExport = () => {
    const rows = [['Nome', 'Email', 'WhatsApp', 'Fonte', 'Data'], ...emailLeads.map((l) => [l.name, l.email || '', l.whatsapp || '', l.source, l.createdAt.split('T')[0]])];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'contacts.csv'; a.click();
  };

  // ── Automation actions ───────────────────────────────────
  const saveAutomation = async (auto: EmailAutomation) => {
    setAutoSaving(true);
    const res = await fetch('/api/admin/automations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(auto) });
    const data = await res.json();
    setAutomations((prev) => { const idx = prev.findIndex((a) => a.id === data.id); return idx >= 0 ? prev.map((a) => a.id === data.id ? data : a) : [data, ...prev]; });
    setEditingAuto(null); setAutoSaving(false);
  };

  const toggleAuto = (auto: EmailAutomation) => saveAutomation({ ...auto, active: !auto.active });

  const deleteAuto = async (id: string) => {
    if (!confirm('Excluir automação?')) return;
    await fetch('/api/admin/automations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setAutomations((p) => p.filter((a) => a.id !== id));
  };

  const seedDefaultAutomations = async () => {
    for (const a of DEFAULT_AUTOMATIONS) {
      const full: EmailAutomation = { id: crypto.randomUUID(), totalSent: 0, createdAt: new Date().toISOString(), ...a };
      await saveAutomation(full);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) return;
    setTestSending(true); setTestResult(null);
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: testEmail }) });
      setTestResult(await res.json());
    } catch (e) { setTestResult({ error: String(e) }); }
    finally { setTestSending(false); }
  };

  const filteredLeads = emailLeads.filter((l) => {
    if (leadSource !== 'all' && l.source !== leadSource) return false;
    if (leadSearch && !l.name.toLowerCase().includes(leadSearch.toLowerCase()) && !(l.email || '').toLowerCase().includes(leadSearch.toLowerCase())) return false;
    return true;
  });
  const sources = ['all', ...Array.from(new Set(leads.map((l) => l.source))).filter(Boolean)];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'campaigns', label: 'Campanhas', icon: Send },
    { id: 'contacts', label: `Contatos (${emailLeads.length})`, icon: Users },
    { id: 'automations', label: 'Automações', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-text-muted tracking-widest uppercase mb-1.5" style={{ fontSize: fs('0.62rem', '0.72vw', '0.7rem') }}>Marketing</p>
          <h2 className="font-body text-text-primary font-medium" style={{ fontSize: fs('1.4rem', '2vw', '1.8rem') }}>Email Marketing</h2>
          <p className="text-text-muted mt-1" style={{ fontSize: fs('0.78rem', '0.9vw', '0.875rem) ') }}>
            {emailLeads.length} contatos · {campaigns.filter((c) => c.status === 'sent').length} campanhas enviadas · {totalSent.toLocaleString('pt-BR')} emails disparados
          </p>
        </div>
        {tab === 'campaigns' && (
          <button onClick={() => { setShowComposer(true); setCampaignResult(null); setCampaignError(''); }}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-accent/20">
            <Plus size={14} /> Nova campanha
          </button>
        )}
        {tab === 'contacts' && (
          <div className="flex items-center gap-2">
            <button onClick={handleCSVExport} className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-text-muted hover:text-text-primary px-3.5 py-2.5 rounded-xl text-xs transition-all">
              <Download size={12} /> Exportar CSV
            </button>
            <label className="flex items-center gap-1.5 bg-accent/10 hover:bg-accent/15 border border-accent/20 text-accent px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all">
              <Upload size={12} /> {csvImporting ? 'Importando...' : 'Importar CSV'}
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            </label>
          </div>
        )}
        {tab === 'automations' && automations.length === 0 && (
          <button onClick={seedDefaultAutomations} className="flex items-center gap-2 border border-accent/20 hover:bg-accent/10 text-accent px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Zap size={14} /> Criar automações padrão
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/3 border border-white/6 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${tab === id ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            <Icon size={11} /> <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* ── CAMPAIGNS TAB ───────────────────────────────── */}
      {tab === 'campaigns' && (
        <div className="space-y-5">

          {/* Composer modal */}
          {showComposer && (
            <div className="rounded-2xl border border-accent/15 bg-surface p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.9rem', '1vw', '0.95rem') }}>Nova campanha</h3>
                <button onClick={() => setShowComposer(false)} className="w-7 h-7 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/6 flex items-center justify-center"><X size={14} /></button>
              </div>

              {/* Templates */}
              <div>
                <label className="text-text-muted text-xs mb-2 block">Templates rápidos</label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button key={t.label} onClick={() => { setSubject(t.subject); setEmailBody(t.body); }}
                      className="px-3 py-1.5 rounded-lg text-xs border border-white/8 text-text-muted hover:text-text-primary hover:border-white/20 transition-all">{t.label}</button>
                  ))}
                </div>
              </div>

              {/* Segment */}
              <div>
                <label className="text-text-muted text-xs mb-2 block">Destinatários</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SEGMENTS.map((s) => (
                    <button key={s.val} onClick={() => setSegment(s.val)}
                      className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${segment === s.val ? 'border-accent/30 bg-accent/8 text-text-primary' : 'border-white/8 text-text-muted hover:border-white/16'}`}>
                      <p className="font-medium">{s.label}</p>
                      <p className="mt-0.5 opacity-70">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Assunto *</label>
                <input className="admin-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Novo guia exclusivo para você" />
              </div>

              {/* Body */}
              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Corpo do e-mail *</label>
                <textarea className="admin-input resize-none font-mono" rows={10} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Use {nome} para personalizar com o nome do lead..." />
                <p className="text-text-muted mt-1.5" style={{ fontSize: '0.68rem' }}>Use {'{nome}'} para inserir o nome do destinatário automaticamente.</p>
              </div>

              {/* Schedule */}
              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Agendar envio (opcional)</label>
                <input type="datetime-local" className="admin-input" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>

              {campaignError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2.5 border border-red-400/20">
                  <AlertCircle size={12} /> {campaignError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button onClick={handleSendCampaign} disabled={sending || !subject.trim() || !emailBody.trim()}
                  className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                  {sending ? <><Loader size={13} className="animate-spin" /> Enviando...</> : scheduledAt ? <><Clock size={13} /> Agendar</> : <><Send size={13} /> Enviar agora</>}
                </button>
                <button onClick={() => setShowComposer(false)} className="text-text-muted hover:text-text-primary text-sm transition-colors">Cancelar</button>
              </div>
            </div>
          )}

          {/* Campaign result */}
          {campaignResult && (
            <div className="flex items-start gap-3 text-sm bg-green-400/8 border border-green-400/20 rounded-xl px-4 py-3.5">
              <CheckCircle size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-medium">Campanha {campaignResult.status === 'scheduled' ? 'agendada' : 'enviada'}!</p>
                {campaignResult.status === 'sent' && (
                  <p className="text-text-muted mt-0.5" style={{ fontSize: '0.75rem' }}>
                    {campaignResult.sentCount} enviados · {campaignResult.failedCount} falhas · {campaignResult.totalRecipients} destinatários
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Campaign history */}
          <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-text-primary font-medium" style={{ fontSize: fs('0.85rem', '1vw', '0.95rem') }}>Histórico de campanhas</h3>
            </div>
            {campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <Mail size={28} className="text-white/10 mx-auto mb-3" />
                <p className="text-text-muted text-sm">Nenhuma campanha enviada ainda.</p>
                <button onClick={() => setShowComposer(true)} className="text-accent hover:underline text-sm mt-2">Criar primeira campanha →</button>
              </div>
            ) : (
              <div className="divide-y divide-white/4">
                {campaigns.map((c) => {
                  const { cls, label } = statusBadge(c.status);
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-text-secondary font-medium truncate" style={{ fontSize: fs('0.82rem', '0.92vw', '0.875rem') }}>{c.subject}</p>
                        <p className="text-text-muted mt-0.5 flex items-center gap-2" style={{ fontSize: '0.7rem' }}>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${cls}`}>{label}</span>
                          {c.sentAt && <span>{timeAgo(c.sentAt)}</span>}
                          <span>{SEGMENTS.find((s) => s.val === c.segment)?.label}</span>
                        </p>
                      </div>
                      {c.status === 'sent' && (
                        <div className="text-right hidden sm:block flex-shrink-0">
                          <p className="text-green-400 font-medium" style={{ fontSize: '0.8rem' }}>{c.sentCount} enviados</p>
                          {c.failedCount > 0 && <p className="text-red-400" style={{ fontSize: '0.7rem' }}>{c.failedCount} falhas</p>}
                        </div>
                      )}
                      <button onClick={() => deleteCampaign(c.id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/8 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Test email */}
          <div className="rounded-2xl border border-white/8 bg-surface p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FlaskConical size={13} className="text-text-muted" />
              <h3 className="text-text-primary text-sm font-medium">Email de teste</h3>
            </div>
            <div className="flex gap-3">
              <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="seu@email.com" className="admin-input flex-1" />
              <button onClick={handleTestEmail} disabled={testSending || !testEmail.trim()}
                className="flex items-center gap-2 bg-white/8 hover:bg-white/12 disabled:opacity-50 text-text-primary px-4 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap">
                {testSending ? <Loader size={12} className="animate-spin" /> : <Send size={12} />} Testar
              </button>
            </div>
            {testResult && (
              <pre className="bg-black/40 border border-white/6 rounded-xl p-4 text-xs text-text-muted overflow-auto max-h-40">{JSON.stringify(testResult, null, 2)}</pre>
            )}
          </div>
        </div>
      )}

      {/* ── CONTACTS TAB ────────────────────────────────── */}
      {tab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input className="admin-input flex-1" placeholder="Buscar por nome ou email..." value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} />
            <select className="admin-input w-full sm:w-48" value={leadSource} onChange={(e) => setLeadSource(e.target.value)}>
              {sources.map((s) => <option key={s} value={s}>{s === 'all' ? 'Todas as fontes' : s}</option>)}
            </select>
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
              <p className="text-text-muted text-xs">{filteredLeads.length} contatos</p>
              <p className="text-text-muted text-xs">{emailLeads.length} com email · {leads.filter((l) => l.guideDownloaded).length} baixaram guia</p>
            </div>
            <div className="divide-y divide-white/4 max-h-[500px] overflow-y-auto">
              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center"><p className="text-text-muted text-sm">Nenhum contato encontrado.</p></div>
              ) : filteredLeads.slice(0, 200).map((lead) => (
                <div key={lead.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center text-accent font-semibold flex-shrink-0 uppercase" style={{ fontSize: '0.72rem' }}>
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-secondary font-medium" style={{ fontSize: '0.85rem' }}>{lead.name}</p>
                    <p className="text-text-muted truncate" style={{ fontSize: '0.72rem' }}>{lead.email}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-text-muted border border-white/8 bg-white/4 px-2 py-0.5 rounded-full" style={{ fontSize: '0.65rem' }}>{lead.source}</span>
                    {lead.guideDownloaded && <span className="ml-1 text-blue-400 border border-blue-400/20 bg-blue-400/8 px-2 py-0.5 rounded-full" style={{ fontSize: '0.65rem' }}>guia</span>}
                  </div>
                  <p className="text-text-muted flex-shrink-0 hidden md:block" style={{ fontSize: '0.68rem' }}>{lead.createdAt.split('T')[0]}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-text-muted text-xs text-center">CSV: primeira linha deve ser <code className="bg-white/5 px-1 rounded">nome,email</code></p>
        </div>
      )}

      {/* ── AUTOMATIONS TAB ─────────────────────────────── */}
      {tab === 'automations' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-surface p-5">
            <p className="text-text-muted text-xs leading-relaxed">
              As automações são processadas diariamente às 09h UTC pelo cron <code className="bg-white/5 px-1 rounded">/api/cron/automations</code>. Para ativar, configure a variável <code className="bg-white/5 px-1 rounded">CRON_SECRET</code> no Vercel.
            </p>
          </div>

          {automations.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/5 bg-surface">
              <Zap size={28} className="text-white/10 mx-auto mb-3" />
              <p className="text-text-muted text-sm mb-4">Nenhuma automação configurada.</p>
              <button onClick={seedDefaultAutomations} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all mx-auto">
                <Zap size={13} /> Criar automações padrão
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {automations.map((auto) => (
                <div key={auto.id} className={`rounded-2xl border bg-surface p-5 ${auto.active ? 'border-green-400/15' : 'border-white/5 opacity-60'}`}>
                  {editingAuto?.id === auto.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-text-muted text-xs mb-1.5 block">Nome</label>
                          <input className="admin-input" value={editingAuto.name} onChange={(e) => setEditingAuto({ ...editingAuto, name: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-text-muted text-xs mb-1.5 block">Trigger</label>
                          <select className="admin-input" value={editingAuto.trigger} onChange={(e) => setEditingAuto({ ...editingAuto, trigger: e.target.value as EmailAutomation['trigger'] })}>
                            {Object.entries(TRIGGER_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-text-muted text-xs mb-1.5 block">Enviar após (dias)</label>
                          <input type="number" className="admin-input" value={editingAuto.delayDays} onChange={(e) => setEditingAuto({ ...editingAuto, delayDays: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="text-text-muted text-xs mb-1.5 block">Assunto</label>
                          <input className="admin-input" value={editingAuto.subject} onChange={(e) => setEditingAuto({ ...editingAuto, subject: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="text-text-muted text-xs mb-1.5 block">Corpo do e-mail</label>
                        <textarea className="admin-input resize-none font-mono" rows={6} value={editingAuto.body} onChange={(e) => setEditingAuto({ ...editingAuto, body: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => saveAutomation(editingAuto)} disabled={autoSaving} className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                          <CheckCircle size={13} /> {autoSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button onClick={() => setEditingAuto(null)} className="text-text-muted hover:text-text-primary text-sm transition-colors">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-text-primary font-medium text-sm">{auto.name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${auto.active ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-text-muted bg-white/5 border-white/10'}`}>
                            {auto.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-text-muted text-xs">{TRIGGER_LABELS[auto.trigger]} · {auto.delayDays} dia{auto.delayDays !== 1 ? 's' : ''} depois · {auto.totalSent} enviados</p>
                        <p className="text-text-muted text-xs mt-0.5 italic truncate">{auto.subject}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => toggleAuto(auto)} className={`p-2 rounded-lg transition-all ${auto.active ? 'text-green-400 hover:bg-green-400/8' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}>
                          {auto.active ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                        <button onClick={() => setEditingAuto(auto)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all">
                          <Settings size={13} />
                        </button>
                        <button onClick={() => deleteAuto(auto.id)} className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/8 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => {
                const newAuto: EmailAutomation = { id: crypto.randomUUID(), name: 'Nova automação', trigger: 'signup', delayDays: 1, subject: '', body: '', active: false, totalSent: 0, createdAt: new Date().toISOString() };
                setAutomations((p) => [...p, newAuto]);
                setEditingAuto(newAuto);
              }} className="w-full flex items-center justify-center gap-2 border border-dashed border-white/10 hover:border-white/20 text-text-muted hover:text-text-primary py-3 rounded-xl text-sm transition-all">
                <Plus size={13} /> Nova automação
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ───────────────────────────────── */}
      {tab === 'analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total de emails', value: totalSent.toLocaleString('pt-BR'), color: '#fe0050', icon: Send },
              { label: 'Campanhas enviadas', value: campaigns.filter((c) => c.status === 'sent').length, color: '#10b981', icon: CheckCircle },
              { label: 'Contatos ativos', value: emailLeads.length, color: '#3b82f6', icon: Users },
              { label: 'Automações ativas', value: automations.filter((a) => a.active).length, color: '#a855f7', icon: Zap },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-surface p-5">
                <stat.icon size={14} style={{ color: stat.color }} className="mb-3" />
                <p className="font-body font-semibold" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: stat.color }}>{stat.value}</p>
                <p className="text-text-muted mt-1" style={{ fontSize: '0.72rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-text-primary font-medium text-sm">Desempenho por campanha</h3>
            </div>
            <div className="divide-y divide-white/4">
              {campaigns.filter((c) => c.status === 'sent').slice(0, 10).map((c) => {
                const rate = c.totalRecipients > 0 ? Math.round((c.sentCount / c.totalRecipients) * 100) : 0;
                return (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-text-secondary text-sm font-medium truncate">{c.subject}</p>
                      <p className="text-text-muted" style={{ fontSize: '0.7rem' }}>{timeAgo(c.sentAt || c.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-green-400 text-sm font-medium">{c.sentCount}</p>
                        <p className="text-text-muted" style={{ fontSize: '0.65rem' }}>enviados</p>
                      </div>
                      {c.failedCount > 0 && (
                        <div className="text-right">
                          <p className="text-red-400 text-sm font-medium">{c.failedCount}</p>
                          <p className="text-text-muted" style={{ fontSize: '0.65rem' }}>falhas</p>
                        </div>
                      )}
                      <div className="w-16 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${rate}%` }} />
                      </div>
                      <p className="text-text-muted w-8 text-right" style={{ fontSize: '0.7rem' }}>{rate}%</p>
                    </div>
                  </div>
                );
              })}
              {campaigns.filter((c) => c.status === 'sent').length === 0 && (
                <div className="p-10 text-center"><p className="text-text-muted text-sm">Nenhuma campanha enviada ainda.</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
