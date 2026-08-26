import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/($locale).policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {getSeoMeta} from '@shopify/hydrogen';
import {Card, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
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
      title: `Policies | ${shopName}`,
      description: rootSeo?.seo?.description,
      url: data?.seo?.url,
    },
  ) ?? [];
};

export async function loader({context, request}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  const canonicalUrl = getCanonicalUrl(request);

  return {
    policies,
    seo: {
      url: canonicalUrl,
    },
  };
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
          Policies
        </h1>
        <p className="text-lg text-gray-600">
          Review our store policies and terms
        </p>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((policy) => (
          <Link 
            key={policy.id} 
            to={`/policies/${policy.handle}`}
            className="group"
          >
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-black group-hover:-translate-y-1">
              <CardHeader className="py-8">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">{policy.title}</span>
                  <svg 
                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </CardTitle>
                <CardDescription className="text-sm mt-2">
                  Click to read our {policy.title.toLowerCase()}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
