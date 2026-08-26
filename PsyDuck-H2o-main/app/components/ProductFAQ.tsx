import {useState} from 'react';

export const SHIPPING_FAQ = {
  question: 'How are the products shipped?',
  answer:
    'Every order is bubble wrapped and padded with packing paper along the sides so nothing shifts in transit, then boxed and sealed. We film the entire packing process and email you the clip before it goes out, so you can see exactly what went into your parcel. Dispatch takes 4 days to a week depending on how busy the store is. Preorders ship within that same window once stock lands with us.',
};

export const PHYSICAL_STORE_FAQ = {
  question: 'Do you have a physical store, and can I collect in person?',
  answer:
    'Not yet. We are online only at the moment, but we are opening a physical store in late September to early October 2026. Once it opens you will be able to collect your order in person instead of having it shipped.',
};

const PRODUCT_FAQS = [
  SHIPPING_FAQ,
  PHYSICAL_STORE_FAQ,
  {
    question: 'Is this genuine product?',
    answer:
      "Yes, and this is the part we take most pride in. Every box we sell comes through the official Pokemon distribution channel for Southeast Asia, run out of Singapore, which is the same pipeline that supplies every licensed card shop in the region. It is not grey market stock, not a reprint, not something bought off a marketplace and flipped. It is factory sealed English language product that came down the proper chain, and we can point to where every unit came from. On top of that we film every order while we pack it and email you the clip before it ships, so you see exactly what went into your parcel.",
  },
  {
    question: 'Why are deposits not available?',
    answer:
      "A deposit means you pay part now and the rest later, and the shop holds your unit in between. Plenty of preorder sellers do it. We used to offer it and we have stopped, for one reason: our allocation is capped, and a deposit does not fully commit a unit. If someone puts down half and then goes quiet, that box sat reserved for weeks and somebody who actually wanted it missed out. Full payment at checkout is what locks your unit against our confirmed allocation with the distributor, cleanly, with nobody chasing balances at release. You are not losing flexibility either. You can cancel for a full refund within 3 days, and you pay by card so your bank sits between us the whole time.",
  },
  {
    question: 'What if you cannot get as much stock as you sold?',
    answer:
      'We only list what our distributor has confirmed to us in writing, so we do not oversell. If our allocation ever came in short, every affected order would be refunded automatically and in full. You would not have to ask.',
  },
  {
    question: 'Can I cancel or get a refund?',
    answer:
      'You can cancel for a full refund within 3 days of placing your order. After that your unit is locked into our allocation. The two exceptions that always apply regardless of timing are a stock shortfall on our side, or a damaged or incorrect item, both of which we refund in full.',
  },
];

function FAQItem({question, answer}: {question: string; answer: string}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-bold text-black text-[15px] md:text-base leading-snug">
          {question}
        </span>
        <span
          className="text-[#9ad2e6] text-2xl leading-none flex-shrink-0 mt-0.5 transition-transform duration-200"
          style={{transform: open ? 'rotate(45deg)' : 'rotate(0deg)'}}
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-5 text-gray-600 leading-relaxed text-sm max-w-4xl pr-0 md:pr-10">
          {answer}
        </p>
      )}
    </div>
  );
}

export function ProductFAQ() {
  return (
    <div className="mt-16 border-t border-gray-100 pt-12">
      <div className="mb-10">
        <p className="text-[#5db6d6] text-xs font-bold tracking-[0.3em] uppercase mb-3">
          Got questions
        </p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black">
          Common Questions
          <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-4">
          Shipping, packing and everything else people ask before they order
        </p>
      </div>
      <div className="w-full">
        {PRODUCT_FAQS.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}
