export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

const STORAGE_KEY = 'fi_utm';
const URL_PARAM_MAP: Record<keyof UtmParams, string> = {
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmContent: 'utm_content',
};

/** Reads utm_* params from the current URL and, if present, overwrites the stored attribution (last-touch). */
export function captureUtmFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const found: UtmParams = {};
  let any = false;
  for (const [field, param] of Object.entries(URL_PARAM_MAP) as [keyof UtmParams, string][]) {
    const value = params.get(param);
    if (value) {
      found[field] = value;
      any = true;
    }
  }
  if (any) localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
}

export function getStoredUtm(): UtmParams {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
