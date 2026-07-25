'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FB_PIXEL_ID, fbq } from '@/lib/fbq';
import { onConsentChange } from '@/lib/cookie-consent';

// Loads the Meta Pixel base code once and fires PageView automatically on
// every client-side navigation. Renders nothing visible.
export function MetaPixel() {
  const pathname = usePathname();
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => onConsentChange((d) => setMarketingConsent(d.marketing)), []);

  // Inject base script once, only after the visitor consents to marketing cookies
  useEffect(() => {
    if (!marketingConsent) return;
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
  }, [marketingConsent]);

  // Fire PageView on every route change
  useEffect(() => {
    if (!marketingConsent || !FB_PIXEL_ID || typeof window === 'undefined') return;
    fbq('track', 'PageView');
  }, [pathname, marketingConsent]);

  if (!FB_PIXEL_ID || !marketingConsent) return null;

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
