import crypto from 'crypto';

/**
 * Meta Conversions API client. Fires server-side events to Meta in parallel
 * to the client-side pixel, with the same `event_id` for deduplication.
 *
 * Why bother:
 *   - Ad-blockers, Safari ITP and iOS 14+ silently drop a large share of
 *     client-side pixel events. CAPI bypasses all of that.
 *   - Meta's ad-optimization algorithm needs every Purchase / Lead signal
 *     it can get. Sending duplicates is fine — Meta dedupes by event_id.
 *   - Sender data (email, name, IP, UA) is SHA-256 hashed per Meta's spec
 *     for "Advanced Matching", boosting match-rate against FB user profiles.
 *
 * Env requirements (Vercel):
 *   - NEXT_PUBLIC_FB_PIXEL_ID            (already set)
 *   - META_CAPI_ACCESS_TOKEN             (generate in Events Manager →
 *                                         Settings → Conversions API)
 *   - META_CAPI_TEST_EVENT_CODE          (optional, only while testing)
 *
 * If the access token is missing, every call becomes a silent no-op so the
 * site keeps working even before the env var is configured.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE || '';
const API_VERSION = 'v18.0';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export interface CapiUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  /** Full name — auto-split into first / last when firstName/lastName not given. */
  fullName?: string;
  /** External ID — your own customer ID, useful for matching. */
  externalId?: string;
  /** Customer IP (don't hash). Capture from x-forwarded-for header. */
  ip?: string;
  /** Customer User-Agent (don't hash). */
  userAgent?: string;
  /** _fbp cookie value (don't hash). Improves match rate. */
  fbp?: string;
  /** _fbc cookie value (don't hash). The fbclid from URL. */
  fbc?: string;
}

export type CapiEventName =
  | 'Purchase'
  | 'Lead'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'PageView'
  | 'AddToCart'
  | 'CompleteRegistration'
  | 'Subscribe';

export async function sendMetaEvent(args: {
  eventName: CapiEventName;
  /** Stable ID matching the client-side fbq event for deduplication. */
  eventId: string;
  userData: CapiUserData;
  customData?: Record<string, unknown>;
  /** The page URL the event happened on (for "website" action_source). */
  eventSourceUrl?: string;
  actionSource?: 'website' | 'system_generated' | 'physical_store' | 'email' | 'app';
}): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    // Silent no-op — log once per cold start so the admin notices.
    if (!warned) {
      console.warn('[meta-capi] disabled — set META_CAPI_ACCESS_TOKEN to enable');
      warned = true;
    }
    return;
  }

  const user_data: Record<string, string | string[]> = {};
  if (args.userData.email) user_data.em = sha256(args.userData.email);
  if (args.userData.phone) {
    const digits = args.userData.phone.replace(/\D/g, '');
    if (digits) user_data.ph = sha256(digits);
  }
  if (args.userData.firstName) user_data.fn = sha256(args.userData.firstName);
  if (args.userData.lastName) user_data.ln = sha256(args.userData.lastName);
  if (args.userData.fullName && !args.userData.firstName && !args.userData.lastName) {
    const parts = args.userData.fullName.trim().split(/\s+/);
    if (parts[0]) user_data.fn = sha256(parts[0]);
    if (parts.length > 1) user_data.ln = sha256(parts[parts.length - 1]);
  }
  if (args.userData.externalId) user_data.external_id = sha256(args.userData.externalId);
  if (args.userData.ip) user_data.client_ip_address = args.userData.ip;
  if (args.userData.userAgent) user_data.client_user_agent = args.userData.userAgent;
  if (args.userData.fbp) user_data.fbp = args.userData.fbp;
  if (args.userData.fbc) user_data.fbc = args.userData.fbc;

  const payload: Record<string, unknown> = {
    data: [{
      event_name: args.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: args.eventId,
      action_source: args.actionSource ?? 'website',
      ...(args.eventSourceUrl ? { event_source_url: args.eventSourceUrl } : {}),
      user_data,
      ...(args.customData ? { custom_data: args.customData } : {}),
    }],
  };
  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '<no body>');
      console.error('[meta-capi] Meta rejected event', res.status, text.slice(0, 400));
    }
  } catch (err) {
    console.error('[meta-capi] send failed:', err);
  }
}

let warned = false;

/** Extract the standard fbp / fbc cookie pair from a request's Cookie header. */
export function extractFbCookies(cookieHeader: string | null): { fbp?: string; fbc?: string } {
  if (!cookieHeader) return {};
  const out: { fbp?: string; fbc?: string } = {};
  for (const part of cookieHeader.split(/;\s*/)) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const k = part.slice(0, eq);
    const v = part.slice(eq + 1);
    if (k === '_fbp') out.fbp = v;
    else if (k === '_fbc') out.fbc = v;
  }
  return out;
}
