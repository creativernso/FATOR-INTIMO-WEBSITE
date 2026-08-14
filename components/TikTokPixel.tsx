'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TIKTOK_PIXEL_ID, ttqPage } from '@/lib/ttq';
import { onConsentChange } from '@/lib/cookie-consent';

// Loads the TikTok Pixel base code once and fires a page view automatically
// on every client-side navigation. Renders nothing visible. Mirrors
// components/MetaPixel.tsx.
export function TikTokPixel() {
  const pathname = usePathname();
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => onConsentChange((d) => setMarketingConsent(d.marketing)), []);

  // Inject base script once, only after the visitor consents to marketing cookies
  useEffect(() => {
    if (!marketingConsent) return;
    if (!TIKTOK_PIXEL_ID) return;
    if (typeof window === 'undefined') return;
    if (window.ttq) return;

    // TikTok Pixel base code (slightly reformatted, identical behaviour)
    /* eslint-disable @typescript-eslint/no-explicit-any, prefer-rest-params */
    (function (w: any, d: Document, t: string) {
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
        'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
        'holdConsent', 'revokeConsent', 'grantConsent',
      ];
      ttq.setAndDefer = function (target: any, method: string) {
        target[method] = function () {
          target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (id: string) {
        const instance = ttq._i[id] || [];
        for (let n = 0; n < instance.methods.length; n++) ttq.setAndDefer(instance, instance.methods[n]);
        return instance;
      };
      ttq.load = function (id: string, options?: any) {
        const src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = src;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[id] = options || {};
        const script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `${src}?sdkid=${id}&lib=${t}`;
        const first = d.getElementsByTagName('script')[0];
        first.parentNode?.insertBefore(script, first);
      };

      ttq.load(TIKTOK_PIXEL_ID);
      ttq.page();
    })(window, document, 'ttq');
    /* eslint-enable @typescript-eslint/no-explicit-any, prefer-rest-params */
  }, [marketingConsent]);

  // Fire a page view on every route change
  useEffect(() => {
    if (!marketingConsent || !TIKTOK_PIXEL_ID) return;
    ttqPage();
  }, [pathname, marketingConsent]);

  return null;
}
