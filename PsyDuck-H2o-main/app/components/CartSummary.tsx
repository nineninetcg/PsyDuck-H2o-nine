import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import type {FetcherWithComponents} from 'react-router';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Separator} from './ui/separator';
import {useLocale} from '~/components/LocaleLink';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const isAside = layout === 'aside';
  
  return (
    <div 
      aria-labelledby="cart-summary" 
      className={`rounded-none p-6 ${
        isAside 
          ? 'bg-white/5 border border-black/10' 
          : 'border border-border bg-card sticky top-4'
      }`}
    >
      <h2 className={`text-xl font-bold mb-4 ${isAside ? 'text-black' : 'text-black'}`}>
        Order Summary
      </h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-base">
          <span className={isAside ? 'text-black/80' : 'text-black/70'}>Subtotal</span>
          <span className={`font-semibold ${isAside ? 'text-black [&_*]:text-black' : 'text-black'}`}>
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart?.cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </span>
        </div>
      </div>
      
      <Separator className={`my-4 ${isAside ? 'bg-white/20' : 'bg-black/20'}`} />
      
      <div className="space-y-4">
        <CartDiscounts discountCodes={cart?.discountCodes} layout={layout} />
        <CartGiftCard giftCardCodes={cart?.appliedGiftCards} layout={layout} />
      </div>
      
      <Separator className={`my-4 ${isAside ? 'bg-white/20' : 'bg-black/20'}`} />
      
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} layout={layout} />
    </div>
  );
}

function CartCheckoutActions({checkoutUrl, layout}: {checkoutUrl?: string; layout: CartLayout}) {
  if (!checkoutUrl) return null;
  const isAside = layout === 'aside';

  return (
    <Button
      asChild
      className="w-full font-black tracking-wide bg-[#9ad2e6] text-black hover:bg-black hover:text-white"
      size="lg"
    >
      <a href={checkoutUrl} target="_self">
        Continue to Checkout →
      </a>
    </Button>
  );
}

