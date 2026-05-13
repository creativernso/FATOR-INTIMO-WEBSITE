'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FB_PIXEL_ID, fbq } from '@/lib/fbq';

// Loads the Meta Pixel base code once and fires PageView automatically on
// every client-side navigation. Renders nothing visible.
export function MetaPixel() {
  const pathname = usePathname();

  // Inject base script once
  useEffect(() => {
    if (!FB_PIXEL_ID) return;
    if (typeof window === 'undefined') return;
    if (window.fbq) return;

    // Meta Pixel base code (slightly reformatted, identical behaviour)
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (function (f: any, b: Document, e: string, v: string) {
      let n: any;
      if (f.fbq) return;
      n = f.fbq = function () {
        // eslint-disable-next-line prefer-rest-params
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable @typescript-eslint/no-explicit-any */

    fbq('init', FB_PIXEL_ID);
    fbq('track', 'PageView');
  }, []);

  // Fire PageView on every route change
  useEffect(() => {
    if (!FB_PIXEL_ID || typeof window === 'undefined') return;
    fbq('track', 'PageView');
  }, [pathname]);

  if (!FB_PIXEL_ID) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        alt=""
        src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
