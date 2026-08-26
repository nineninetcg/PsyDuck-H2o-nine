import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/($locale).collections._index';
import {getPaginationVariables, Image, getSeoMeta} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {getCanonicalUrl} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, matches}) => {
  // Get shop name from root SEO for dynamic title
  const rootSeo = matches.find((match) => match?.id === 'root')?.data as any;
  const shopName = rootSeo?.seo?.title || 'Shop';
  
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    {
      title: `Collections | ${shopName}`,
      description: rootSeo?.seo?.description,
      url: data?.seo?.url,
    },
  ) ?? [];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  const canonicalUrl = getCanonicalUrl(request);

  return {
    collections,
    seo: {
      url: canonicalUrl,
    },
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="w-full px-6 md:px-14 py-16">
      <div className="mb-12">
        <p className="text-[#9ad2e6] text-xs font-bold tracking-[0.3em] uppercase mb-2">
          Browse
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          COLLECTIONS
          <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
        </h1>
      </div>

      <PaginatedResourceSection<CollectionFragment>
        connection={collections}
        resourcesClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {({node: collection, index}) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            index={index}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="group block bg-white border border-gray-100 hover:border-[#9ad2e6] transition-colors overflow-hidden"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {collection?.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-white flex items-center justify-center">
            <span className="text-[#9ad2e6] text-4xl font-black">✦</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h5 className="text-sm font-bold uppercase tracking-wider text-black group-hover:text-[#9ad2e6] transition-colors">
          {collection.title}
        </h5>
        <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">Browse →</p>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
