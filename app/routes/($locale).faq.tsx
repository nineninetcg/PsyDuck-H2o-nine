import {useState} from 'react';
import type {Route} from './+types/($locale).faq';
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
  return {
    seo: {
      title: 'FAQ | Sassypsyduck',
      description: 'Answers to common questions about Sassypsyduck Pokémon TCG preorders — allocation, pricing, delivery, and authenticity.',
      url: getCanonicalUrl(request),
    },
  };
}

const FAQS = [
  {
    question: 'Is this the real Pokémon TCG 30th Celebration set?',
    answer:
      "Yes, and this is the part we take most pride in. Every box we sell comes through the official Pokemon distribution channel for Southeast Asia, run out of Singapore, which is the same pipeline that supplies every licensed card shop in the region. It is not grey market stock, not a reprint, not something bought off a marketplace and flipped. It is factory sealed English language product that came down the proper chain, and we can point to where every unit came from. On top of that we film every order while we pack it and email you the clip before it ships, so you see exactly what went into your parcel."
  },
  {
    question: 'How does preordering work here?',
    answer:
      "We only open preorders for what our distributor has confirmed to us. Once you order, your unit is reserved and comes off the count we're allowed to sell. We're not taking unlimited orders and hoping the stock shows up later.",
  },
  {
    question: 'When will my order arrive?',
    answer:
      'Worldwide street date for most of the 30th Celebration lineup is September 16, 2026 (a few items release slightly later, the exact date is on each product page). Stock usually lands with us on or just after that date, and we ship within 3 working days of receiving it.',
  },
  {
    question: 'Do I have to pay the full amount upfront?',
    answer:
      'Yes, full payment at checkout. That is what reserves your unit against our confirmed allocation. You can cancel for a full refund within 3 days if you change your mind.',
  },
  {
    question: 'How are the products shipped?',
    answer:
      'Every order is bubble wrapped and padded with packing paper along the sides so nothing shifts in transit, then boxed and sealed. We film the entire packing process and email you the clip before it goes out, so you can see exactly what went into your parcel. Dispatch takes 4 days to a week depending on how busy the store is. Preorders ship within that same window once stock lands with us.',
  },
  {
    question: 'Do you have a physical store, and can I collect in person?',
    answer:
      'Not yet. We are online only at the moment, but we are opening a physical store in late September to early October 2026. Once it opens you will be able to collect your order in person instead of having it shipped.',
  },
  {
    question: 'How much is shipping?',
    answer:
      'Flat $10.50 USD, no matter how big your order is.',
  },
  {
    question: 'Why are deposits not available?',
    answer:
      "A deposit means you pay part now and the rest later, and the shop holds your unit in between. Plenty of preorder sellers do it. We used to offer it and we have stopped, for one reason: our allocation is capped, and a deposit does not fully commit a unit. If someone puts down half and then goes quiet, that box sat reserved for weeks and somebody who actually wanted it missed out. Full payment at checkout is what locks your unit against our confirmed allocation with the distributor, cleanly, with nobody chasing balances at release. You are not losing flexibility either. You can cancel for a full refund within 3 days, and you pay by card so your bank sits between us the whole time.",
  },
  {
    question: 'Can I cancel or get a refund?',
    answer:
      "You can cancel for a full refund within 3 days of placing your order. After that, your unit is already locked into our allocation and we can't release it back, so refunds aren't available past that window. Full details are on our Refund Policy page.",
  },
  {
    question: "What if you can't get as much stock as you sold?",
    answer:
      "Hasn't happened, but if it ever did, everyone affected gets a full, automatic refund. We'd rather undersell than oversell.",
  },
  {
    question: 'How do I track my order?',
    answer:
      'You get an email automatically the moment your order ships, with the packing video and your tracking number. Nothing to chase, it just arrives.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      "Card and PayPal at checkout, both handled directly by Stripe and PayPal. We never see or store your card details.",
  },
  {
    question: 'Where do you ship, and how much is it?',
    answer:
      'We ship internationally. Flat $10.50 USD, no matter how big your order is.',
  },
  {
    question: 'How do I get in touch?',
    answer:
      'Email hello@sassypsyduck.com.',
  },
];

function FAQItem({question, answer}: {question: string; answer: string}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-6 text-left"
      >
        <span className="font-bold text-black text-base pr-6">{question}</span>
        <span
          className="text-[#9ad2e6] text-2xl leading-none flex-shrink-0 transition-transform duration-200"
          style={{transform: open ? 'rotate(45deg)' : 'rotate(0deg)'}}
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-6 text-gray-600 leading-relaxed text-sm pr-10">{answer}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white px-6 md:px-14 py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#5db6d6] text-xs font-bold tracking-[0.3em] uppercase mb-4">Got questions</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Common Questions</h1>
        </div>
        <div className="w-full">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}
