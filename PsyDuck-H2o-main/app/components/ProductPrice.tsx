import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
  variant = 'default',
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  variant?: 'default' | 'compact';
}) {
  const hasDiscount = compareAtPrice && compareAtPrice.amount !== price?.amount;
  
  // Calculate savings percentage if there's a discount
  const savingsPercentage = hasDiscount && price
    ? Math.round(((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) / parseFloat(compareAtPrice.amount)) * 100)
    : 0;

  // Compact variant for cart items (inherits text color from parent)
  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-1 [&_*]:text-inherit">
        {hasDiscount ? (
          <>
            <div className="flex items-baseline gap-2">
              <s className="text-sm opacity-60">
                <Money data={compareAtPrice} />
              </s>
              <span className="font-bold">
                {price ? <Money data={price} /> : null}
              </span>
            </div>
          </>
        ) : price ? (
          <span className="font-bold">
            <Money data={price} />
          </span>
        ) : (
          <span className="opacity-60">Price unavailable</span>
        )}
      </div>
    );
  }

  // Default variant for product pages
  return (
    <div className="flex flex-col gap-2">
      {hasDiscount ? (
        <div className="flex items-baseline gap-3">
          <s className="text-xl text-gray-600 font-medium">
            <Money data={compareAtPrice} />
          </s>
          <span className="text-3xl font-bold text-black">
            {price ? <Money data={price} /> : null}
          </span>
        </div>
      ) : price ? (
        <span className="text-3xl font-bold text-black">
          <Money data={price} />
        </span>
      ) : (
        <span className="text-3xl font-bold text-gray-600">Price unavailable</span>
      )}
    </div>
  );
}
