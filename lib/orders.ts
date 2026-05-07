import fs from 'fs';
import path from 'path';

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
}

const FILE = path.join(process.cwd(), 'data', 'orders.json');

export function getOrders(): Order[] {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  const existing = orders.findIndex((o) => o.sessionId === order.sessionId);
  if (existing === -1) orders.push(order);
  else orders[existing] = order;
  fs.writeFileSync(FILE, JSON.stringify(orders, null, 2));
}

export function getOrderBySession(sessionId: string): Order | undefined {
  return getOrders().find((o) => o.sessionId === sessionId);
}
