import type {Route} from './+types/($locale).collections.all';
import {useLoaderData, useLocation} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {getCanonicalUrl} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const rootSeo = matches.find((match) => match?.id === 'root')?.data as any;
  const shopName = rootSeo?.seo?.title || 'Shop';
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    {
      title: `All Products | ${shopName}`,
      description: rootSeo?.seo?.description,
      url: data?.seo?.url,
    },
  ) ?? [];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return criticalData;
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const after = url.searchParams.get('after') || undefined;

  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {first: 24, after},
  });

  return {
    products,
    seo: {url: getCanonicalUrl(request)},
  };
}

export default function CatalogPage() {
  const {products} = useLoaderData<typeof loader>();
  const location = useLocation();
  const nodes = products?.nodes ?? [];
  const {hasNextPage, hasPreviousPage, endCursor, startCursor} =
    products?.pageInfo ?? {};

  return (
    <div className="w-full px-6 md:px-14 py-16">
      <div className="mb-12">
        <p className="text-[#9ad2e6] text-xs font-bold tracking-[0.3em] uppercase mb-2">
          Browse
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          ALL PRODUCTS
          <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
        </h1>
      </div>

      {nodes.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-12">
          {nodes.map((product: any, index: number) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : 'lazy'}
            />
          ))}
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
    </div>
  );
}

const CATALOG_QUERY = `#graphql
  fragment CatalogMoney on MoneyV2 { amount currencyCode }
  fragment CatalogVariant on ProductVariant {
    id
    availableForSale
    compareAtPrice { ...CatalogMoney }
  }
  fragment CatalogProduct on Product {
    id handle title
    featuredImage { id altText url width height }
    priceRange {
      minVariantPrice { ...CatalogMoney }
      maxVariantPrice { ...CatalogMoney }
    }
    selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...CatalogVariant
    }
  }
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after, query: "NOT tag:freebie") {
      nodes { ...CatalogProduct }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
` as const;
