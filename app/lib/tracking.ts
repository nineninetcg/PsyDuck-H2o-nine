/**
 * Unified client-side tracking.
 *
 * Every event fires three ways with the SAME eventId:
 *   1. Meta Pixel   (browser)
 *   2. TikTok Pixel (browser)
 *   3. POST /api/track -> Meta CAPI + TikTok Events API (server)
 *
 * The shared eventId is what lets Meta and TikTok deduplicate, so one real
 * action is never counted twice even though it's sent twice.
 */

export const META_PIXEL_ID = '997722999960196';
export const TIKTOK_PIXEL_ID = 'D9O7RDJC77U1C011P3PG';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: {
      load?: (id: string) => void;
      page?: () => void;
      track?: (event: string, params?: Record<string, unknown>, opts?: Record<string, unknown>) => void;
      identify?: (params: Record<string, unknown>) => void;
      instance?: (id: string) => unknown;
    };
  }
}

export type TrackContent = {
  id?: string;
  name?: string;
  quantity?: number;
  price?: number;
};

export type TrackPayload = {
  value?: number;
  currency?: string;
  contents?: TrackContent[];
};

/** Canonical event names used across the app. Mapped per-platform server-side. */
export type TrackEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

/** TikTok's browser vocabulary differs from Meta's. */
const TIKTOK_BROWSER_EVENT: Record<TrackEventName, string> = {
  PageView: 'Pageview',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'CompletePayment',
};

function newEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Fire an event across all destinations.
 * Safe to call before the pixel scripts have finished loading , both fbq and
 * ttq queue calls internally, and the server relay is independent of them.
 */
export function trackEvent(name: TrackEventName, payload: TrackPayload = {}) {
  if (typeof window === 'undefined') return;

  const eventId = newEventId();
  const {value, currency, contents} = payload;

  // --- Meta Pixel (browser) ---
  try {
    if (typeof window.fbq === 'function') {
      const metaParams: Record<string, unknown> = {};
      if (typeof value === 'number') metaParams.value = value;
      if (currency) metaParams.currency = currency;
      if (contents?.length) {
        metaParams.content_type = 'product';
        metaParams.content_ids = contents.map((c) => c.id).filter(Boolean);
        metaParams.contents = contents.map((c) => ({
          id: c.id,
          quantity: c.quantity ?? 1,
          item_price: c.price,
        }));
        metaParams.num_items = contents.reduce(
          (sum, c) => sum + (c.quantity ?? 1),
          0,
        );
      }
      window.fbq('track', name, metaParams, {eventID: eventId});
    }
  } catch {
    /* tracking must never break the page */
  }

  // --- TikTok Pixel (browser) ---
  try {
    if (window.ttq?.track) {
      const ttParams: Record<string, unknown> = {};
      if (typeof value === 'number') ttParams.value = value;
      if (currency) ttParams.currency = currency;
      if (contents?.length) {
        ttParams.contents = contents.map((c) => ({
          content_id: c.id,
          content_name: c.name,
          content_type: 'product',
          quantity: c.quantity ?? 1,
          price: c.price,
        }));
      }
      window.ttq.track(TIKTOK_BROWSER_EVENT[name], ttParams, {
        event_id: eventId,
      });
    }
  } catch {
    /* noop */
  }

  // --- Server relay (Meta CAPI + TikTok Events API) ---
  try {
    const body = JSON.stringify({
      eventName: name,
      eventId,
      eventTime: Math.floor(Date.now() / 1000),
      url: window.location.href,
      value,
      currency,
      contents,
      fbp: readCookie('_fbp'),
      fbc: readCookie('_fbc'),
      ttp: readCookie('_ttp'),
      ttclid: new URLSearchParams(window.location.search).get('ttclid') || undefined,
    });

    // keepalive so the request survives navigation (important for AddToCart)
    void fetch('/api/track', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
}
