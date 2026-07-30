/**
 * Read-only Meta Graph API calls used to surface real Pixel numbers directly
 * in the admin dashboard, instead of only linking out to Events Manager.
 *
 * Both calls are best-effort: Meta's Dataset Quality API (Event Match
 * Quality) requires an elevated permission tier ("Advanced" ads_management +
 * Marketing API Access Tier, which needs app review) that a token generated
 * via the basic Events Manager -> Conversions API flow may not have. If
 * either call fails (missing permission, expired token, etc.) we return a
 * clear error string instead of throwing, so the dashboard can degrade to a
 * "unavailable" message rather than crash or show fake data.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';
const API_VERSION = 'v21.0';

export interface PixelEventCount {
  event: string;
  count: number;
}

export interface PixelEventStats {
  events: PixelEventCount[];
  days: number;
  error?: string;
}

// Meta caps this endpoint's lookback at 7 days from the request time.
export async function getPixelEventCounts(): Promise<PixelEventStats> {
  const days = 7;
  if (!PIXEL_ID || !ACCESS_TOKEN) return { events: [], days, error: 'not_configured' };

  try {
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - days * 86400;
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/stats?aggregation=event&start_time=${startTime}&end_time=${endTime}&access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const json = await res.json();
    if (!res.ok || json.error) {
      return { events: [], days, error: json.error?.message || `HTTP ${res.status}` };
    }
    const raw: unknown[] = Array.isArray(json.data) ? json.data : [];
    const events: PixelEventCount[] = raw
      .map((entry) => {
        const e = entry as Record<string, unknown>;
        const event = (e.value ?? e.event ?? e.label) as string | undefined;
        const count = (e.count ?? e.total ?? 0) as number;
        return event ? { event, count } : null;
      })
      .filter((e): e is PixelEventCount => e !== null)
      .sort((a, b) => b.count - a.count);
    return { events, days };
  } catch (err) {
    return { events: [], days, error: err instanceof Error ? err.message : 'unknown_error' };
  }
}

export interface EventMatchQuality {
  score: number | null;
  error?: string;
}

export async function getPurchaseMatchQuality(): Promise<EventMatchQuality> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return { score: null, error: 'not_configured' };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/dataset_quality?dataset_id=${PIXEL_ID}&access_token=${ACCESS_TOKEN}&fields=${encodeURIComponent('web{event_match_quality,event_name}')}`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    const json = await res.json();
    if (!res.ok || json.error) {
      return { score: null, error: json.error?.message || `HTTP ${res.status}` };
    }
    const web: unknown[] = Array.isArray(json.web) ? json.web : [];
    const purchaseEntry = web.find((entry) => (entry as Record<string, unknown>).event_name === 'Purchase') as
      | Record<string, unknown>
      | undefined;
    const quality = purchaseEntry?.event_match_quality as Record<string, unknown> | undefined;
    const score = typeof quality?.composite_score === 'number' ? quality.composite_score : null;
    return { score };
  } catch (err) {
    return { score: null, error: err instanceof Error ? err.message : 'unknown_error' };
  }
}
