import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).pages.$handle';
import {getSeoMeta} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getCanonicalUrl} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, matches}) => {
  // Merge parent SEO with page-specific SEO
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
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  const canonicalUrl = getCanonicalUrl(request);

  return {
    page,
    seo: {
      title: page.seo?.title || page.title,
      description: page.seo?.description,
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

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
          {page.title}
        </h1>
      </div>

      {/* Page Content with Typography Styles */}
      <div 
        className="page-content text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{__html: page.body}} 
      />
      
      {/* Add inline styles for the page content */}
      <style dangerouslySetInnerHTML={{__html: `
        .page-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #000;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
        }
        .page-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .page-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #000;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .page-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #000;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .page-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .page-content ul,
        .page-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .page-content ul {
          list-style-type: disc;
        }
        .page-content ol {
          list-style-type: decimal;
        }
        .page-content li {
          margin-bottom: 0.5rem;
        }
        .page-content strong {
          font-weight: 600;
          color: #000;
        }
        .page-content em {
          font-style: italic;
        }
        .page-content a {
          color: #9ad2e6;
          text-decoration: underline;
        }
        .page-content a:hover {
          color: #00c264;
        }
        .page-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 1rem 0;
        }
        .page-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .page-content th {
          background-color: #f9fafb;
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
        }
        .page-content td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
        }
        .page-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: monospace;
        }
        .page-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .page-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .page-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .page-content hr {
          border: none;
          border-top: 1px solid #d1d5db;
          margin: 2rem 0;
        }
      `}} />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
