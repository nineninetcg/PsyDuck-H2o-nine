import {useLoaderData, useSearchParams, useLocation} from 'react-router';
import type {Route} from './+types/($locale).blogs.$blogHandle._index';
import {Image, getSeoMeta} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getCanonicalUrl} from '~/lib/seo';
import {LocaleLink} from '~/components/LocaleLink';
import {Card} from '~/components/ui/card';
import {PagePagination} from '~/components/PagePagination';

export const meta: Route.MetaFunction = ({data, matches}) => {
  // Merge parent SEO with blog-specific SEO
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pageBy = 12;
  
  // Use cursor from URL if available, otherwise start from beginning
  const cursor = url.searchParams.get('cursor');
  
  // Calculate pagination variables for cursor-based pagination
  const paginationVariables = cursor 
    ? {first: pageBy, endCursor: cursor}
    : {first: pageBy};

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  const canonicalUrl = getCanonicalUrl(request);

  return {
    blog,
    seo: {
      title: blog.seo?.title || blog.title,
      description: blog.seo?.description,
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

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const articleNodes = articles.nodes;
  const {hasNextPage, hasPreviousPage} = articles.pageInfo;
  const totalPages = hasNextPage ? currentPage + 1 : currentPage;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-black">
          {blog.title}
        </h1>
        {blog.seo?.description && (
          <p className="text-lg text-black/70 max-w-3xl">
            {blog.seo.description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {articleNodes.map((article, index) => (
          <ArticleItem
            article={article}
            key={article.id}
            loading={index < 6 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      <PagePagination
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={location.pathname}
        nextCursor={articles.pageInfo.endCursor || undefined}
        prevCursor={articles.pageInfo.startCursor || undefined}
      />
    </div>
  );
}

function ArticleItem({
  article,
  loading,
}: {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));
  
  return (
    <LocaleLink
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="group block h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        {article.image && (
          <div className="relative w-full overflow-hidden rounded-t-xl">
            <div className="aspect-[3/2] w-full overflow-hidden">
              <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
                <Image
                  alt={article.image.altText || article.title}
                  aspectRatio="3/2"
                  data={article.image}
                  loading={loading}
                  sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-black group-hover:text-[#9ad2e6] transition-colors mb-3 line-clamp-2">
            {article.title}
          </h3>
          <div className="mt-auto pt-4 border-t border-gray-200">
            <p className="text-sm text-black/70 font-medium">
              {publishedAt}
            </p>
          </div>
        </div>
      </Card>
    </LocaleLink>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: PUBLISHED_AT,
        reverse: true
      ) {
        nodes {
          ...ArticleItem
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
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
