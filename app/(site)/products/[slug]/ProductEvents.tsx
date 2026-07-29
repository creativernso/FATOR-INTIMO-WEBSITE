'use client';

import { useEffect } from 'react';
import { trackViewContent } from '@/lib/fbq';

interface Props {
  productId: string;
  productTitle: string;
  value: number;
}

// On a hard navigation (e.g. a paid ad click landing straight on this page),
// MetaPixel hasn't had a chance to define window.fbq yet — its base-code
// injection is gated behind an async consent check that always needs an
// extra React render pass. A fire-and-forget trackViewContent() here would
// silently no-op. Poll briefly for fbq readiness instead (see PurchaseEvent
// for the same fix on the checkout confirmation page).
const MAX_WAIT_MS = 8000;
const POLL_INTERVAL_MS = 200;

export default function ProductEvents({ productId, productTitle, value }: Props) {
  useEffect(() => {
    let cancelled = false;
    let waited = 0;
    const tryFire = () => {
      if (cancelled) return;
      if (typeof window.fbq !== 'function') {
        waited += POLL_INTERVAL_MS;
        if (waited < MAX_WAIT_MS) setTimeout(tryFire, POLL_INTERVAL_MS);
        return;
      }
      trackViewContent({
        content_ids: [productId],
        content_name: productTitle,
        content_type: 'product',
        value,
        currency: 'BRL',
      });
    };
    tryFire();

    return () => {
      cancelled = true;
    };
  }, [productId, productTitle, value]);
  return null;
}
