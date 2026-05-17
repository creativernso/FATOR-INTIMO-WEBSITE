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

/**
 * Fires a Meta event and, when `eventID` is provided, attaches it as the
 * 4th argument so Meta can deduplicate with a matching server-side CAPI
 * call. Pattern from Meta docs: fbq('track', 'X', data, { eventID }).
 */
function track<T extends Record<string, unknown>>(
  name: string,
  params?: T & { eventID?: string },
) {
  if (!params) return fbq('track', name);
  const { eventID, ...data } = params;
  if (eventID) return fbq('track', name, data, { eventID });
  return fbq('track', name, data);
}

export const trackPageView = () => fbq('track', 'PageView');
export const trackViewContent = (params?: { content_ids?: string[]; content_name?: string; content_type?: string; value?: number; currency?: string; eventID?: string }) =>
  track('ViewContent', params);
export const trackLead = (params?: { content_name?: string; value?: number; currency?: string; eventID?: string }) =>
  track('Lead', params);
export const trackInitiateCheckout = (params?: { content_ids?: string[]; value?: number; currency?: string; eventID?: string }) =>
  track('InitiateCheckout', params);
export const trackPurchase = (params?: { content_ids?: string[]; content_name?: string; value: number; currency?: string; eventID?: string }) =>
  track('Purchase', { currency: 'BRL', ...params });
