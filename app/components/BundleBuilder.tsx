import {useState, useMemo, useCallback} from 'react';
import {useFetcher} from 'react-router';
import {motion, AnimatePresence} from 'framer-motion';
import {VoltSVG} from '~/components/VoltSVG';

/* Types */

type Variant = {
  id: string;
  title: string;
  price: {amount: string; currencyCode: string};
};

type Product = {
  id: string;
  title: string;
  handle: string;
  featuredImage: {url: string; altText: string | null; width?: number; height?: number} | null;
  variants: {nodes: Variant[]};
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
};

type BundleBuilderProps = {
  aiTools: Product[];
  entertainment: Product[];
  editing: Product[];
};

/* Discount tiers */

const TIERS = [
  {
    min: 0,
    discount: 0,
    code: '',
    label: null,
    voltMessage: "Hey! I'm Volt. Pick your faves — the more you grab, the more you save!",
    color: 'text-gray-500',
  },
  {
    min: 1,
    discount: 0,
    code: '',
    label: null,
    voltMessage: 'Nice pick! Add one more product to unlock 5% off.',
    color: 'text-gray-500',
  },
  {
    min: 2,
    discount: 5,
    code: 'BUNDLE5',
    label: '5% OFF',
    voltMessage: 'Boom — 5% off unlocked! One more gets you to 10%!',
    color: 'text-[#9ad2e6]',
  },
  {
    min: 3,
    discount: 10,
    code: 'BUNDLE10',
    label: '10% OFF',
    voltMessage: "10% savings — you're on a roll! Add one more for 15%!",
    color: 'text-[#9ad2e6]',
  },
  {
    min: 4,
    discount: 15,
    code: 'BUNDLE15',
    label: '15% OFF',
    voltMessage: "So close to max! Add one more product for 20% off!",
    color: 'text-[#9ad2e6]',
  },
  {
    min: 5,
    discount: 20,
    code: 'BUNDLE20',
    label: '20% OFF — MAX!',
    voltMessage: "Legendary! 20% off — you've unlocked maximum savings!",
    color: 'text-[#9ad2e6]',
  },
];

function getActiveTier(count: number) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (count >= t.min) tier = t;
  }
  return tier;
}

/* Product Card */

