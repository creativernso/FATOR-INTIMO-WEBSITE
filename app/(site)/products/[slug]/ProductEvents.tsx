'use client';

import { useEffect } from 'react';
import { trackViewContent as trackViewContentMeta } from '@/lib/fbq';
import { trackViewContent as trackViewContentTikTok } from '@/lib/ttq';

interface Props {
  productId: string;
  productTitle: string;
  value: number;
}

// On a hard navigation (e.g. a paid ad click landing straight on this page),
// MetaPixel/TikTokPixel haven't had a chance to define window.fbq/window.ttq
// yet — their base-code injection is gated behind an async consent check
// that always needs an extra React render pass. A fire-and-forget
// trackViewContent() here would silently no-op. Poll briefly for readiness
// instead (see PurchaseEvent for the same fix on the checkout confirmation
// page). Meta and TikTok load independently, so each fires as soon as its
// own SDK is ready rather than waiting on both.
const MAX_WAIT_MS = 8000;
const POLL_INTERVAL_MS = 200;

export default function ProductEvents({ productId, productTitle, value }: Props) {
  useEffect(() => {
    let cancelled = false;
    let waited = 0;
    let metaFired = false;
    let tiktokFired = false;
    const tryFire = () => {
      if (cancelled) return;
      if (!metaFired && typeof window.fbq === 'function') {
        trackViewContentMeta({ content_ids: [productId], content_name: productTitle, content_type: 'product', value, currency: 'BRL' });
        metaFired = true;
      }
      if (!tiktokFired && typeof window.ttq?.track === 'function') {
        trackViewContentTikTok({ content_id: productId, content_name: productTitle, content_type: 'product', value, currency: 'BRL' });
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
  }, [productId, productTitle, value]);
  return null;
}
