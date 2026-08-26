import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {BuyNowButton} from './BuyNowButton';
import {useAside} from './Aside';
import {Label} from './ui/label';
import {Button} from './ui/button';
import {Plus, Minus} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useState, useEffect} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';

type SellingPlan = {
  id: string;
  name: string;
  options: {name: string; value: string}[];
  priceAdjustments: {
    adjustmentValue:
      | {adjustmentPercentage: number}
      | {adjustmentAmount: {amount: string; currencyCode: string}}
      | null;
  }[];
};

type SellingPlanGroup = {
  name: string;
  sellingPlans: {
    nodes: SellingPlan[];
  };
};

export function ProductForm({
  productOptions,
  selectedVariant,
  sellingPlanGroups = [],
  product,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  sellingPlanGroups?: SellingPlanGroup[];
  product?: {id: string; title: string; vendor: string};
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);

  // Flatten all selling plans across all groups
  const allPlans = sellingPlanGroups.flatMap((g) => g.sellingPlans.nodes);

  const hasSubscription = allPlans.length > 0;

  // "one-time" | "subscribe"
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscribe'>(
    'one-time',
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    allPlans[0]?.id ?? '',
  );

  // Reset selected plan when variant changes
  useEffect(() => {
    if (allPlans.length > 0) {
      setSelectedPlanId(allPlans[0].id);
    }
  }, [selectedVariant?.id]);

  const activePlanId =
    purchaseType === 'subscribe' ? selectedPlanId : undefined;

  const cartLines = selectedVariant
    ? [
        {
          merchandiseId: selectedVariant.id,
          quantity,
          selectedVariant,
          ...(activePlanId ? {sellingPlanId: activePlanId} : {}),
        },
      ]
    : [];

  // Get discount label for a plan
  function getDiscount(plan: SellingPlan): string | null {
    const adj = plan.priceAdjustments?.[0]?.adjustmentValue;
    if (!adj) return null;
    if ('adjustmentPercentage' in adj && adj.adjustmentPercentage) {
      return `Save ${adj.adjustmentPercentage}%`;
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Variant options (e.g. Duration) */}
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name} className="flex flex-col gap-3">
            <Label className="text-sm font-semibold uppercase tracking-wide text-black/70">
              {option.name}
            </Label>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const buttonClasses = cn(
                  'flex items-center justify-center min-w-[3rem] px-4 py-2 rounded-none border-2 transition-all text-sm font-medium',
                  selected
                    ? 'border-[#9ad2e6] bg-[#9ad2e6] text-black'
                    : 'border-black bg-white text-black hover:border-[#9ad2e6]',
                  !available && 'opacity-40 cursor-not-allowed',
                  !exists && 'opacity-30 cursor-not-allowed',
                );

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={buttonClasses}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      className={buttonClasses}
                      key={option.name + name}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      {/* Subscription selector */}
      {hasSubscription && (
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold uppercase tracking-wide text-black/70">
            Purchase Type
          </Label>

          {/* Toggle row */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPurchaseType('one-time')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-none border-2 text-sm font-semibold transition-all',
                purchaseType === 'one-time'
                  ? 'border-[#9ad2e6] bg-[#9ad2e6] text-black'
                  : 'border-gray-200 bg-white text-black hover:border-gray-400',
              )}
            >
              One-time
            </button>
            <button
              type="button"
              onClick={() => setPurchaseType('subscribe')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-none border-2 text-sm font-semibold transition-all',
                purchaseType === 'subscribe'
                  ? 'border-[#9ad2e6] bg-[#9ad2e6] text-black'
                  : 'border-gray-200 bg-white text-black hover:border-gray-400',
              )}
            >
              Subscribe &amp; Save
            </button>
          </div>

          {/* Plan options when subscribe is selected */}
          {purchaseType === 'subscribe' && (
            <div className="flex flex-col gap-2 mt-1">
              {allPlans.map((plan) => {
                const discount = getDiscount(plan);
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-none border-2 text-sm transition-all text-left',
                      isSelected
                        ? 'border-[#9ad2e6] bg-[#9ad2e6]/5'
                        : 'border-gray-200 bg-white hover:border-gray-400',
                    )}
                  >
                    <span className="font-medium text-black">{plan.name}</span>
                    {discount && (
                      <span className="text-xs font-black text-[#00875A] bg-[#E3F9F0] px-2 py-0.5 rounded-none ml-2 whitespace-nowrap">
                        {discount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold uppercase tracking-wide text-black/70">
          Quantity
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
            className="h-10 w-10 border-2 border-black hover:bg-white hover:text-black disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4 stroke-[2.5]" />
          </Button>
          <span className="text-base font-semibold min-w-[3rem] text-center">
            {quantity}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity((prev) => prev + 1)}
            className="h-10 w-10 border-2 border-black hover:bg-white hover:text-black"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <BuyNowButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          lines={cartLines}
          analytics={
            selectedVariant && product
              ? {
                  products: [
                    {
                      id: product.id,
                      title: product.title,
                      price: selectedVariant.price.amount,
                      vendor: product.vendor,
                      variantId: selectedVariant.id,
                      variantTitle: selectedVariant.title,
                      quantity,
                    },
                  ],
                }
              : undefined
          }
        >
          {selectedVariant?.availableForSale ? 'Buy now' : 'Sold out'}
        </BuyNowButton>
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={cartLines}
          analytics={
            selectedVariant && product
              ? {
                  products: [
                    {
                      id: product.id,
                      title: product.title,
                      price: selectedVariant.price.amount,
                      vendor: product.vendor,
                      variantId: selectedVariant.id,
                      variantTitle: selectedVariant.title,
                      quantity,
                    },
                  ],
                }
              : undefined
          }
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>

        {!selectedVariant?.availableForSale && product && (
          <a
            href={`mailto:hello@sassypsyduck.com?subject=${encodeURIComponent(
              `Restock request: ${product.title}${selectedVariant?.title && selectedVariant.title !== 'Default Title' ? ` (${selectedVariant.title})` : ''}`,
            )}&body=${encodeURIComponent(
              `Hi Sassypsyduck, please notify me when this is back in stock:\n\n${product.title}${selectedVariant?.title && selectedVariant.title !== 'Default Title' ? ` — ${selectedVariant.title}` : ''}`,
            )}`}
            className="w-full text-center py-2.5 border border-black text-black text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
          >
            Request via email when back in stock
          </a>
        )}
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="flex items-center justify-center w-8 h-8 rounded-none overflow-hidden border-2 border-black"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      )}
    </div>
  );
}
