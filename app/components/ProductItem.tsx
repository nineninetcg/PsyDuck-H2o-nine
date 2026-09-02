import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {LocaleLink} from '~/components/LocaleLink';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useNavigate} from 'react-router';
import {trackEvent} from '~/lib/tracking';


export function ProductItem({
  product,
  loading,
  compact,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
  compact?: boolean;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const {open} = useAside();
  const navigate = useNavigate();

  const firstVariant =
    'selectedOrFirstAvailableVariant' in product
      ? product.selectedOrFirstAvailableVariant
      : null;

  const compareAtPrice = (firstVariant as any)?.compareAtPrice as
    | {amount: string; currencyCode: string}
    | null
    | undefined;

  const currentPrice = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAmount = compareAtPrice?.amount
    ? parseFloat(compareAtPrice.amount)
    : null;
  const savePercent =
    compareAmount && compareAmount > currentPrice
      ? Math.round((1 - currentPrice / compareAmount) * 100)
      : null;

  const handleBuyNow = () => {
    if (!firstVariant?.id) return;
    const variantId = firstVariant.id.split('/').pop();
    if (!variantId) return;

    // "Buy Now" jumps straight to the cart permalink, skipping the normal
    // Add to Cart action and the /cart page , which is where AddToCart and
    // InitiateCheckout normally fire. Fire them here instead so this path
    // is tracked too.
    const content = {
      id: String(firstVariant.id),
      name: product.title,
      quantity: 1,
      price: currentPrice,
    };
    const currency = product.priceRange.minVariantPrice.currencyCode;
    trackEvent('AddToCart', {value: currentPrice, currency, contents: [content]});
    trackEvent('InitiateCheckout', {value: currentPrice, currency, contents: [content]});

    void navigate(`/cart/${variantId}:1`);
  };

  return (
    <div className="group flex flex-col bg-white border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      <LocaleLink prefetch="intent" to={variantUrl} className="block overflow-hidden bg-white">
        <div className="aspect-square relative">
          {image ? (
            <Image
              alt={image.altText || product.title}
              data={image}
              loading={loading}
              sizes="(min-width: 1280px) 320px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center">
              <span className="text-gray-200 text-4xl font-bold">V</span>
            </div>
          )}
          <div className="absolute top-0 left-0 w-1 h-12 bg-[#9ad2e6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {savePercent !== null && (
            <div className="absolute top-2 right-2 bg-[#9ad2e6] text-black text-xs font-black px-2 py-1 leading-none">
              SAVE {savePercent}%
            </div>
          )}
        </div>
      </LocaleLink>

      <div className="flex flex-col flex-1 p-4 border-b-2 border-transparent group-hover:border-[#9ad2e6] transition-colors duration-300">
        <LocaleLink prefetch="intent" to={variantUrl}>
          <h4 className="font-semibold text-sm text-black leading-snug mb-1 line-clamp-2 group-hover:text-[#9ad2e6] transition-colors">
            {product.title}
          </h4>
        </LocaleLink>
        <div className="flex items-baseline gap-2 mt-auto">
          <p className="text-base font-black text-black">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
          {compareAtPrice && compareAmount && compareAmount > currentPrice && (
            <p className="text-sm text-gray-600 line-through">
              <Money data={compareAtPrice as any} />
            </p>
          )}
        </div>
      </div>

      <div className="p-4 pt-3">
        {firstVariant?.availableForSale ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                void handleBuyNow();
              }}
              className="w-full py-2.5 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-[#9ad2e6] hover:text-black transition-colors"
            >
              Buy Now
            </button>
            <AddToCartButton
              disabled={!firstVariant || !firstVariant.availableForSale}
              onClick={() => open('cart')}
              lines={firstVariant ? [{merchandiseId: firstVariant.id, quantity: 1}] : []}
              className="w-full py-2.5 border border-black text-black text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors bg-transparent"
            >
              Add to Cart
            </AddToCartButton>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <button
              disabled
              className="w-full py-2.5 border border-gray-200 text-gray-600 text-xs font-bold tracking-widest uppercase cursor-not-allowed"
            >
              Sold Out
            </button>
            <a
              href={`mailto:hello@sassypsyduck.com?subject=${encodeURIComponent(`Restock request: ${product.title}`)}&body=${encodeURIComponent(`Hi Sassypsyduck, please notify me when this is back in stock:\n\n${product.title}`)}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-center py-2 text-[11px] font-semibold text-gray-500 hover:text-[#9ad2e6] transition-colors underline underline-offset-2"
            >
              Request via email
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
