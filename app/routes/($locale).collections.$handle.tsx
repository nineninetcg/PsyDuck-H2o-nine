import {redirect, useLoaderData, useLocation} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).collections.$handle';
import {Analytics, getSeoMeta} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getCanonicalUrl} from '~/lib/seo';
import {ProductItem} from '~/components/ProductItem';
import {CollectionFAQ} from '~/components/CollectionFAQ';

export const meta: Route.MetaFunction = ({data, matches}) => {
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    data?.seo,
  ) ?? [];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return criticalData;
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const after = url.searchParams.get('after') || undefined;

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, first: 24, after},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    seo: {
      title: collection.seo?.title || collection.title,
      description: collection.seo?.description || collection.description,
      url: getCanonicalUrl(request),
      media: collection.image
        ? {
            url: collection.image.url,
            width: collection.image.width,
            height: collection.image.height,
            altText: collection.image.altText || collection.title,
          }
        : undefined,
    },
  };
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const products = collection.products.nodes;
  const {hasNextPage, hasPreviousPage, endCursor, startCursor} =
    collection.products.pageInfo;

  return (
    <div className="w-full px-6 md:px-14 py-16">
      <div className="mb-10">
        <p className="text-[#9ad2e6] text-xs font-bold tracking-[0.3em] uppercase mb-2">
          Collection
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          {collection.title.toUpperCase()}
          <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
        </h1>
        {collection.descriptionHtml && (
          <div className="mt-4 w-full">
            <div
              style={{
                maxHeight: expanded ? '2000px' : '68px',
                transition: 'max-height 0.3s ease',
              }}
              className="text-gray-600 text-sm leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:hidden [&>h2]:hidden overflow-hidden md:!max-h-none md:overflow-visible"
              dangerouslySetInnerHTML={{__html: collection.descriptionHtml}}
            />
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-bold text-[#9ad2e6] hover:underline tracking-wide uppercase md:hidden"
            >
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">No products in this collection.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-12">
          {products.map((product: any, index: number) => {
            const isLastOdd = false;
            return (
              <div key={product.id}>
                <ProductItem
                  product={product}
                  loading={index < 8 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {(hasPreviousPage || hasNextPage) && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {hasPreviousPage && startCursor && (
            <a
              href={`${location.pathname}?before=${startCursor}`}
              className="px-8 py-3 border border-black text-black text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
            >
              ← Previous
            </a>
          )}
          {hasNextPage && endCursor && (
            <a
              href={`${location.pathname}?after=${endCursor}`}
              className="px-8 py-3 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-[#9ad2e6] hover:text-black transition-colors"
            >
              Next →
            </a>
          )}
        </div>
      )}

      <CollectionFAQ handle={collection.handle} />

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductVariantItem on ProductVariant {
    id
    availableForSale
    compareAtPrice { ...MoneyProductItem }
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice { ...MoneyProductItem }
      maxVariantPrice { ...MoneyProductItem }
    }
    selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariantItem
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $after: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      seo {
        title
        description
      }
      image {
        url
        width
        height
        altText
      }
      products(first: $first, after: $after) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
