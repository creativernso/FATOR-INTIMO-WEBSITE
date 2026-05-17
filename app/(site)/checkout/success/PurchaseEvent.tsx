'use client';

import { useEffect, useRef } from 'react';
import { trackPurchase } from '@/lib/fbq';

interface Props {
  sessionId: string;
  productId?: string;
  productName?: string;
  value: number;
}

export default function PurchaseEvent({ sessionId, productId, productName, value }: Props) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    // Use sessionStorage to ensure we don't double-fire on remount/refresh
    try {
      const key = `fbq_purchase_${sessionId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {}
    trackPurchase({
      content_ids: productId ? [productId] : undefined,
      content_name: productName,
      value,
      currency: 'BRL',
      // Same event_id as the server-side CAPI Purchase call so Meta dedupes.
      eventID: `purchase-${sessionId}`,
    });
  }, [sessionId, productId, productName, value]);
  return null;
}
