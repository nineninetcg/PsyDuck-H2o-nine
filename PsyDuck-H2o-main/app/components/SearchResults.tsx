import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {LocaleLink} from '~/components/LocaleLink';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section className="search-result">
      <h2 className="text-2xl font-bold mb-4 text-black">Articles</h2>
      <div className="grid gap-3">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <LocaleLink
              key={article.id}
              prefetch="intent"
              to={articleUrl}
              className="block p-4 border-2 border-black rounded-none hover:border-[#9ad2e6] hover:bg-[#9ad2e6]/5 transition-all group"
            >
              <h3 className="font-semibold text-black group-hover:text-[#9ad2e6] transition-colors">
                {article.title}
              </h3>
            </LocaleLink>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <section className="search-result">
      <h2 className="text-2xl font-bold mb-4 text-black">Pages</h2>
      <div className="grid gap-3">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <LocaleLink
              key={page.id}
              prefetch="intent"
              to={pageUrl}
              className="block p-4 border-2 border-black rounded-none hover:border-[#9ad2e6] hover:bg-[#9ad2e6]/5 transition-all group"
            >
              <h3 className="font-semibold text-black group-hover:text-[#9ad2e6] transition-colors">
                {page.title}
              </h3>
            </LocaleLink>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  const {hasNextPage} = products.pageInfo || {};

  return (
    <section className="search-result">
      <h2 className="text-2xl font-bold mb-6 text-black">Products</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <LocaleLink
                key={product.id}
                prefetch="intent"
                to={productUrl}
                className="group block border-2 border-black rounded-none overflow-hidden hover:border-[#9ad2e6] transition-all bg-white"
              >
                {image && (
                  <div className="aspect-video bg-gray-100 overflow-hidden flex items-center justify-center">
                    <Image
                      data={image}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-black mb-2 line-clamp-2 group-hover:text-[#9ad2e6] transition-colors">
                    {product.title}
                  </h3>
                  {price && (
                    <div className="text-lg font-bold text-black">
                      <Money data={price} />
                    </div>
                  )}
                </div>
              </LocaleLink>
            );
          });

          return (
            <div className="space-y-6">
              {/* Product Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {ItemsMarkup}
              </div>

              {/* View More Button */}
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <NextLink
                    className={`px-8 py-3 border-2 border-black rounded-none font-semibold transition-all ${
                      isLoading
                        ? 'opacity-50 cursor-not-allowed bg-gray-100'
                        : 'bg-white hover:bg-[#9ad2e6] hover:text-black hover:border-[#9ad2e6]'
                    }`}
                  >
                    {isLoading ? 'Loading...' : 'View more'}
                  </NextLink>
                </div>
              )}
            </div>
          );
        }}
      </Pagination>
    </section>
  );
}

function SearchResultsEmpty({term}: {term?: string}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-black/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-black">
          {term ? 'No results found' : 'Start searching'}
        </h2>
        <p className="text-lg text-black/70 mb-6">
          {term ? (
            <>
              We couldn&apos;t find any results for{' '}
              <span className="font-semibold text-black">&quot;{term}&quot;</span>.
              <br />
              Try different keywords or check your spelling.
            </>
          ) : (
            'Enter a search term above to find products, articles, and pages.'
          )}
        </p>
        {term && (
          <div className="text-sm text-black/60">
            <p className="mb-2">Search tips:</p>
            <ul className="list-disc list-inside space-y-1 text-left max-w-xs mx-auto">
              <li>Check your spelling</li>
              <li>Try more general terms</li>
              <li>Use fewer keywords</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
