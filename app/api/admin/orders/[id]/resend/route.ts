import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/orders';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { purchaseConfirmationHtml, purchaseConfirmationText } from '@/lib/email-template';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!resend || !order.customerEmail) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fatorintimo.com';
  const downloadUrl = `${baseUrl}/api/download?session_id=${order.sessionId}&redirect=1`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: `Seu acesso a ${order.productTitle} — reenvio`,
    html: purchaseConfirmationHtml({
      productTitle: order.productTitle,
      customerName: order.customerName,
      downloadUrl,
    }),
    text: purchaseConfirmationText({
      productTitle: order.productTitle,
      customerName: order.customerName,
      downloadUrl,
    }),
  });

  return NextResponse.json({ ok: true });
}
