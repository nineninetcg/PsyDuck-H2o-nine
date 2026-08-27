import type {Route} from './+types/($locale).affiliates';
import {getSeoMeta} from '@shopify/hydrogen';
import {getCanonicalUrl} from '~/lib/seo';

const SIGNUP_URL = 'https://af.uppromote.com/sassypsyduck/register';
const LOGIN_URL = 'https://af.uppromote.com/sassypsyduck/login';

export const meta: Route.MetaFunction = ({data, matches}) => {
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    data?.seo,
  ) ?? [];
};

export function loader({request}: {request: Request}) {
  const canonicalUrl = getCanonicalUrl(request);

  return {
    seo: {
      title: 'Affiliate Program | Sassypsyduck',
      description:
        'Earn 12.5% commission promoting sealed Pokémon TCG preorders. Average order value over $495 USD, 30 day cookie, monthly payouts.',
      url: canonicalUrl,
    },
  };
}

const NUMBERS = [
  {v: '12.5%', l: 'Commission on every sale'},
  {v: '$495+', l: 'Average order value'},
  {v: '30 days', l: 'Cookie window'},
  {v: 'Monthly', l: 'Payouts, $25 minimum'},
];

const EARNINGS = [
  {product: 'Booster Bundle', price: '$42', payout: '$5'},
  {product: 'Elite Trainer Box', price: '$112', payout: '$14'},
  {product: 'Storm Emeralda JP Box', price: '$124', payout: '$15'},
  {product: 'Mini Tin Set of 10', price: '$144', payout: '$18'},
  {product: 'Pokémon Center ETB', price: '$198', payout: '$25'},
  {product: 'Ultra Premium Collection', price: '$459', payout: '$57'},
];

const WHY = [
  {
    t: 'Confirmed allocation, not guesswork',
    d: 'We only list what our distributor has confirmed to us in writing. We do not oversell, so your audience actually receives what they ordered.',
  },
  {
    t: 'Every order filmed while packed',
    d: 'The customer gets the clip by email before it ships. That one detail closes more sales than any discount, and it makes your recommendation safe to give.',
  },
  {
    t: 'People buy in bulk',
    d: 'Most customers order several items at once. Single orders regularly clear $744, which pays out over $93 on one referral.',
  },
  {
    t: 'Free cancellation for 3 days',
    d: 'Low risk for your audience means higher conversion for you.',
  },
];

const FAQS = [
  {
    q: 'How do I get paid?',
    a: 'Monthly, within 14 days of month end, once your balance reaches $25. Anything below that rolls over to the next month.',
  },
  {
    q: 'When is a commission confirmed?',
    a: 'Commission is confirmed 30 days after the order ships. Most of our stock is preorder, so an order placed in August may ship in September or November depending on the product.',
  },
  {
    q: 'Do I get commission on shipping?',
    a: 'No. Commission is calculated on product value only, excluding shipping and tax.',
  },
  {
    q: 'Can I run paid ads on your brand name?',
    a: 'No. Bidding on Sassypsyduck or any variation of it on Meta, Google, TikTok or any paid platform is not allowed and will close your account. Promote through your own audience and content.',
  },
  {
    q: 'Who is this for?',
    a: 'Pokémon TCG creators, collectors with an audience, community admins, and anyone active in the international Pokémon TCG card scene. We approve manually, so tell us where your audience is.',
  },
];

export default function Affiliates() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="w-full px-6 md:px-14 py-20 md:py-28 border-b border-gray-100">
        <div className="max-w-4xl">
          <p className="text-[#5db6d6] text-xs font-bold tracking-[0.3em] uppercase mb-4">
            Affiliate Program
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black leading-[1.05]">
            Get paid to send people
            <br />
            sealed Pokémon TCG.
            <span className="block w-14 h-1 bg-[#9ad2e6] mt-6" />
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mt-8 leading-relaxed max-w-2xl">
            12.5% commission on every order. Our average order is over $495,
            so a single referral is worth more than most programmes pay in a
            month.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href={SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center px-10 py-4 bg-[#9ad2e6] text-black font-black text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors"
            >
              Apply to join
            </a>
            <a
              href={LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center px-10 py-4 border border-black text-black font-black text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors"
            >
              Affiliate login
            </a>
          </div>
        </div>
      </section>

      {/* Numbers strip */}
      <section className="w-full border-b border-gray-100 bg-white">
        <div className="w-full px-6 md:px-14 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {NUMBERS.map((n) => (
            <div key={n.l}>
              <p className="text-3xl md:text-4xl font-black tracking-tight text-black">
                {n.v}
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-snug">{n.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Earnings table */}
      <section className="w-full px-6 md:px-14 py-20">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          What one referral pays
          <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-4 mb-8 max-w-2xl">
          Real products, real payouts. Most customers order more than one item.
        </p>

        <div className="w-full border-t border-gray-200">
          {EARNINGS.map((e) => (
            <div
              key={e.product}
              className="flex items-center justify-between gap-4 py-5 border-b border-gray-200"
            >
              <div className="min-w-0">
                <p className="font-bold text-black text-[15px] md:text-base leading-snug">
                  {e.product}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{e.price}</p>
              </div>
              <p className="text-lg md:text-2xl font-black text-black flex-shrink-0">
                {e.payout}
              </p>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-6">
          A $744 order pays you over <strong className="text-black">$93</strong>.
        </p>
      </section>

      {/* Why it converts */}
      <section className="w-full px-6 md:px-14 py-20 bg-gray-50 border-y border-gray-100">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Why your audience actually buys
          <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          {WHY.map((w) => (
            <div key={w.t}>
              <p className="font-black text-black text-lg mb-2">{w.t}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{w.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full px-6 md:px-14 py-20">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          How it works
          <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {[
            ['01', 'Apply', 'Tell us where your audience is. We review every application by hand, usually within 24 hours.'],
            ['02', 'Share', 'You get a personal link and discount code. Post it, story it, drop it in your community.'],
            ['03', 'Get paid', 'Track everything in your dashboard. Payouts go out monthly once you clear $25.'],
          ].map(([n, t, d]) => (
            <div key={n}>
              <p className="text-[#9ad2e6] text-3xl font-black">{n}</p>
              <p className="font-black text-black text-lg mt-2 mb-2">{t}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full px-6 md:px-14 py-20 border-t border-gray-100">
        <div className="px-0 md:px-0">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black">
            Questions
            <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
          </h2>
          <div className="w-full mt-8">
            {FAQS.map((f) => (
              <div key={f.q} className="border-b border-gray-200 py-6">
                <p className="font-bold text-black text-[15px] md:text-base mb-2">
                  {f.q}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="w-full px-6 md:px-14 py-20 bg-black">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Start earning on the biggest Pokémon release in 30 years.
          </h2>
          <p className="text-white/60 text-base md:text-lg mt-6 leading-relaxed">
            The 30th Celebration lineup runs from September to December. Delta
            Reign lands November. Get set up now and be ready when your audience
            starts asking where to buy.
          </p>
          <a
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-10 px-10 py-4 bg-[#9ad2e6] text-black font-black text-xs tracking-[0.2em] uppercase hover:bg-white transition-colors"
          >
            Apply to join
          </a>
        </div>
      </section>
    </div>
  );
}
