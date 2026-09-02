import {useEffect, useRef} from 'react';
import {useLocation} from 'react-router';
import {useAnalytics} from '@shopify/hydrogen';
import {
  META_PIXEL_ID,
  TIKTOK_PIXEL_ID,
  trackEvent,
  type TrackContent,
} from '~/lib/tracking';

/**
 * Base pixel loaders. Rendered in <head> so they initialise as early as
 * possible. Neither fires an automatic PageView , <PixelEvents /> owns all
 * event firing so that every event carries a shared eventId for deduplication.
 */
export function PixelScripts({nonce}: {nonce?: string}) {
  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');`,
        }}
      />
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.load('${TIKTOK_PIXEL_ID}');
}(window, document, 'ttq');`,
        }}
      />
    </>
  );
}

function toNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Fires all storefront events off Hydrogen's analytics bus.
 * Must be rendered INSIDE <Analytics.Provider>.
 *
 * Purchase is deliberately absent , checkout happens on Shopify's domain, so
 * it's tracked by the Shopify custom pixels instead.
 */
export function PixelEvents() {
  const {subscribe} = useAnalytics();
  const location = useLocation();
  const firstRender = useRef(true);

  // Initial load + every SPA route change.
  useEffect(() => {
    trackEvent('PageView');
    firstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    const viewed = subscribe('product_viewed', (data: any) => {
      const product = data?.products?.[0];
      if (!product) return;
      const contents: TrackContent[] = [
        {
          id: String(product.variantId ?? product.id ?? ''),
          name: product.title,
          quantity: 1,
          price: toNumber(product.price),
        },
      ];
      trackEvent('ViewContent', {
        value: toNumber(product.price),
        currency: data?.shop?.currency || 'USD',
        contents,
      });
    });
    if (typeof viewed === 'function') unsubscribers.push(viewed);

    const added = subscribe('product_added_to_cart', (data: any) => {
      const line = data?.currentLine;
      const merchandise = line?.merchandise;
      if (!merchandise) return;
      const quantity = toNumber(line?.quantity) ?? 1;
      const total = toNumber(line?.cost?.totalAmount?.amount);
      trackEvent('AddToCart', {
        value: total,
        currency: line?.cost?.totalAmount?.currencyCode || 'USD',
        contents: [
          {
            id: String(merchandise.id ?? ''),
            name: merchandise.product?.title,
            quantity,
            price: toNumber(merchandise.price?.amount),
          },
        ],
      });
    });
    if (typeof added === 'function') unsubscribers.push(added);

    const cartViewed = subscribe('cart_viewed', (data: any) => {
      const cart = data?.cart;
      if (!cart) return;
      const lines = cart?.lines?.nodes ?? cart?.lines?.edges?.map((e: any) => e.node) ?? [];
      trackEvent('InitiateCheckout', {
        value: toNumber(cart?.cost?.totalAmount?.amount),
        currency: cart?.cost?.totalAmount?.currencyCode || 'USD',
        contents: lines.map((line: any) => ({
          id: String(line?.merchandise?.id ?? ''),
          name: line?.merchandise?.product?.title,
          quantity: toNumber(line?.quantity) ?? 1,
          price: toNumber(line?.cost?.totalAmount?.amount),
        })),
      });
    });
    if (typeof cartViewed === 'function') unsubscribers.push(cartViewed);

    return () => {
      unsubscribers.forEach((fn) => {
        try {
          fn();
        } catch {
          /* noop */
        }
      });
    };
  }, [subscribe]);

  return null;
}
