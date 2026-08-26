import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blogs.$blogHandle.$articleHandle';
import {Image, getSeoMeta} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getCanonicalUrl} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const article = data?.article;
  
  // Build Article JSON-LD from Shopify data
  const articleJsonLd = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.image?.url,
    datePublished: article.publishedAt,
    author: article.author?.name ? {
      '@type': 'Person',
      name: article.author.name,
    } : undefined,
    description: article.seo?.description || undefined,
  } : undefined;

  // Merge parent SEO with article-specific SEO
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    {
      ...data?.seo,
      jsonLd: articleJsonLd,
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;
  const canonicalUrl = getCanonicalUrl(request);

  return {
    article,
    seo: {
      title: article.seo?.title || article.title,
      description: article.seo?.description,
      url: canonicalUrl,
      media: article.image
        ? {
            url: article.image.url,
            width: article.image.width,
            height: article.image.height,
            altText: article.image.altText || article.title,
          }
        : undefined,
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

export default function Article() {
  const {article} = useLoaderData<typeof loader>();
  const {title, image, contentHtml} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black leading-tight">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-black/70">
          <time dateTime={article.publishedAt} className="text-base font-medium">
            {publishedDate}
          </time>
        </div>
      </div>

      {/* Featured Image */}
      {image && (
        <div className="mb-8 rounded-none overflow-hidden">
          <Image
            data={image}
            sizes="(min-width: 1024px) 896px, 100vw"
            loading="eager"
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Article Content with Prose Styling */}
      <div
        dangerouslySetInnerHTML={{__html: contentHtml}}
        className="article-content text-gray-700 leading-relaxed"
      />

      {/* Prose Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .article-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #000;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
        }
        .article-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .article-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #000;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .article-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #000;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .article-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .article-content ul,
        .article-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .article-content ul {
          list-style-type: disc;
        }
        .article-content ol {
          list-style-type: decimal;
        }
        .article-content li {
          margin-bottom: 0.5rem;
        }
        .article-content strong {
          font-weight: 600;
          color: #000;
        }
        .article-content em {
          font-style: italic;
        }
        .article-content a {
          color: #9ad2e6;
          text-decoration: underline;
        }
        .article-content a:hover {
          color: #00c264;
        }
        .article-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 1.5rem 0;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .article-content th {
          background-color: #f9fafb;
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
        }
        .article-content td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
        }
        .article-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: monospace;
        }
        .article-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .article-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .article-content hr {
          border: none;
          border-top: 1px solid #d1d5db;
          margin: 2rem 0;
        }
      `}} />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
