import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale)._index';
import {Suspense, useEffect, useState} from 'react';
import {getSeoMeta} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {LocaleLink} from '~/components/LocaleLink';
import {getCanonicalUrl} from '~/lib/seo';
import {motion} from 'framer-motion';

export const meta: Route.MetaFunction = ({data, matches}) => {
  return getSeoMeta(
    ...matches
      .filter((match): match is NonNullable<typeof match> => match != null)
      .map((match) => (match.data as any)?.seo)
      .filter(Boolean),
    data?.seo,
  ) ?? [];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  return {seo: {url: getCanonicalUrl(request)}};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const collections = context.storefront
    .query(HOMEPAGE_COLLECTIONS_QUERY)
    .catch(() => null);
  const allProducts = context.storefront
    .query(ALL_PRODUCTS_QUERY)
    .catch(() => null);
  return {collections, allProducts};
}

const SKY = '#9ad2e6';
const RELEASE = new Date('2026-09-16T00:00:00+08:00');

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-white">
      <HeroCarousel />
      <CategoryGrid />
      <VideoBreak />
      <DynamicCollections collections={data.collections} />
      <AllProductsGrid products={data.allProducts} />
    </div>
  );
}

/* ── COUNTDOWN ── */
function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function CountChip({v, l}: {v: number; l: string}) {
  return (
    <div className="bg-white/90 backdrop-blur border border-black/10 px-4 py-2.5 text-center min-w-[72px]">
      <div className="text-2xl md:text-3xl font-black tabular-nums leading-none">{String(v).padStart(2, '0')}</div>
      <div className="text-[10px] font-bold tracking-[0.25em] text-gray-500 mt-1">{l}</div>
    </div>
  );
}

/* ── HERO CAROUSEL — image slots: /hero-1.jpg /hero-2.jpg /hero-3.jpg in public/ ── */
const SLIDES = [
  {img: '/hero-1.jpg', to: '/collections/preorders'},
  {img: '/hero-2.jpg', to: '/collections/30th-celebration'},
  {img: '/hero-3.jpg', to: '/collections/delta-reign'},
];

