import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).policies.$handle';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';
import {getSeoMeta} from '@shopify/hydrogen';
import {Button} from '@/components/ui/button';
import {LocaleLink} from '~/components/LocaleLink';
import {getCanonicalUrl} from '~/lib/seo';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: Route.MetaFunction = ({data, matches}) => {
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    {
      title: data?.policy?.title,
      url: data?.seo?.url,
    },
  ) ?? [];
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName] ?? STATIC_POLICY_FALLBACKS[policyName as keyof typeof STATIC_POLICY_FALLBACKS] ?? null;

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  const canonicalUrl = getCanonicalUrl(request);

  return {
    policy,
    seo: {
      url: canonicalUrl,
    },
  };
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Back Button */}
      <div className="mb-8">
        <LocaleLink to="/policies">
          <Button variant="outline" className="gap-2">
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Policies
          </Button>
        </LocaleLink>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-black">
        {policy.title}
      </h1>

      {/* Policy Content with Typography Styles */}
      <div 
        className="policy-content text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{__html: policy.body}} 
      />
      
      {/* Add inline styles for the policy content */}
      <style dangerouslySetInnerHTML={{__html: `
        .policy-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #000;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
        }
        .policy-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .policy-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #000;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .policy-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .policy-content ul,
        .policy-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .policy-content ul {
          list-style-type: disc;
        }
        .policy-content ol {
          list-style-type: decimal;
        }
        .policy-content li {
          margin-bottom: 0.5rem;
        }
        .policy-content strong {
          font-weight: 600;
          color: #000;
        }
        .policy-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .policy-content a:hover {
          color: #1e40af;
        }
        .policy-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 1rem 0;
        }
        .policy-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .policy-content th {
          background-color: #f9fafb;
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
        }
        .policy-content td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
        }
        .policy-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: monospace;
        }
        .policy-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .policy-content pre code {
          background-color: transparent;
          padding: 0;
        }
      `}} />
    </div>
  );
}

// Static fallbacks for policies not yet configured in Shopify Admin
const STATIC_POLICY_FALLBACKS = {
  refundPolicy: {
    title: 'Refund Policy',
    handle: 'refund-policy',
    id: 'static-refund-policy',
    url: '/policies/refund-policy',
    body: `
      <h2>48-Hour Money-Back Guarantee</h2>
      <p>We stand behind every order with a <strong>48-hour money-back guarantee</strong>. If your credentials do not work within 48 hours of delivery, we will either replace them or issue a full refund — your choice.</p>

      <h2>Eligibility</h2>
      <p>Refunds are granted under the following conditions:</p>
      <ul>
        <li>Credentials were never delivered within the stated timeframe (up to 24 hours).</li>
        <li>Delivered credentials do not grant access to the stated product.</li>
        <li>The account was revoked or became inaccessible within 48 hours of delivery through no fault of the buyer.</li>
      </ul>

      <h2>How to Request a Refund</h2>
      <p>To request a refund or replacement, contact our support team via the <a href="/pages/contact">Contact page</a> within 48 hours of receiving your credentials. Include your order number and a brief description of the issue.</p>
      <p>We typically respond within a few hours and resolve all cases within 24 hours.</p>

      <h2>Non-Refundable Cases</h2>
      <ul>
        <li>Credentials worked at delivery but were later revoked due to the buyer violating the platform's terms of service.</li>
        <li>The buyer changed the account password or email address (this voids access for shared accounts).</li>
        <li>Refund requested after the 48-hour window has passed without prior contact.</li>
        <li>Digital downloads (prompt packs, cheat sheets) that have already been accessed.</li>
      </ul>

      <h2>Replacements</h2>
      <p>In most cases we prefer to offer a replacement before a refund, as this resolves the issue faster. Replacements are provided at no extra cost and are typically delivered within a few hours.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about this policy, please reach out via our <a href="/pages/contact">Contact page</a>. We are here to help and reply within 24 hours.</p>
    `,
  },
};

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
