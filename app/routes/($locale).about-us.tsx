import type {Route} from './+types/($locale).about-us';
import {getSeoMeta} from '@shopify/hydrogen';
import {getCanonicalUrl} from '~/lib/seo';

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
      title: 'About Us | Sassypsyduck',
      description: 'Sassypsyduck is an international Pokémon TCG retailer selling sealed, allocated preorders across the EU, US and Asia.',
      url: canonicalUrl,
    },
  };
}

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white px-4 py-24">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <h1 className="text-5xl font-black tracking-tight text-black mb-3">
            About Us
            <span className="block w-14 h-1 bg-[#9ad2e6] mt-4" />
          </h1>
          <p className="text-gray-500 text-lg mt-6 leading-relaxed">
            Sealed, authentic Pokémon TCG. Sourced right, priced fair, never oversold.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12 text-gray-700 text-base leading-relaxed">

          <section>
            <h2 className="text-2xl font-black text-black mb-3">What We Do</h2>
            <p>
              Sassypsyduck is an international Pokémon TCG retailer. We open preorders on the game's most hyped sets — starting with the 30th Celebration anniversary set and Mega Evolution: Delta Reign — and sell sealed booster boxes, Elite Trainer Boxes and collections year-round through our official distribution channel, shipping across the EU, US and Asia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-black mb-3">Why Sassypsyduck</h2>
            <p>
              Every product we sell is confirmed allocation before it's listed — we never sell what we don't already have secured. That means no overselling, no empty promises, and a refund automatically if allocation ever falls short. We price against real global market rates, not wishful MSRP, so what you see is what everyone else serious about the hobby is paying too.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-black mb-3">Our Promise</h2>
            <ul className="space-y-2 list-none pl-0">
              {[
                '100% sealed, authentic, English-language product',
                'Capped preorders — we only sell confirmed allocation',
                'Free cancellation within 3 days of ordering',
                'Automatic full refund if allocation falls short',
                'Insured international shipping, tracking emailed automatically',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#9ad2e6] font-bold mt-0.5">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-black mb-3">Get in Touch</h2>
            <address className="not-italic text-gray-600 leading-loose">
              <a href="mailto:hello@sassypsyduck.com" className="hover:text-[#9ad2e6] transition-colors">
                hello@sassypsyduck.com
              </a>
            </address>
          </section>

        </div>
      </div>
    </div>
  );
}
