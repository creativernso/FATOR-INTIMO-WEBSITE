import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { resend, FROM_EMAIL } from '@/lib/resend';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('fi_session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await getAdminAuth().verifySessionCookie(session, true);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { to } = await req.json();
  if (!to) return NextResponse.json({ error: 'Destinatário obrigatório.' }, { status: 400 });

  const diagnostics = {
    hasApiKey: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 8) + '...',
    fromEmail: FROM_EMAIL,
    resendReady: !!resend,
    result: null as unknown,
    error: null as unknown,
  };

  if (!resend) {
    return NextResponse.json({ ...diagnostics, error: 'RESEND_API_KEY não configurado.' }, { status: 503 });
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '[Teste] Fator Íntimo: Email funcionando',
      html: `
        <div style="font-family:sans-serif;background:#111;color:#ddd;padding:40px;border-radius:12px;max-width:500px;margin:0 auto;">
          <p style="color:#fe0050;font-size:11px;letter-spacing:4px;text-transform:uppercase;">FATOR ÍNTIMO</p>
          <h2 style="color:#fff;font-weight:400;">Email de teste ✓</h2>
          <p>Se você recebeu este email, o sistema de envio está funcionando corretamente.</p>
          <p style="color:#888;font-size:12px;">Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `,
      text: 'Email de teste do Fator Íntimo. Se você recebeu este email, o sistema está funcionando.',
    });
    diagnostics.result = result;
  } catch (err: unknown) {
    diagnostics.error = err instanceof Error ? { message: err.message, name: err.name } : String(err);
  }

  return NextResponse.json(diagnostics);
}
