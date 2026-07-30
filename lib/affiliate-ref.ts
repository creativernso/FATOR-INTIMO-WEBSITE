const STORAGE_KEY = 'fi_affiliate_ref';
const URL_PARAM = 'ref';
const TTL_DAYS = 30;

interface StoredAffiliateRef {
  code: string;
  capturedAt: string;
}

/** Reads ?ref= from the current URL and, if present, overwrites the stored attribution (last-touch). */
export function captureAffiliateRefFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const code = params.get(URL_PARAM);
  if (code && code.trim()) {
    const stored: StoredAffiliateRef = { code: code.trim(), capturedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }
}

export function getStoredAffiliateCode(): string | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredAffiliateRef;
    const ageMs = Date.now() - new Date(parsed.capturedAt).getTime();
    if (ageMs > TTL_DAYS * 86400000) return undefined;
    return parsed.code || undefined;
  } catch {
    return undefined;
  }
}
