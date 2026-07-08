'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getOrCreateVisitorId } from '@/lib/visitor-id';

const HEARTBEAT_INTERVAL_MS = 20 * 1000;

export function PageViewTracker() {
  const pathname = usePathname();
  const tracked = useRef<Set<string>>(new Set());
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    const ping = () =>
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, path: pathRef.current }),
        keepalive: true,
      }).catch(() => {});

    const id = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('/api/analytics/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getOrCreateVisitorId(), path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
