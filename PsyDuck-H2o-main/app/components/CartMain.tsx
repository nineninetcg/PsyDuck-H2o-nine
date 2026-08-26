import {useOptimisticCart} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {LocaleLink} from '~/components/LocaleLink';
import {Button} from './ui/button';
import {ShoppingBag} from 'lucide-react';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

// Freebie variant IDs — used to badge them in cart
const FREEBIE_VARIANT_IDS = new Set([
  'gid://shopify/ProductVariant/43257873268841', // Claude Prompt Pack
  'gid://shopify/ProductVariant/43257873301609', // ChatGPT Prompt Pack
  'gid://shopify/ProductVariant/43257873334377', // AI Cheat Sheet
]);

const FREEBIE_LABELS: Record<string, string> = {
  'gid://shopify/ProductVariant/43257873268841': '🎁 Claude Pro Prompt Pack — delivered to your email after checkout',
  'gid://shopify/ProductVariant/43257873301609': '🎁 ChatGPT Power Prompt Pack — delivered to your email after checkout',
  'gid://shopify/ProductVariant/43257873334377': '🎁 The AI Cheat Sheet 2026 — delivered to your email after checkout',
};

const CART_RESERVATION_KEY = 'sp_cart_reserved_until';
const CART_RESERVATION_MINUTES = 10;

function CartReservationTimer({layout}: {layout: CartLayout}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let deadline = Number(sessionStorage.getItem(CART_RESERVATION_KEY) || 0);
    const now = Date.now();
    if (!deadline || deadline <= now) {
      deadline = now + CART_RESERVATION_MINUTES * 60 * 1000;
      sessionStorage.setItem(CART_RESERVATION_KEY, String(deadline));
    }

    const tick = () => {
      const secondsLeft = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(secondsLeft);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (remaining === null || remaining <= 0) return null;

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const isUrgent = remaining <= 120;

  return (
    <div
      className={`flex items-center justify-center gap-2 mb-3 px-4 py-2.5 rounded-full text-center ${
        isUrgent ? 'bg-red-600' : 'bg-black'
      } ${layout === 'aside' ? 'mx-4 mt-4' : ''}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ad2e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
      <p className="text-[11px] font-bold uppercase tracking-widest text-white">
        Your cart is held for{' '}
        <span className={isUrgent ? 'text-white' : 'text-[#9ad2e6]'}>
          {mm}:{ss}
        </span>
      </p>
    </div>
  );
}

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  const cartVariantIds = new Set(
    (cart?.lines?.nodes ?? []).map((l: any) => l.merchandise?.id ?? ''),
  );
  const activeGiftLabels = Object.entries(FREEBIE_LABELS)
    .filter(([id]) => cartVariantIds.has(id))
    .map(([, label]) => label);

  useEffect(() => {
    if (!cartHasItems) {
      sessionStorage.removeItem(CART_RESERVATION_KEY);
    }
  }, [cartHasItems]);

  return (
    <div className={layout === 'aside' ? 'flex flex-col h-full' : 'space-y-6'}>
      <CartEmpty hidden={linesCount} layout={layout} />
      {cartHasItems && (
        <>
          <CartReservationTimer layout={layout} />
          <div className={layout === 'aside' ? 'flex-1 overflow-y-auto px-4' : ''}>

            {/* Gift banner */}
            {activeGiftLabels.length > 0 && (
              <div className="mb-3 rounded-none bg-[#9ad2e6]/10 border border-[#9ad2e6]/40 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9ad2e6] mb-1">
                  ✦ Free Gifts Included
                </p>
                {activeGiftLabels.map((label) => (
                  <p key={label} className="text-xs text-black/80 leading-relaxed">
                    {label}
                  </p>
                ))}
              </div>
            )}

            <ul className={layout === 'aside' ? 'divide-y divide-white/20' : 'divide-y divide-black/20'}>
              {(cart?.lines?.nodes ?? []).map((line: any) => {
                const isFreebie = FREEBIE_VARIANT_IDS.has(line.merchandise?.id ?? '');
                return (
                  <div key={line.id} className="relative">
                    {isFreebie && (
                      <span className="absolute top-3 right-0 text-[10px] font-bold bg-[#9ad2e6] text-black px-2 py-0.5 rounded-none z-10">
                        FREE GIFT
                      </span>
                    )}
                    <CartLineItem line={line} layout={layout} />
                  </div>
                );
              })}
            </ul>
          </div>

          <div className={layout === 'aside' ? 'border-t border-black/10' : 'border-t border-black/20'}>
            <CartSummary cart={cart} layout={layout} />
          </div>
        </>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  const isAside = layout === 'aside';

  return (
    <div
      hidden={hidden}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className={`rounded-none p-6 mb-4 ${isAside ? 'bg-white/10' : 'bg-black/10'}`}>
        <ShoppingBag className={`h-12 w-12 ${isAside ? 'text-black/60' : 'text-black/60'}`} />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${isAside ? 'text-black' : 'text-black'}`}>
        Your cart is empty
      </h3>
      <p className={`mb-6 max-w-sm ${isAside ? 'text-black/80' : 'text-black/70'}`}>
        Looks like you haven&rsquo;t added anything yet. Let&rsquo;s get you started!
      </p>
      <LocaleLink to="/collections" onClick={close} prefetch="viewport">
        <Button variant="default" size="lg">
          Continue shopping
        </Button>
      </LocaleLink>
    </div>
  );
}
