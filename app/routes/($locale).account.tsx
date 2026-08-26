import {
  data as remixData,
  Form,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/($locale).account';
import {getSeoMeta} from '@shopify/hydrogen';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {LocaleNavLink} from '~/components/LocaleLink';

export const meta: Route.MetaFunction = ({matches}) => {
  // Get shop name from root SEO for dynamic title
  const rootSeo = matches.find((match) => match?.id === 'root')?.data as any;
  const shopName = rootSeo?.seo?.title || 'Shop';
  
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    {
      title: `Account | ${shopName}`,
      robots: {noIndex: true, noFollow: true}, // Account pages should not be indexed
    },
  ) ?? [];
};

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="account">
      <h1>{heading}</h1>
      <br />
      <AccountMenu />
      <br />
      <br />
      <Outlet context={{customer}} />
    </div>
  );
}

function AccountMenu() {
  function isActiveStyle({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'black',
    };
  }

  return (
    <nav role="navigation">
      <LocaleNavLink to="/account/orders" style={isActiveStyle}>
        Orders &nbsp;
      </LocaleNavLink>
      &nbsp;|&nbsp;
      <LocaleNavLink to="/account/profile" style={isActiveStyle}>
        &nbsp; Profile &nbsp;
      </LocaleNavLink>
      &nbsp;|&nbsp;
      <LocaleNavLink to="/account/addresses" style={isActiveStyle}>
        &nbsp; Addresses &nbsp;
      </LocaleNavLink>
      &nbsp;|&nbsp;
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      &nbsp;<button type="submit">Sign out</button>
    </Form>
  );
}
