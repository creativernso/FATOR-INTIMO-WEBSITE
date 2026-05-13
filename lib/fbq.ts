/* eslint-disable @typescript-eslint/no-explicit-any */

// Client-side helper to fire Meta Pixel events safely. If the pixel isn't
// loaded (no NEXT_PUBLIC_FB_PIXEL_ID, ad-blocker, server render) the calls
// are silent no-ops.

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';

export function fbq(...args: any[]): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  try {
    window.fbq(...args);
  } catch {
    // ignore
  }
}

export const trackPageView = () => fbq('track', 'PageView');
export const trackViewContent = (params?: { content_ids?: string[]; content_name?: string; content_type?: string; value?: number; currency?: string }) =>
  fbq('track', 'ViewContent', params);
export const trackLead = (params?: { content_name?: string; value?: number; currency?: string }) =>
  fbq('track', 'Lead', params);
export const trackInitiateCheckout = (params?: { content_ids?: string[]; value?: number; currency?: string }) =>
  fbq('track', 'InitiateCheckout', params);
export const trackPurchase = (params?: { content_ids?: string[]; content_name?: string; value: number; currency?: string }) =>
  fbq('track', 'Purchase', { currency: 'BRL', ...params });