function ProductCard({
  product,
  selected,
  onToggle,
  selectedVariantId,
  onVariantChange,
}: {
  product: Product;
  selected: boolean;
  onToggle: () => void;
  selectedVariantId: string;
  onVariantChange: (id: string) => void;
}) {
  const variants = product.variants.nodes;

  return (
    <motion.div
      layout
      whileHover={{y: -3, scale: 1.01}}
      whileTap={{scale: 0.97}}
      onClick={onToggle}
      className={`relative cursor-pointer rounded-none border-2 p-4 transition-all duration-200 select-none ${
        selected
          ? 'border-[#9ad2e6] bg-white shadow-xl shadow-[#9ad2e6]/15'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Checkmark badge */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="check"
            initial={{scale: 0, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0, opacity: 0}}
            transition={{type: 'spring', stiffness: 400, damping: 20}}
            className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-[#9ad2e6] rounded-none flex items-center justify-center z-10 shadow-lg"
          >
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-3">
        {/* Product image */}
        <div className="w-full aspect-square rounded-none overflow-hidden flex items-center justify-center bg-gray-50">
          {product.featuredImage ? (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
              No img
            </div>
          )}
        </div>

        {/* Title & price */}
        <div className="text-center w-full">
          <p
            className={`font-semibold text-sm leading-tight truncate ${
              selected ? 'text-black' : 'text-gray-900'
            }`}
          >
            {product.title}
          </p>
          <p className={`text-xs mt-0.5 ${selected ? 'text-[#9ad2e6]' : 'text-gray-600'}`}>
            from ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}/mo
          </p>
        </div>

        {/* Duration picker */}
        <select
          value={selectedVariantId}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onVariantChange(e.target.value);
          }}
          className={`w-full text-xs rounded-none px-2 py-1.5 border cursor-pointer font-medium ${
            selected
              ? 'bg-gray-900 border-gray-700 text-black'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}: ${parseFloat(v.price.amount).toFixed(2)}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}

/* Volt Speech Bubble */

function VoltBubble({message, tier}: {message: string; tier: typeof TIERS[0]}) {
  return (
    <div className="flex items-end gap-4">
      <motion.div
        key={tier.min}
        initial={{scale: 0.8, y: 10}}
        animate={{scale: 1, y: 0}}
        transition={{type: 'spring', stiffness: 300, damping: 15}}
        className="flex-shrink-0"
      >
        <VoltSVG size={64} animate={true} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{opacity: 0, x: -10, scale: 0.95}}
          animate={{opacity: 1, x: 0, scale: 1}}
          exit={{opacity: 0, x: 10, scale: 0.95}}
          transition={{duration: 0.25}}
          className="relative bg-white border-2 border-[#9ad2e6]/40 rounded-none rounded-bl-none px-4 py-3 max-w-xs shadow-lg"
        >
          <p className="text-sm text-black font-medium leading-snug">{message}</p>
          <div className="absolute -bottom-2 left-3 w-3 h-3 bg-white border-b-2 border-l-2 border-[#9ad2e6]/40 rotate-45 -translate-x-0" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* Discount Progress Bar */

function DiscountProgressBar({count}: {count: number}) {
  const steps = [
    {items: 1, label: '0%', reached: count >= 1},
    {items: 2, label: '5%', reached: count >= 2},
    {items: 3, label: '10%', reached: count >= 3},
    {items: 4, label: '15%', reached: count >= 4},
    {items: 5, label: '20%', reached: count >= 5},
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-none p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Discount Progress
      </p>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.items} className="flex items-center flex-1">
            <motion.div
              animate={{
                backgroundColor: step.reached ? '#9ad2e6' : '#e5e7eb',
                scale: count === step.items ? 1.2 : 1,
              }}
              transition={{duration: 0.3}}
              className="w-9 h-9 rounded-none flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <span
                className={`text-xs font-bold ${step.reached ? 'text-black' : 'text-gray-600'}`}
              >
                {step.label}
              </span>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                className="h-1 flex-1 rounded-none mx-1"
                animate={{
                  backgroundColor: count > step.items ? '#9ad2e6' : '#e5e7eb',
                }}
                transition={{duration: 0.3}}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-1">
        {steps.map((step) => (
          <span
            key={step.items}
            className={`text-[10px] ${step.reached ? 'text-[#9ad2e6] font-medium' : 'text-gray-600'}`}
          >
            {step.items} {step.items === 1 ? 'item' : 'items'}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Section Header — no emoji */

function SectionHeader({title}: {title: string}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

/* Main Component */

export function BundleBuilder({aiTools, entertainment, editing}: BundleBuilderProps) {
  const fetcher = useFetcher();

  const [selections, setSelections] = useState<Record<string, string>>({});

  const selectedCount = Object.values(selections).filter(Boolean).length;
  const tier = getActiveTier(selectedCount);

  const toggleProduct = useCallback(
    (product: Product) => {
      const defaultVariantId = product.variants.nodes[0]?.id ?? '';
      setSelections((prev) => {
        const current = prev[product.id];
        if (current) {
          const next = {...prev};
          delete next[product.id];
          return next;
        }
        return {...prev, [product.id]: defaultVariantId};
      });
    },
    [],
  );

  const setVariant = useCallback((productId: string, variantId: string) => {
    setSelections((prev) => ({...prev, [productId]: variantId}));
  }, []);

  const totals = useMemo(() => {
    let subtotal = 0;
    const allProducts = [...aiTools, ...entertainment, ...editing];

    for (const [productId, variantId] of Object.entries(selections)) {
      if (!variantId) continue;
      const product = allProducts.find((p) => p.id === productId);
      const variant = product?.variants.nodes.find((v) => v.id === variantId);
      if (variant) subtotal += parseFloat(variant.price.amount);
    }

    const discountAmount = subtotal * (tier.discount / 100);
    const total = subtotal - discountAmount;
    return {subtotal, discountAmount, total};
  }, [selections, tier, aiTools, entertainment, editing]);

  const isSubmitting = fetcher.state !== 'idle';

  function renderSection(products: Product[], title: string) {
    if (!products.length) return null;
    return (
      <div className="mb-8">
        <SectionHeader title={title} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selected={!!selections[product.id]}
              onToggle={() => toggleProduct(product)}
              selectedVariantId={selections[product.id] ?? product.variants.nodes[0]?.id ?? ''}
              onVariantChange={(variantId) => setVariant(product.id, variantId)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-10">

      {/* Page Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          <span className="inline-block bg-white text-[#9ad2e6] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-none mb-4">
            Build Your Bundle
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Pick your subscriptions,
            <br />
            <span className="text-[#9ad2e6]">we'll handle the savings.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Choose any 2+ products and get an automatic discount. More items = bigger savings.
            No codes needed — it applies at checkout.
          </p>
        </motion.div>
      </div>

      {/* Sticky Volt + Discount Summary */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">

        {/* Left: product sections */}
        <div>
          {renderSection(aiTools, 'AI Tools')}
          {renderSection(entertainment, 'Entertainment')}
          {renderSection(editing, 'Editing & Tools')}
        </div>

        {/* Right: sticky summary */}
        <div className="lg:sticky lg:top-24 mt-6 lg:mt-0 space-y-4">

          <VoltBubble message={tier.voltMessage} tier={tier} />
          <DiscountProgressBar count={selectedCount} />

          {/* Order summary card */}
          <div className="bg-white border-2 border-gray-100 rounded-none p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Your Bundle</h3>

            {selectedCount === 0 ? (
              <p className="text-sm text-gray-600 text-center py-6">
                No products selected yet.<br />Start picking above!
              </p>
            ) : (
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {[...aiTools, ...entertainment, ...editing]
                  .filter((p) => selections[p.id])
                  .map((p) => {
                    const variantId = selections[p.id];
                    const variant = p.variants.nodes.find((v) => v.id === variantId);
                    return (
                      <div key={p.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleProduct(p)}
                            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                            aria-label={`Remove ${p.title}`}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <span className="truncate text-gray-700">{p.title}</span>
                        </div>
                        <span className="font-medium text-gray-900 ml-2 flex-shrink-0">
                          ${parseFloat(variant?.price.amount ?? '0').toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Price breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({selectedCount} items)</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>

              <AnimatePresence>
                {tier.discount > 0 && (
                  <motion.div
                    initial={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: 'auto'}}
                    exit={{opacity: 0, height: 0}}
                    className="flex justify-between text-sm font-medium text-[#9ad2e6]"
                  >
                    <span>Bundle discount ({tier.discount}% off)</span>
                    <span>-${totals.discountAmount.toFixed(2)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between font-bold text-lg text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>

              {tier.discount > 0 && (
                <p className="text-xs text-center text-gray-600 pt-1">
                  Code <span className="font-mono font-bold text-[#9ad2e6]">{tier.code}</span> applied automatically
                </p>
              )}
            </div>

            {/* CTA */}
            <fetcher.Form method="post" className="mt-5">
              {Object.entries(selections)
                .filter(([, v]) => v)
                .map(([, variantId]) => (
                  <input key={variantId} type="hidden" name="variantId" value={variantId} />
                ))}
              {tier.code && (
                <input type="hidden" name="discountCode" value={tier.code} />
              )}

              <motion.button
                type="submit"
                disabled={selectedCount === 0 || isSubmitting}
                whileHover={selectedCount > 0 ? {scale: 1.02} : {}}
                whileTap={selectedCount > 0 ? {scale: 0.98} : {}}
                className={`w-full py-4 rounded-none font-bold text-base transition-all duration-200 ${
                  selectedCount === 0
                    ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    : 'bg-white text-[#9ad2e6] hover:bg-gray-900 shadow-lg shadow-black/10 cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{rotate: 360}}
                      transition={{duration: 0.8, repeat: Infinity, ease: 'linear'}}
                      className="inline-block w-4 h-4 border-2 border-[#9ad2e6] border-t-transparent rounded-none"
                    />
                    Building your bundle...
                  </span>
                ) : selectedCount === 0 ? (
                  'Select products to start'
                ) : (
                  <>
                    Add {selectedCount} item{selectedCount > 1 ? 's' : ''} to cart
                    {tier.discount > 0 && ` — save ${tier.discount}%`}
                  </>
                )}
              </motion.button>
            </fetcher.Form>

            {/* Trust micro-copy */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
              <span>Instant delivery</span>
              <span>Secure checkout</span>
              <span>100% working</span>
            </div>
          </div>

          {/* Tier breakdown */}
          <div className="bg-gray-50 border border-gray-100 rounded-none p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Savings Tiers
            </p>
            <div className="space-y-2">
              {[
                {items: '2 products', pct: '5% off', code: 'BUNDLE5'},
                {items: '3 products', pct: '10% off', code: 'BUNDLE10'},
                {items: '4 products', pct: '15% off', code: 'BUNDLE15'},
                {items: '5+ products', pct: '20% off', code: 'BUNDLE20'},
              ].map(({items, pct, code}) => {
                const reached = selectedCount >= parseInt(items);
                return (
                  <div key={code} className="flex justify-between items-center text-sm">
                    <span className={reached ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                      {items}
                    </span>
                    <span className={`font-bold ${reached ? 'text-[#9ad2e6]' : 'text-gray-300'}`}>
                      {pct}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
