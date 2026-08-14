'use client';

import { useEffect, useRef } from 'react';
import { trackPurchase as trackPurchaseMeta } from '@/lib/fbq';
import { trackPurchase as trackPurchaseTikTok } from '@/lib/ttq';

interface Props {
  sessionId: string;
  productId?: string;
  productName?: string;
  value: number;
}

// This page is only ever reached via a hard, full-page redirect from Stripe's
// checkout domain back to the site — so on mount, MetaPixel hasn't had a
// chance to load window.fbq yet (its base-code injection is gated behind an
// async consent check that always needs an extra React render pass). A
// fire-and-forget trackPurchase() here would silently no-op. Poll briefly for
// fbq readiness instead — this is the one event we can't afford to lose.
const MAX_WAIT_MS = 8000;
const POLL_INTERVAL_MS = 200;

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

    let cancelled = false;
    let waited = 0;
    let metaFired = false;
    let tiktokFired = false;
    const tryFire = () => {
      if (cancelled) return;
      if (!metaFired && typeof window.fbq === 'function') {
        trackPurchaseMeta({
          content_ids: productId ? [productId] : undefined,
          content_name: productName,
          value,
          currency: 'BRL',
          // Same event_id as the server-side CAPI Purchase call so Meta dedupes.
          eventID: `purchase-${sessionId}`,
        });
        metaFired = true;
      }
      if (!tiktokFired && typeof window.ttq?.track === 'function') {
        trackPurchaseTikTok({ content_id: productId, content_name: productName, value, currency: 'BRL' });
        tiktokFired = true;
      }
      if (metaFired && tiktokFired) return;
      waited += POLL_INTERVAL_MS;
      if (waited < MAX_WAIT_MS) setTimeout(tryFire, POLL_INTERVAL_MS);
    };
    tryFire();

    return () => {
      cancelled = true;
    };
  }, [sessionId, productId, productName, value]);
  return null;
}
