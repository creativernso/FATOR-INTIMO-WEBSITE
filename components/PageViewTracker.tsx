'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getOrCreateVisitorId } from '@/lib/visitor-id';
import { captureUtmFromUrl, getStoredUtm } from '@/lib/utm';

const HEARTBEAT_INTERVAL_MS = 20 * 1000;

export function PageViewTracker() {
  const pathname = usePathname();
  const tracked = useRef<Set<string>>(new Set());
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    captureUtmFromUrl();
  }, []);

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
  }, []);

  useEffect(() => {
    fetch('/api/analytics/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getOrCreateVisitorId(), path: pathname, ...getStoredUtm() }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
