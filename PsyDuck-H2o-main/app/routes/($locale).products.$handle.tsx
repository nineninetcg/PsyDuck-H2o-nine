import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  getSeoMeta,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {HowItWorks} from '~/components/HowItWorks';
import {ProductFAQ} from '~/components/ProductFAQ';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getCanonicalUrl} from '~/lib/seo';
import {useState, useEffect, useMemo} from 'react';
import {cn} from '@/lib/utils';


/* Product Image Gallery */
function ProductGallery({
  images,
  selectedImage,
}: {
  images: Array<{id: string; url: string; altText: string | null; width: number | null; height: number | null}>;
  selectedImage?: {id?: string | null; url: string; altText: string | null; width: number | null; height: number | null} | null;
}) {
  const allImages = images.length > 0 ? images : selectedImage ? [selectedImage as any] : [];
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!selectedImage) return 0;
    const idx = allImages.findIndex((img) => img.id === selectedImage.id || img.url === selectedImage.url);
    return idx >= 0 ? idx : 0;
  });

  // Sync to variant image change
  useEffect(() => {
    if (!selectedImage) return;
    const idx = allImages.findIndex((img) => img.id === selectedImage.id || img.url === selectedImage.url);
    if (idx >= 0) setActiveIndex(idx);
  }, [selectedImage?.url]);

  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 border-2 border-black rounded-none flex items-center justify-center">
        <span className="text-gray-600 text-sm">No image available</span>
      </div>
    );
  }

  const active = allImages[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="w-full rounded-none overflow-hidden border-2 border-black">
        <img
          src={active.url}
          alt={active.altText || 'Product Image'}
          className="w-full h-auto block"
        />
      </div>
      {/* Thumbnails — only show if more than 1 image */}
      {allImages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allImages.map((img, i) => (
            <button
              key={img.id || img.url}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 rounded-none overflow-hidden border-2 transition-all flex-shrink-0 bg-gray-50 ${
                i === activeIndex
                  ? 'border-[#9ad2e6] shadow-md shadow-[#9ad2e6]/20'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={img.url}
                alt={img.altText || `Product image ${i + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const meta: Route.MetaFunction = ({data, matches}) => {
  const product = data?.product;
  const selectedVariant = product?.selectedOrFirstAvailableVariant;
  const canonicalUrl = data?.seo?.url;

  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: selectedVariant?.image?.url,
    sku: selectedVariant?.sku || undefined,
    brand: product.vendor ? {'@type': 'Brand', name: product.vendor} : undefined,
    offers: selectedVariant?.price ? {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: selectedVariant.price.currencyCode,
      price: selectedVariant.price.amount,
      availability: selectedVariant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    } : undefined,
  } : undefined;

  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    {...data?.seo, jsonLd: productJsonLd},
  ) ?? [];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Error('Expected product handle to be defined');

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  if (!product?.id) throw new Response(null, {status: 404});

  const {productRecommendations} = await storefront.query(RELATED_PRODUCTS_QUERY, {
    variables: {productId: product.id, country: context.storefront.i18n.country, language: context.storefront.i18n.language},
  }).catch(() => ({productRecommendations: null}));

  redirectIfHandleIsLocalized(request, {handle, data: product});

  const selectedVariant = product.selectedOrFirstAvailableVariant;
  const canonicalUrl = getCanonicalUrl(request);

  return {
    product,
    recommendations: productRecommendations?.filter((p: any) => p.id !== product.id).slice(0, 4) ?? [],
    seo: {
      title: product.seo?.title || product.title,
      description: product.seo?.description || product.description,
      url: canonicalUrl,
      media: selectedVariant?.image
        ? {
            url: selectedVariant.image.url,
            width: selectedVariant.image.width,
            height: selectedVariant.image.height,
            altText: selectedVariant.image.altText || product.title,
          }
        : undefined,
    },
  };
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  return {};
}


/* Hard-coded low-stock counts for the 30th Celebration line — driven from
   confirmed allocation, not live inventory, so this always renders regardless
   of Storefront API inventory-visibility settings. Update here when restocked. */
const URGENCY_STOCK: Record<string, {single: number; case: number}> = {
  'pokemon-tcg-30th-celebration-elite-trainer-box-preorder': {single: 4, case: 1},
  'pokemon-tcg-30th-celebration-etb-4-box-collector-bundle-preorder': {single: 7, case: 2},
  'pokemon-tcg-30th-celebration-booster-bundle-preorder': {single: 11, case: 3},
  'pokemon-tcg-30th-celebration-poster-collection-preorder': {single: 9, case: 4},
  'pokemon-tcg-30th-celebration-binder-collection-preorder': {single: 6, case: 2},
  'pokemon-tcg-30th-celebration-ditto-premium-collection-preorder': {single: 8, case: 3},
  'pokemon-tcg-30th-celebration-ultra-premium-collection-day-night-preorder': {single: 5, case: 1},
  'pokemon-tcg-30th-celebration-mini-tin-set-full-set-of-10-preorder': {single: 13, case: 3},
};

/* Total allocation pool per handle, used only to compute a "sold" counter for
   urgency. Singles pool at 300 units, cases vary 20-30 depending on the product.
   sold = total - remaining. Not tied to live inventory. */
const TOTAL_STOCK: Record<string, {single: number; case: number}> = {
  'pokemon-tcg-30th-celebration-elite-trainer-box-preorder': {single: 300, case: 25},
  'pokemon-tcg-30th-celebration-etb-4-box-collector-bundle-preorder': {single: 300, case: 22},
  'pokemon-tcg-30th-celebration-booster-bundle-preorder': {single: 300, case: 28},
  'pokemon-tcg-30th-celebration-poster-collection-preorder': {single: 300, case: 24},
  'pokemon-tcg-30th-celebration-binder-collection-preorder': {single: 300, case: 26},
  'pokemon-tcg-30th-celebration-ditto-premium-collection-preorder': {single: 300, case: 23},
  'pokemon-tcg-30th-celebration-ultra-premium-collection-day-night-preorder': {single: 300, case: 20},
  'pokemon-tcg-30th-celebration-mini-tin-set-full-set-of-10-preorder': {single: 300, case: 27},
};

function getUrgencyStock(handle: string, variantTitle?: string | null): number | null {
  const entry = URGENCY_STOCK[handle];
  if (!entry) return null;
  const isCase = (variantTitle || '').toLowerCase().includes('case');
  return isCase ? entry.case : entry.single;
}

function getUrgencySold(handle: string, variantTitle?: string | null): number | null {
  const remaining = URGENCY_STOCK[handle];
  const total = TOTAL_STOCK[handle];
  if (!remaining || !total) return null;
  const isCase = (variantTitle || '').toLowerCase().includes('case');
  return isCase ? total.case - remaining.case : total.single - remaining.single;
}

function isVolumeDiscountEligible(handle: string): boolean {
  return handle in URGENCY_STOCK;
}

export default function Product() {
  const {product, recommendations} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const sellingPlanGroups = (product as any).sellingPlanGroups?.nodes ?? [];

  const savePercent =
    selectedVariant?.compareAtPrice &&
    parseFloat(selectedVariant.compareAtPrice.amount) !== parseFloat(selectedVariant.price.amount)
      ? Math.round(
          ((parseFloat(selectedVariant.compareAtPrice.amount) - parseFloat(selectedVariant.price.amount)) /
            parseFloat(selectedVariant.compareAtPrice.amount)) *
            100,
        )
      : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <ProductGallery
            images={product.images?.nodes ?? []}
            selectedImage={selectedVariant?.image}
          />
        </div>
        <div className="md:col-span-3 flex flex-col gap-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {savePercent !== null && (
              <span className="bg-[#9ad2e6] text-black text-sm font-black px-3 py-1 whitespace-nowrap">
                SAVE {savePercent}%
              </span>
            )}
          </div>

          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />

          {(() => {
            const stock = getUrgencyStock(product.handle, selectedVariant?.title);
            if (stock === null) return null;
            const sold = getUrgencySold(product.handle, selectedVariant?.title);
            return (
              <div className="-mt-2 flex flex-col gap-1">
                <p className="text-sm font-bold text-green-600">
                  {stock} in stock
                </p>
                {sold !== null && sold > 0 && (
                  <p className="text-xs text-red-600">
                    {sold} already sold
                  </p>
                )}
              </div>
            );
          })()}

          {isVolumeDiscountEligible(product.handle) && (
            <div className="-mt-1 border border-[#9ad2e6] bg-[#9ad2e6]/10 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-black">
                Buy 3 or more, save 10%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Applies automatically at checkout on 3+ units across any 30th Celebration item, no code needed.
              </p>
            </div>
          )}

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            sellingPlanGroups={sellingPlanGroups}
            product={{
              id: product.id,
              title: product.title,
              vendor: product.vendor,
            }}
          />

          {/* Trust badges — 2×2 grid on mobile */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: 'Factory Sealed',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
              },
              {
                label: 'Insured Shipping',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
              },
              {
                label: 'Refund on Shortfall',
                icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></>,
              },
              {
                label: 'Secure Checkout',
                icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
              },
            ].map(({label, icon}) => (
              <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2.5 rounded-none">
                <svg className="w-4 h-4 text-[#9ad2e6] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {icon}
                </svg>
                <span className="text-xs font-bold text-black uppercase tracking-wide leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-black/60">
            Questions?{' '}
            <a href="/pages/contact" className="text-[#9ad2e6] hover:underline font-semibold">
              Contact support
            </a>
            {' '}— we reply within 24h.
          </p>

          <div className="border-t pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/60 mb-4">
              Description
            </p>
            <div
              className="prose prose-sm max-w-none text-black/80"
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
          </div>
        </div>
      </div>

      {/* Product FAQ */}
      <ProductFAQ />

      {/* Related Products */}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-black tracking-tight mb-2 text-black">
            You might also like
            <span className="block w-10 h-1 bg-[#9ad2e6] mt-2" />
          </h2>
          <p className="text-sm text-gray-600 mb-8">Other sets and formats you might want to add to your order</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((rec: any) => (
              <a
                key={rec.id}
                href={`/products/${rec.handle}`}
                className="group border border-gray-100 rounded-none p-4 hover:border-[#9ad2e6] hover:shadow-lg hover:shadow-[#9ad2e6]/10 transition-all duration-200"
              >
                <div className="aspect-square rounded-none overflow-hidden bg-white mb-3 flex items-center justify-center">
                  {rec.featuredImage ? (
                    <img
                      src={rec.featuredImage.url}
                      alt={rec.featuredImage.altText ?? rec.title}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <span className="text-gray-200 text-3xl font-bold">V</span>
                  )}
                </div>
                <p className="font-semibold text-sm text-gray-900 group-hover:text-black leading-tight truncate">
                  {rec.title}
                </p>
                <p className="text-black text-xs font-bold mt-1">
                  From MYR {parseFloat(rec.priceRange.minVariantPrice.amount).toFixed(2)}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews — single section */}

      {/* Judge.me write-a-review widget (no duplicate header) */}

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    quantityAvailable
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch {
          color
          image { previewImage { url } }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) { ...ProductVariant }
    seo { description title }
    sellingPlanGroups(first: 10) {
      nodes {
        name
        sellingPlans(first: 10) {
          nodes {
            id
            name
            options { name value }
            priceAdjustments {
              adjustmentValue {
                ... on SellingPlanPercentagePriceAdjustment {
                  adjustmentPercentage
                }
                ... on SellingPlanFixedAmountPriceAdjustment {
                  adjustmentAmount { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) { ...Product }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RELATED_PRODUCTS_QUERY = `#graphql
  query RelatedProducts(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      featuredImage { url altText }
      priceRange { minVariantPrice { amount currencyCode } }
    }
  }
` as const;
