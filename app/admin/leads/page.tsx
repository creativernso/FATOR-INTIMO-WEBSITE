import { getLeads } from '@/lib/db';
import { Users, Mail, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLeads() {
  const leads = (await getLeads()).slice().reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-text-primary text-xl font-medium">Leads</h2>
        <p className="text-text-muted text-sm mt-0.5">{leads.length} leads capturados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/5 bg-surface p-5">
          <p className="font-body text-3xl text-text-primary">{leads.length}</p>
          <p className="text-text-muted text-xs mt-1">Total de leads</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface p-5">
          <p className="font-body text-3xl text-text-primary">
            {leads.filter((l) => l.email).length}
          </p>
          <p className="text-text-muted text-xs mt-1">Por e-mail</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface p-5">
          <p className="font-body text-3xl text-text-primary">
            {leads.filter((l) => l.whatsapp).length}
          </p>
          <p className="text-text-muted text-xs mt-1">Por WhatsApp</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-surface overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-14 text-center">
            <Users size={32} className="text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-text-muted text-sm">Nenhum lead ainda.</p>
            <p className="text-text-muted text-xs mt-1">Os leads aparecerão aqui quando alguém preencher o formulário.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Nome</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider">Contato</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">Origem</th>
                <th className="text-left p-4 text-text-muted text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs text-accent flex-shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                      <p className="text-text-primary text-sm">{lead.name}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {lead.email ? (
                        <>
                          <Mail size={12} className="text-text-muted" />
                          <span className="text-text-secondary text-sm">{lead.email}</span>
                        </>
                      ) : (
                        <>
                          <Phone size={12} className="text-text-muted" />
                          <span className="text-text-secondary text-sm">{lead.whatsapp}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs border border-white/10 text-text-secondary rounded-full px-2.5 py-1">
                      {lead.source}
                    </span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <p className="text-text-muted text-xs">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </p>
                    <p className="text-text-muted text-xs">
                      {new Date(lead.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
