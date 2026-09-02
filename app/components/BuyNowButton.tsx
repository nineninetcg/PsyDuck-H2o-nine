import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {Button} from './ui/button';
import {useLocale} from '~/components/LocaleLink';
import {useEffect, useRef} from 'react';
import {trackEvent} from '~/lib/tracking';

export function BuyNowButton({
  analytics,
  children,
  disabled,
  lines,
  className,
  currency,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  className?: string;
  currency?: string;
}) {
  const locale = useLocale();
  const cartRoute = locale?.pathPrefix ? `${locale.pathPrefix}/cart` : '/cart';

  return (
    <CartForm route={cartRoute} inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <BuyNowInner
          fetcher={fetcher}
          analytics={analytics}
          disabled={disabled}
          className={className}
          cartRoute={cartRoute}
          currency={currency}
        >
          {children}
        </BuyNowInner>
      )}
    </CartForm>
  );
}

function BuyNowInner({
  fetcher,
  analytics,
  disabled,
  children,
  className,
  cartRoute,
  currency,
}: {
  fetcher: FetcherWithComponents<any>;
  analytics?: unknown;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  cartRoute: string;
  currency?: string;
}) {
  const isAdding = fetcher.state !== 'idle';
  const isDisabled = disabled ?? isAdding;
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;

    // Direct checkout URL in cart response
    const checkoutUrl = fetcher.data?.cart?.checkoutUrl;
    if (checkoutUrl && fetcher.state === 'idle') {
      redirectedRef.current = true;

      // Buy Now redirects straight to Shopify checkout, skipping the /cart
      // page that normally fires InitiateCheckout , fire it here instead.
      try {
        const products = (analytics as {products?: Array<Record<string, unknown>>})
          ?.products;
        const first = products?.[0];
        if (first) {
          const price = Number(first.price);
          const quantity = Number(first.quantity) || 1;
          trackEvent('InitiateCheckout', {
            value: Number.isFinite(price) ? price * quantity : undefined,
            currency,
            contents: [
              {
                id: String(first.variantId ?? first.id ?? ''),
                name: String(first.title ?? ''),
                quantity,
                price: Number.isFinite(price) ? price : undefined,
              },
            ],
          });
        }
      } catch {
        /* tracking must never block checkout */
      }

      window.location.href = checkoutUrl;
    }
  }, [fetcher.state, fetcher.data, analytics, currency]);

  // Reset redirect guard when lines change (new add-to-cart)
  const prevDataRef = useRef(fetcher.data);
  if (fetcher.data !== prevDataRef.current) {
    prevDataRef.current = fetcher.data;
    redirectedRef.current = false;
  }

  return (
    <>
      <input
        name="analytics"
        type="hidden"
        value={JSON.stringify(analytics)}
      />
      <Button
        type="submit"
        disabled={isDisabled}
        variant="default"
        size="default"
        className={className ? `w-full font-semibold ${className}` : 'w-full font-semibold'}
      >
        {isAdding ? (
          <span className="flex items-center gap-2">
            <span className="inline-block animate-spin rounded-none h-4 w-4 border-b-2 border-black/10"></span>
            Processing...
          </span>
        ) : (
          children
        )}
      </Button>
    </>
  );
}
