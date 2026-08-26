import type {Route} from './+types/($locale).$';
import {getSeoMeta} from '@shopify/hydrogen';

export const meta: Route.MetaFunction = ({matches}) => {
  // Get shop name from root SEO for dynamic title
  const rootSeo = matches.find((match) => match?.id === 'root')?.data as any;
  const shopName = rootSeo?.seo?.title || 'Shop';
  
  return getSeoMeta({
    title: `Page Not Found | ${shopName}`,
    robots: {noIndex: true, noFollow: true}, // 404 pages should not be indexed
  }) ?? [];
};

export async function loader({request}: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return null;
}
