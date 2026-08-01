'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getOrCreateVisitorId } from '@/lib/visitor-id';
import { captureUtmFromUrl, getStoredUtm } from '@/lib/utm';
import { captureAffiliateRefFromUrl } from '@/lib/affiliate-ref';
import { onConsentChange } from '@/lib/cookie-consent';

const HEARTBEAT_INTERVAL_MS = 20 * 1000;

export function PageViewTracker() {
  const pathname = usePathname();
  const tracked = useRef<Set<string>>(new Set());
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => onConsentChange((d) => setAnalyticsConsent(d.analytics)), []);

  useEffect(() => {
    captureUtmFromUrl();
    captureAffiliateRefFromUrl();
  }, []);

  // Count a click only when ?ref= is actually present on this page load (a
  // real referral click), not on every subsequent page view during the
  // session where the code is merely still stored from earlier.
  useEffect(() => {
    if (!analyticsConsent) return;
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (!ref) return;
    fetch('/api/affiliates/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: ref }),
    }).catch(() => {});
  }, [analyticsConsent]);

  // Aggregate page-hit counting only (no visitor identity, no persistent
  // cookie-based profile — just a per-day, per-path tally, closer to a
  // server access log than to tracking). Fires unconditionally, unlike the
  // heartbeat/visitor-tracking effects below, which build a per-visitor
  // profile and stay gated behind analytics consent. Without this, business-
  // critical actions like starting checkout (never consent-gated) could
  // happen from a visit that was never counted at all, since a visitor who
  // decides fast might click "Comprar" before ever seeing the cookie banner.
  useEffect(() => {
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, ...getStoredUtm() }),
    }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (!analyticsConsent) return;
    const visitorId = getOrCreateVisitorId();
    const ping = () =>
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, path: pathRef.current, ...getStoredUtm() }),
        keepalive: true,
      }).catch(() => {});

    const id = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [analyticsConsent]);

  useEffect(() => {
    if (!analyticsConsent) return;
    fetch('/api/analytics/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getOrCreateVisitorId(), path: pathname, ...getStoredUtm() }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, analyticsConsent]);

  return null;
}
