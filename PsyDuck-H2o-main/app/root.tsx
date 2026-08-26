import {Analytics, getShopAnalytics, useNonce, getSeoMeta} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import globalStyles from '~/styles/globals.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {PixelScripts, PixelEvents} from './components/PixelScripts';
import {detectLocale} from '~/lib/locale-detection';
import {SUPPORTED_LOCALES, DEFAULT_LOCALE} from '~/lib/i18n';


// Meta export for base SEO - child routes will merge with this
export const meta: Route.MetaFunction = ({data, location}) => {
  // Build Organization JSON-LD from Shopify shop data
  const organizationJsonLd = data?.seo ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.seo.title,
    description: data.seo.description,
  } : undefined;

  // Generate hreflang tags for i18n
  const baseUrl = data?.publicStoreDomain 
    ? `https://${data.publicStoreDomain}` 
    : '';
  
  // Get the path without locale prefix
  const currentPath = location.pathname;
  const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}-[a-z]{2}/i, '') || '/';
  
  // Generate hreflang link tags for each supported locale
  const hreflangLinks = SUPPORTED_LOCALES.map((locale) => {
    const localePath = locale.pathPrefix 
      ? `${locale.pathPrefix}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
      : pathWithoutLocale;
    const hreflangCode = `${locale.language.toLowerCase()}-${locale.country.toLowerCase()}`;
    
    return {
      tagName: 'link' as const,
      rel: 'alternate',
      hrefLang: hreflangCode,
      href: `${baseUrl}${localePath || '/'}`,
    };
  });

  // Add x-default hreflang (points to default locale)
  const xDefaultPath = pathWithoutLocale === '/' ? '/' : pathWithoutLocale;
  hreflangLinks.push({
    tagName: 'link' as const,
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}${xDefaultPath}`,
  });

  const seoMeta = getSeoMeta({
    title: data?.seo?.title,
    description: data?.seo?.description,
    jsonLd: organizationJsonLd,
  }) ?? [];

  return [
    ...seoMeta,
    ...hreflangLinks,
  ];
};

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png'},
    {rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png'},
    {rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon-180.png'},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;
  const url = new URL(args.request.url);
  const hostname = url.hostname;

  // Define domains that should have noindex (staging/preview domains only)
  const noindexDomains = ['hydroxy-1485.myshopify.com'];
  const shouldNoindex = noindexDomains.includes(hostname);

  // Detect locale from various sources (URL, cookie, headers)
  const localeDetection = detectLocale(args.request);

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shouldNoindex,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
    // Pass locale detection data to the client for UI components
    localeDetection: {
      currentLocale: localeDetection.currentLocale,
      suggestedLocale: localeDetection.suggestedLocale,
      shouldSuggestLocaleChange: localeDetection.shouldSuggestLocaleChange,
      suggestionSource: localeDetection.suggestionSource,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header, shopData] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    storefront.query(SHOP_QUERY, {
      cache: storefront.CacheLong(),
    }),
  ]);

  return {
    header,
    seo: {
      title: shopData.shop.name,
      description: shopData.shop.description,
    },
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer',
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');
  
  // Get language from loader data or default to 'en'
  const lang = data?.consent?.language?.toLowerCase() || 'en';

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {data?.shouldNoindex && <meta name="robots" content="noindex, nofollow" />}
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={globalStyles}></link>
        <Meta />
        <Links />
        <PixelScripts nonce={nonce} />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  const {localeDetection} = data;

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PixelEvents />
      <PageLayout {...data} localeDetection={localeDetection}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const nonce = useNonce();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={globalStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="route-error">
          <h1>Oops</h1>
          <h2>{errorStatus}</h2>
          {errorMessage && (
            <fieldset>
              <pre>{errorMessage}</pre>
            </fieldset>
          )}
        </div>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

const SHOP_QUERY = `#graphql
  query ShopSEO {
    shop {
      name
      description
    }
  }
` as const;