function CartDiscounts({
  discountCodes,
  layout,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  layout: CartLayout;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];
  const [showInput, setShowInput] = useState(false);
  const isAside = layout === 'aside';

  return (
    <div className="space-y-3">
      {/* Have existing discount, display it with a remove option */}
      {codes.length > 0 && (
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${isAside ? 'text-black/80' : 'text-black/70'}`}>
            Applied Discounts
          </p>
          <UpdateDiscountForm>
            <div className={`flex items-center justify-between gap-2 border rounded-none px-3 py-2 ${
              isAside 
                ? 'bg-green-500/20 border-green-400' 
                : 'bg-green-50 border-green-500'
            }`}>
              <code className={`text-sm font-mono font-semibold ${
                isAside ? 'text-green-300' : 'text-green-700'
              }`}>
                {codes?.join(', ')}
              </code>
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm" 
                className={
                  isAside
                    ? 'text-green-300 hover:text-green-200 hover:bg-green-500/30'
                    : 'text-green-700 hover:text-green-800 hover:bg-green-100'
                }
              >
                Remove
              </Button>
            </div>
          </UpdateDiscountForm>
        </div>
      )}

      {/* Toggle button to show discount input */}
      {!showInput && codes.length === 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowInput(true)}
          className={`w-full justify-start ${
            isAside 
              ? 'text-black/80 hover:text-black hover:bg-white/10' 
              : 'text-black/70 hover:text-black hover:bg-black/10'
          }`}
        >
          + Add discount code
        </Button>
      )}

      {/* Show input when toggled */}
      {showInput && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${
              isAside ? 'text-black/80' : 'text-black/70'
            }`}>
              Discount Code
            </p>
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className={`text-xs ${
                isAside 
                  ? 'text-black/70 hover:text-black' 
                  : 'text-black/60 hover:text-black'
              }`}
            >
              Cancel
            </button>
          </div>
          <UpdateDiscountForm discountCodes={codes}>
            <div className="flex gap-2">
              <Input 
                type="text" 
                name="discountCode" 
                placeholder="Enter code" 
                className={`flex-1 ${
                  isAside 
                    ? 'bg-white/10 border-black/10 text-black placeholder:text-black/50 focus:border-black/10' 
                    : ''
                }`}
              />
              <Button 
                type="submit" 
                variant="default"
              >
                Apply
              </Button>
            </div>
          </UpdateDiscountForm>
        </div>
      )}
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const cartRoute = locale?.pathPrefix ? `${locale.pathPrefix}/cart` : '/cart';
  
  return (
    <CartForm
      route={cartRoute}
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  layout,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  layout: CartLayout;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const isAside = layout === 'aside';
  const [showInput, setShowInput] = useState(false);
  const hasGiftCards = giftCardCodes && giftCardCodes.length > 0;

  // Clear the gift card code input after the gift card is added
  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current!.value = '';
    }
  }, [giftCardAddFetcher.data]);

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
  }

  return (
    <div className="space-y-3">
      {/* Display applied gift cards with individual remove buttons */}
      {hasGiftCards && (
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${isAside ? 'text-black/80' : 'text-black/70'}`}>
            Applied Gift Cards
          </p>
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className={`flex items-center justify-between gap-2 border rounded-none px-3 py-2 ${
                isAside 
                  ? 'bg-blue-500/20 border-blue-400' 
                  : 'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-center gap-2">
                  <code className={`text-sm font-mono font-semibold ${
                    isAside ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    ···{giftCard.lastCharacters}
                  </code>
                  <span className={`text-sm ${
                    isAside ? 'text-blue-300 [&_*]:text-blue-300' : 'text-blue-700'
                  }`}>
                    <Money data={giftCard.amountUsed} />
                  </span>
                </div>
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="sm" 
                  className={
                    isAside
                      ? 'text-blue-300 hover:text-blue-200 hover:bg-blue-500/30'
                      : 'text-blue-700 hover:text-blue-800 hover:bg-blue-100'
                  }
                >
                  Remove
                </Button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </div>
      )}

      {/* Toggle button to show gift card input */}
      {!showInput && !hasGiftCards && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowInput(true)}
          className={`w-full justify-start ${
            isAside 
              ? 'text-black/80 hover:text-black hover:bg-white/10' 
              : 'text-black/70 hover:text-black hover:bg-black/10'
          }`}
        >
          + Add gift card
        </Button>
      )}

      {/* Show input when toggled */}
      {showInput && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${
              isAside ? 'text-black/80' : 'text-black/70'
            }`}>
              Gift Card
            </p>
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className={`text-xs ${
                isAside 
                  ? 'text-black/70 hover:text-black' 
                  : 'text-black/60 hover:text-black'
              }`}
            >
              Cancel
            </button>
          </div>
          <UpdateGiftCardForm
            giftCardCodes={appliedGiftCardCodes.current}
            saveAppliedCode={saveAppliedCode}
            fetcherKey="gift-card-add"
          >
            <div className="flex gap-2">
              <Input
                type="text"
                name="giftCardCode"
                placeholder="Enter gift card code"
                ref={giftCardCodeInput}
                className={`flex-1 ${
                  isAside 
                    ? 'bg-white/10 border-black/10 text-black placeholder:text-black/50 focus:border-black/10' 
                    : ''
                }`}
              />
              <Button 
                type="submit" 
                variant="default"
                disabled={giftCardAddFetcher.state !== 'idle'}
              >
                {giftCardAddFetcher.state !== 'idle' ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </UpdateGiftCardForm>
        </div>
      )}
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  fetcherKey,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const cartRoute = locale?.pathPrefix ? `${locale.pathPrefix}/cart` : '/cart';

  return (
    <CartForm
      fetcherKey={fetcherKey}
      route={cartRoute}
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const cartRoute = locale?.pathPrefix ? `${locale.pathPrefix}/cart` : '/cart';

  return (
    <CartForm
      route={cartRoute}
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
    </CartForm>
  );
}
