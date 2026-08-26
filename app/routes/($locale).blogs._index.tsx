import {Link, useLoaderData, useSearchParams, useLocation} from 'react-router';
import type {Route} from './+types/($locale).blogs._index';
import type {BlogsQuery} from 'storefrontapi.generated';
import {getSeoMeta} from '@shopify/hydrogen';
import {PagePagination} from '~/components/PagePagination';
import {getCanonicalUrl} from '~/lib/seo';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = ({data, matches}) => {
  // Merge parent SEO with blogs-specific SEO
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    data?.seo,
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
  const url = new URL(request.url);
  const pageBy = 16;
  
  // Use cursor from URL if available, otherwise start from beginning
  const cursor = url.searchParams.get('cursor');
  
  // Calculate pagination variables for cursor-based pagination
  const paginationVariables = cursor 
    ? {first: pageBy, endCursor: cursor}
    : {first: pageBy};

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  const canonicalUrl = getCanonicalUrl(request);

  return {
    blogs,
    seo: {
      title: 'Blogs',
      description: 'Explore our latest articles and insights on productivity tools and software.',
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

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const blogNodes = blogs.nodes;
  const {hasNextPage, hasPreviousPage} = blogs.pageInfo;
  const totalPages = hasNextPage ? currentPage + 1 : currentPage;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-black">
          Blogs
        </h1>
        <p className="text-lg text-black/70 max-w-3xl">
          Explore our latest articles and insights
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        {blogNodes.map((blog) => (
          <Link
            key={blog.handle}
            prefetch="intent"
            to={`/blogs/${blog.handle}`}
            className="group block"
          >
            <div className="bg-white border-2 border-black rounded-none p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
              <h2 className="text-xl font-bold text-black group-hover:text-[#9ad2e6] transition-colors mb-2 line-clamp-2">
                {blog.title}
              </h2>
              {blog.seo?.description && (
                <p className="text-sm text-black/70 line-clamp-2 mt-2">
                  {blog.seo.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <PagePagination
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={location.pathname}
        nextCursor={blogs.pageInfo.endCursor || undefined}
        prevCursor={blogs.pageInfo.startCursor || undefined}
      />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