function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="relative w-full overflow-hidden aspect-[1857/950] md:aspect-[1857/847]">
      {SLIDES.map((sl, idx) => (
        <LocaleLink
          key={sl.img}
          to={sl.to}
          aria-label={`Shop ${sl.to.split('/').pop()}`}
          className="absolute inset-0 block transition-opacity duration-700"
          style={{opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? 'auto' : 'none'}}
        >
          <img
            src={sl.img}
            alt=""
            className="w-full h-full object-cover"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        </LocaleLink>
      ))}
      {/* dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className="h-[3px] transition-all duration-300"
            style={{width: idx === i ? 36 : 14, background: idx === i ? '#9ad2e6' : 'rgba(255,255,255,0.6)'}}
          />
        ))}
      </div>
    </section>
  );
}

/* ── CATEGORY GRID — Ace-style photo tiles ── */
const TILES = [
  {t: 'Elite Trainer Boxes', sub: 'The collector standard', to: '/collections/elite-trainer-boxes', img: '/tile-etb.jpg'},
  {t: 'Booster Boxes', sub: '36 packs of possibility', to: '/collections/booster-boxes', img: '/tile-booster.jpg'},
  {t: 'Booster Bundles', sub: 'Six-pack chase', to: '/collections/booster-bundles', img: '/tile-bundle.jpg'},
  {t: 'Blisters & Tins', sub: 'Small boxes, big pulls', to: '/collections/blisters-tins', img: '/tile-blister.jpg'},
  {t: 'Delta Reign', sub: 'Mega Rayquaza · Nov 6', to: '/collections/delta-reign', img: '/tile-delta.jpg'},
  {t: '30th Celebration', sub: 'The anniversary set', to: '/collections/30th-celebration', img: '/tile-30th.jpg'},
];

function CategoryTile({tile, i, ratioClass}: {tile: (typeof TILES)[number]; i: number; ratioClass: string}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 16}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true}}
      transition={{duration: 0.4, delay: (i % 4) * 0.06}}
    >
      <LocaleLink to={tile.to} className="group block border border-gray-200 hover:border-black hover:relative hover:z-10 transition-colors bg-white">
        <div
          className={`overflow-hidden relative bg-white ${ratioClass}`}
        >
          <div
            className="absolute inset-0 group-hover:scale-[1.04] transition-transform duration-500"
            style={{backgroundImage: `url(${tile.img})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
          />
        </div>
        <div className="px-4 py-3.5 border-t border-gray-200 flex items-center justify-between">
          <div>
            <p className="font-black text-[15px] tracking-tight">{tile.t}</p>
            <p className="text-[11px] text-gray-500 font-medium">{tile.sub}</p>
          </div>
          <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all font-black">→</span>
        </div>
      </LocaleLink>
    </motion.div>
  );
}

function CategoryGrid() {
  const topRow = TILES.slice(0, 4);
  const bottomRow = TILES.slice(4);
  return (
    <section className="w-full py-16 bg-white">
      <p className="text-center text-gray-500 text-sm mb-10">Explore sealed Pokémon TCG, preorders and collector sets</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
        {topRow.map((tile, i) => (
          <CategoryTile key={tile.to + tile.t} tile={tile} i={i} ratioClass="aspect-[4/3]" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
        {bottomRow.map((tile, i) => (
          <CategoryTile key={tile.to + tile.t} tile={tile} i={i} ratioClass="aspect-[16/11] sm:aspect-[16/9]" />
        ))}
      </div>
    </section>
  );
}

/* ── VIDEO BREAK — full-width muted loop ── */
function VideoBreak() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <section className="w-full bg-black overflow-hidden relative" style={{aspectRatio: '16/6.5'}}>
      <iframe
        className="absolute pointer-events-none"
        style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '56.25vw', minHeight: '100%', minWidth: '177.78%', border: 0}}
        src="https://www.youtube-nocookie.com/embed/05w9UVH6zoQ?autoplay=1&mute=1&loop=1&playlist=05w9UVH6zoQ&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&showinfo=0"
        title="Sassypsyduck"
        allow="autoplay; encrypted-media"
        tabIndex={-1}
        aria-hidden
      />
      {/* invisible shield — stops the cursor ever reaching the iframe/video,
          which is what triggers the browser's native hover play/pause overlay */}
      <div className="absolute inset-0 z-10" style={{cursor: 'default'}} />
      {/* opaque cover — hides the split-second YouTube shows its native
          play/pause/skip controls while the embed is still initializing */}
      <div
        className="absolute inset-0 z-20 bg-black pointer-events-none transition-opacity duration-500"
        style={{opacity: ready ? 0 : 1}}
      />
    </section>
  );
}


/* ── SECTION HEADER ── */
function SectionHeader({title, href}: {title: string; href?: string}) {
  return (
    <div className="flex items-end justify-between mb-10">
      <h2 className="text-3xl md:text-4xl font-black tracking-tight">
        {title}
        <span className="block w-12 h-1 bg-[#9ad2e6] mt-3" />
      </h2>
      {href && (
        <LocaleLink
          to={href}
          className="text-sm font-semibold text-gray-500 hover:text-[#9ad2e6] transition-colors tracking-wide"
        >
          View all &rarr;
        </LocaleLink>
      )}
    </div>
  );
}

/* ── HOME COLLECTION ONLY (full width) ── */
function DynamicCollections({collections}: {collections: Promise<any>}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={collections}>
        {(response) => {
          const home = response?.collection;
          const allProducts: any[] = home?.products?.nodes || [];
          const products = allProducts.slice(0, 4);
          if (products.length === 0) return null;
          return (
            <section className="w-full px-6 md:px-14 py-20 bg-white">
              <SectionHeader title="Shop Now" href="/collections/all" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {products.map((product: any) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        }}
      </Await>
    </Suspense>
  );
}

/* ── ALL PRODUCTS — full catalog preview ── */
function AllProductsGrid({products}: {products: Promise<any>}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={products}>
        {(response) => {
          const items: any[] = (response?.products?.nodes || []).slice(0, 4);
          if (items.length === 0) return null;
          return (
            <section className="w-full px-6 md:px-14 py-20 bg-gray-50">
              <SectionHeader title="All Products" href="/collections/all" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {items.map((product: any) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        }}
      </Await>
    </Suspense>
  );
}

/* ── GUARANTEES — icon strip, near-zero text ── */
function Guarantees() {
  const items = [
    {t: 'Capped allocation', icon: <path d="M20 6L9 17l-5-5" />},
    {t: 'Free 3-day cancellation', icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>},
    {t: 'Auto refund policy', icon: <><path d="M3 12a9 9 0 1 0 9-9"/><polyline points="3 4 3 9 8 9"/></>},
    {t: 'Insured 3-day ship', icon: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>},
  ];
  return (
    <section className="w-full border-y border-gray-100 bg-white">
      <div className="w-full px-6 md:px-14 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {items.map((it) => (
          <div key={it.t} className="flex flex-col items-center gap-3">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ad2e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {it.icon}
            </svg>
            <p className="font-bold text-sm">{it.t}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 { amount currencyCode }
  fragment ProductVariantItem on ProductVariant {
    id
    availableForSale
    compareAtPrice { amount currencyCode }
  }
  fragment ProductItem on Product {
    id handle title
    featuredImage { id altText url width height }
    priceRange { minVariantPrice { ...MoneyProductItem } maxVariantPrice { ...MoneyProductItem } }
    selectedOrFirstAvailableVariant { ...ProductVariantItem }
  }
` as const;

const ALL_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query AllHomepageProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 20, sortKey: BEST_SELLING, query: "NOT tag:freebie AND available_for_sale:true") {
      nodes { ...ProductItem }
    }
  }
` as const;

const HOMEPAGE_COLLECTIONS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query HomepageCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collection(handle: "frontpage") {
      id
      handle
      title
      products(first: 20) {
        nodes { ...ProductItem }
      }
    }
  }
` as const;
