/* eslint-disable @typescript-eslint/no-explicit-any */

// Client-side helper to fire TikTok Pixel events safely. If the pixel isn't
// loaded (no NEXT_PUBLIC_TIKTOK_PIXEL_ID, ad-blocker, server render) the
// calls are silent no-ops. Mirrors lib/fbq.ts, but TikTok's pixel exposes
// named methods (ttq.page(), ttq.track(event, data)) instead of a single
// callable function.

declare global {
  interface Window {
    ttq?: any;
  }
}

export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';

export function ttqPage(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.ttq?.page !== 'function') return;
  try {
    window.ttq.page();
  } catch {
    // ignore
  }
}

function ttqTrack(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (typeof window.ttq?.track !== 'function') return;
  try {
    window.ttq.track(event, params);
  } catch {
    // ignore
  }
}

export const trackPageView = () => ttqPage();
export const trackViewContent = (params?: { content_id?: string; content_name?: string; content_type?: string; value?: number; currency?: string }) =>
  ttqTrack('ViewContent', params);
export const trackInitiateCheckout = (params?: { content_id?: string; value?: number; currency?: string }) =>
  ttqTrack('InitiateCheckout', params);
export const trackLead = (params?: { content_name?: string; value?: number; currency?: string }) =>
  ttqTrack('CompleteRegistration', params);
export const trackPurchase = (params?: { content_id?: string; content_name?: string; value: number; currency?: string }) =>
  ttqTrack('CompletePayment', { currency: 'BRL', ...params });
