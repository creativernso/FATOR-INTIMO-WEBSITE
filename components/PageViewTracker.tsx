'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getOrCreateVisitorId } from '@/lib/visitor-id';
import { captureUtmFromUrl, getStoredUtm } from '@/lib/utm';
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
  }, []);

  useEffect(() => {
    if (!analyticsConsent) return;
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, ...getStoredUtm() }),
    }).catch(() => {});
  }, [pathname, analyticsConsent]);

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
