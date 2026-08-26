import type {ActionFunctionArgs} from 'react-router';

/**
 * Server-side conversion tracking relay.
 *
 * The browser fires the Meta Pixel / TikTok Pixel as normal, AND posts the same
 * event here with a shared `eventId`. This route forwards it to Meta's
 * Conversions API and TikTok's Events API from the server.
 *
 * Why: 10-30% of browser events never arrive (ad blockers, Safari ITP, iOS
 * privacy). Server-side recovers those. The shared eventId lets Meta and TikTok
 * deduplicate so a single action is never counted twice.
 *
 * Required environment variables (set in Oxygen, not in code):
 *   META_CAPI_ACCESS_TOKEN
 *   TIKTOK_EVENTS_ACCESS_TOKEN
 *
 * If a token is missing, that platform is skipped silently. The route never
 * throws , tracking must never break the storefront.
 */

const META_PIXEL_ID = '997722999960196';
const TIKTOK_PIXEL_ID = 'D9O7RDJC77U1C011P3PG';

const META_ENDPOINT = `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events`;
const TIKTOK_ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

type IncomingEvent = {
  eventName: string;
  eventId: string;
  eventTime?: number;
  url?: string;
  value?: number;
  currency?: string;
  contents?: Array<{
    id?: string;
    name?: string;
    quantity?: number;
    price?: number;
  }>;
  email?: string;
  phone?: string;
  externalId?: string;
  fbp?: string;
  fbc?: string;
  ttp?: string;
  ttclid?: string;
};

/** SHA-256 hex, required by both platforms for PII. */
async function sha256(input?: string): Promise<string | undefined> {
  if (!input) return undefined;
  const normalized = input.trim().toLowerCase();
  if (!normalized) return undefined;
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Meta event names differ slightly from ours in a couple of places. */
const META_EVENT_MAP: Record<string, string> = {
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'Purchase',
};

/** TikTok uses its own event vocabulary. */
const TIKTOK_EVENT_MAP: Record<string, string> = {
  PageView: 'Pageview',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'CompletePayment',
};

async function sendToMeta(
  event: IncomingEvent,
  token: string,
  clientIp: string,
  userAgent: string,
) {
  const metaEventName = META_EVENT_MAP[event.eventName];
  if (!metaEventName) return;

  const userData: Record<string, unknown> = {
    client_ip_address: clientIp,
    client_user_agent: userAgent,
  };

  const [em, ph, extId] = await Promise.all([
    sha256(event.email),
    sha256(event.phone),
    sha256(event.externalId),
  ]);
  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];
  if (extId) userData.external_id = [extId];
  if (event.fbp) userData.fbp = event.fbp;
  if (event.fbc) userData.fbc = event.fbc;

  const customData: Record<string, unknown> = {};
  if (typeof event.value === 'number') customData.value = event.value;
  if (event.currency) customData.currency = event.currency;
  if (event.contents?.length) {
    customData.content_type = 'product';
    customData.content_ids = event.contents.map((c) => c.id).filter(Boolean);
    customData.contents = event.contents.map((c) => ({
      id: c.id,
      quantity: c.quantity ?? 1,
      item_price: c.price,
    }));
    customData.num_items = event.contents.reduce(
      (sum, c) => sum + (c.quantity ?? 1),
      0,
    );
  }

  const body = {
    data: [
      {
        event_name: metaEventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.url,
        action_source: 'website',
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  const res = await fetch(`${META_ENDPOINT}?access_token=${token}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error('Meta CAPI error', res.status, await res.text());
  }
}

async function sendToTikTok(
  event: IncomingEvent,
  token: string,
  clientIp: string,
  userAgent: string,
) {
  const ttEventName = TIKTOK_EVENT_MAP[event.eventName];
  if (!ttEventName) return;

  const user: Record<string, unknown> = {
    ip: clientIp,
    user_agent: userAgent,
  };

  const [em, ph, extId] = await Promise.all([
    sha256(event.email),
    sha256(event.phone),
    sha256(event.externalId),
  ]);
  if (em) user.email = em;
  if (ph) user.phone = ph;
  if (extId) user.external_id = extId;
  if (event.ttp) user.ttp = event.ttp;
  if (event.ttclid) user.ttclid = event.ttclid;

  const properties: Record<string, unknown> = {};
  if (typeof event.value === 'number') properties.value = event.value;
  if (event.currency) properties.currency = event.currency;
  if (event.contents?.length) {
    properties.contents = event.contents.map((c) => ({
      content_id: c.id,
      content_name: c.name,
      content_type: 'product',
      quantity: c.quantity ?? 1,
      price: c.price,
    }));
  }

  const body = {
    event_source: 'web',
    event_source_id: TIKTOK_PIXEL_ID,
    data: [
      {
        event: ttEventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        user,
        properties,
        page: {url: event.url},
      },
    ],
  };

  const res = await fetch(TIKTOK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': token,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error('TikTok Events API error', res.status, await res.text());
  }
}

export async function action({request, context}: ActionFunctionArgs) {
  // Tracking must never break the storefront, so everything below is guarded.
  try {
    if (request.method !== 'POST') {
      return new Response(null, {status: 405});
    }

    const event = (await request.json()) as IncomingEvent;
    if (!event?.eventName || !event?.eventId) {
      return new Response(null, {status: 204});
    }

    const env = context.env as unknown as Record<string, string | undefined>;
    const metaToken = env.META_CAPI_ACCESS_TOKEN;
    const tiktokToken = env.TIKTOK_EVENTS_ACCESS_TOKEN;

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('cf-connecting-ip') ||
      '';
    const userAgent = request.headers.get('user-agent') || '';

    const jobs: Array<Promise<void>> = [];
    if (metaToken) jobs.push(sendToMeta(event, metaToken, clientIp, userAgent));
    if (tiktokToken)
      jobs.push(sendToTikTok(event, tiktokToken, clientIp, userAgent));

    // Don't block the response on upstream latency.
    if (jobs.length) {
      await Promise.allSettled(jobs);
    }

    return new Response(null, {status: 204});
  } catch (error) {
    console.error('api.track failed', error);
    return new Response(null, {status: 204});
  }
}
