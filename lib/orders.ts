import { getAdminDb } from './firebase-admin';

export interface Order {
  id: string;
  sessionId: string;
  productId: string;
  productTitle: string;
  customerEmail: string;
  customerName?: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
  downloadUrl?: string;
  reviewRequestSentAt?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

const db = () => getAdminDb();

export async function getOrders(): Promise<Order[]> {
  const snap = await db().collection('orders').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data() as Order);
}

export async function saveOrder(order: Order): Promise<void> {
  await db().collection('orders').doc(order.id).set(order);
}

export async function getOrderBySession(sessionId: string): Promise<Order | undefined> {
  const snap = await db().collection('orders').where('sessionId', '==', sessionId).limit(1).get();
  if (snap.empty) return undefined;
  return snap.docs[0].data() as Order;
}

export async function markOrderReviewRequestSent(orderId: string): Promise<void> {
  await db().collection('orders').doc(orderId).update({
    reviewRequestSentAt: new Date().toISOString(),
  });
}

// ─── Abandoned checkouts ────────────────────────────────────────────────────

export interface AbandonedCheckout {
  id: string;
  sessionId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  customerEmail: string;
  customerName?: string;
  amountTotal: number;
  currency: string;
  createdAt: string; // when the Stripe Checkout Session expired (i.e. was abandoned)
  recoveryEmailSentAt?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

export async function getAbandonedCheckouts(): Promise<AbandonedCheckout[]> {
  const snap = await db().collection('abandonedCheckouts').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data() as AbandonedCheckout);
}

export async function saveAbandonedCheckout(item: AbandonedCheckout): Promise<void> {
  await db().collection('abandonedCheckouts').doc(item.id).set(item);
}

export async function markAbandonedCheckoutRecoveryEmailSent(id: string): Promise<void> {
  await db().collection('abandonedCheckouts').doc(id).update({
    recoveryEmailSentAt: new Date().toISOString(),
  });
}
