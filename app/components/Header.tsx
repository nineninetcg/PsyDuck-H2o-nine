import {Suspense, useId, useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {Await, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
  Image,
  Money,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {SearchFormPredictive, SEARCH_ENDPOINT} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {motion, AnimatePresence} from 'framer-motion';
import {cn} from '@/lib/utils';
import {CountrySelector} from '~/components/CountrySelector';
import {useLocale, LocaleNavLink, LocaleLink} from '~/components/LocaleLink';
import {getLocalizedPath} from '~/lib/i18n';
import {processMenuUrl} from '~/lib/menu-utils';
import {LocaleSuggestionBanner} from '~/components/LocaleSuggestionBanner';
import type {LocaleDetectionResult} from '~/lib/locale-detection';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  localeDetection?: LocaleDetectionResult;
}

type Viewport = 'desktop' | 'mobile';

export const CATEGORY_LINKS: Array<[string, string]> = [
  ['HOME', '/'],
  ['PREORDERS', '/collections/preorders'],
  ['30TH CELEBRATION', '/collections/30th-celebration'],
  ['DELTA REIGN', '/collections/delta-reign'],
  ['ELITE TRAINER BOXES', '/collections/elite-trainer-boxes'],
  ['BOOSTER BOXES', '/collections/booster-boxes'],
  ['BOOSTER BUNDLES', '/collections/booster-bundles'],
  ['BLISTERS & TINS', '/collections/blisters-tins'],
  ['ABOUT US', '/about-us'],
  ['AFFILIATES', '/affiliates'],
];

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  localeDetection,
}: HeaderProps) {
  const {shop, menu} = header;
  const locale = useLocale();
  
  // Use regular anchor tag to bypass React Router's prefetch mechanism
  // This prevents the spam of .data requests when clicking the logo
  // Safely construct home path - ensure it's just locale prefix + /
  const homePath = locale?.pathPrefix ? `${locale.pathPrefix}/` : '/';
  
  return (
    <header id="main-header" className="fixed top-0 left-0 right-0 z-50 bg-white text-black w-full">
      {/* Main Navigation Row - Logo, Search, Actions */}
      <div className="flex items-center gap-5 px-4 md:px-8 py-4 bg-black text-white w-full">
        <a
          href={homePath}
          className="flex-shrink-0 flex items-center gap-2.5 group"
          aria-label="Sassypsyduck — Home"
        >
          <img src="/sassy-logo-512.png" alt="Sassypsyduck" width={44} height={44} style={{width: 44, height: 44, display: "block"}} />
          <span className="hidden lg:block font-black tracking-tight text-xl text-white">SASSYPSYDUCK</span>
        </a>
        <div className="hidden md:flex flex-1 items-stretch max-w-3xl mx-auto rounded-none overflow-hidden bg-white">
          <span className="hidden lg:flex items-center gap-2 bg-[#9ad2e6] text-black text-xs font-black tracking-widest uppercase px-5 whitespace-nowrap">
            All Products
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
          <div className="flex-1 relative">
            <HeaderSearch />
          </div>
        </div>
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>

      {/* Category Nav Row */}
      <div className="hidden md:flex w-full justify-center gap-8 px-8 py-3 bg-[#111111] border-t border-white/10 relative">
        {CATEGORY_LINKS.map(([label, to]) => (
          <LocaleNavLink
            key={to}
            to={to}
            className="text-[13px] font-bold tracking-[0.08em] text-white hover:text-[#9ad2e6] transition-colors whitespace-nowrap"
          >
            {label}
          </LocaleNavLink>
        ))}
      </div>

    </header>
  );
}


/* Trustpilot-style badge — fill in TRUSTPILOT when the real profile has reviews */
const TRUSTPILOT = {url: '', score: 0, count: 0};
function TrustpilotBadge() {
  if (!TRUSTPILOT.count) return <span />;
  return (
    <a href={TRUSTPILOT.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#00b67a"><path d="M12 0l2.936 9.036H24l-7.68 5.58 2.934 9.033L12 18.07l-7.254 5.58 2.934-9.034L0 9.036h9.064z"/></svg>
      <span className="font-black text-xs text-white">Trustpilot</span>
      <span className="flex gap-0.5">
        {[1,2,3,4,5].map((i) => (
          <span key={i} className="w-3.5 h-3.5 flex items-center justify-center" style={{background: i <= Math.round(TRUSTPILOT.score) ? '#00b67a' : '#dcdce6'}}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff"><path d="M12 0l2.936 9.036H24l-7.68 5.58 2.934 9.033L12 18.07l-7.254 5.58 2.934-9.034L0 9.036h9.064z"/></svg>
          </span>
        ))}
      </span>
      <span className="font-bold text-xs text-white/80">{TRUSTPILOT.count.toLocaleString()} reviews</span>
    </a>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const locale = useLocale();
  
  // Use regular anchor tag to bypass React Router's prefetch mechanism
  // Safely construct home path - ensure it's just locale prefix + /
  const homePath = locale?.pathPrefix ? `${locale.pathPrefix}/` : '/';

  return (
    <nav
      className={viewport === 'desktop' ? 'flex items-center gap-10' : 'flex flex-col gap-4'}
      role="navigation"
    >
      {((menu || FALLBACK_HEADER_MENU)?.items || []).map((item) => {
        const hasNestedItems = item.items && item.items.length > 0;
        
        // Skip items without URL or nested items (only show parent if it has nested items)
        if (!hasNestedItems && !item.url) return null;

        return (
          <MenuItem
            key={item.id}
            item={item}
            viewport={viewport}
            primaryDomainUrl={primaryDomainUrl}
            publicStoreDomain={publicStoreDomain}
            onClose={close}
          />
        );
      })}
    </nav>
  );
}

type MenuItemType = NonNullable<HeaderProps['header']['menu']>['items'][number] | typeof FALLBACK_HEADER_MENU.items[number];

function MenuItem({
  item,
  viewport,
  primaryDomainUrl,
  publicStoreDomain,
  onClose,
}: {
  item: MenuItemType;
  viewport: Viewport;
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasNestedItems = item.items && item.items.length > 0;
  const locale = useLocale();

  // Process URL - strip locale prefixes and extract pathname
  const url = processMenuUrl(item.url, publicStoreDomain, primaryDomainUrl);
  
  // Check if this is a home link - use regular anchor tag to avoid prefetch spam
  const isHomeLink = url === '/' || url === '';
  const homePath = locale?.pathPrefix ? `${locale.pathPrefix}/` : '/';

  // Handle mouse enter - clear any pending close and open immediately
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (hasNestedItems) {
      setIsOpen(true);
    }
  };

  // Handle mouse leave - set delay before closing
  const handleMouseLeave = () => {
    if (hasNestedItems) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        closeTimeoutRef.current = null;
      }, 1000); // 1 second delay
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // For desktop, show dropdown on hover
  // For mobile, show accordion on click
  if (viewport === 'desktop') {
    return (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hasNestedItems ? (
          <button
            className={cn(
              "text-black hover:text-[#9ad2e6] cursor-pointer flex items-center gap-1 transition-colors text-[15px] font-bold tracking-wide uppercase",
              isOpen && "text-gray-300"
            )}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            {item.title}
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                isOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        ) : isHomeLink ? (
          <a
            href={homePath}
            className={cn(
              "text-black hover:text-[#9ad2e6] cursor-pointer transition-colors text-[15px] font-bold tracking-wide uppercase"
            )}
          >
            {item.title}
          </a>
        ) : (
          <LocaleNavLink
            className={({isActive}) =>
              cn(
                "text-black hover:text-[#9ad2e6] cursor-pointer transition-colors text-[15px] font-bold tracking-wide uppercase",
                isActive && "font-semibold"
              )
            }
            end
            prefetch="intent"
            to={url}
          >
            {item.title}
          </LocaleNavLink>
        )}

        {hasNestedItems && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 bg-white border-2 border-black rounded-none shadow-xl z-50 min-w-[200px] py-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {item.items?.map((childItem: NonNullable<MenuItemType['items']>[number]) => {
              const childUrl = processMenuUrl(
                childItem.url,
                publicStoreDomain,
                primaryDomainUrl,
              );

              if (!childItem.url) return null;

              return (
                <LocaleNavLink
                  key={childItem.id}
                  to={childUrl}
                  prefetch="intent"
                  className="block px-4 py-2 text-black hover:bg-black/10 transition-colors"
                  onClick={onClose}
                >
                  {childItem.title}
                </LocaleNavLink>
              );
            })}
          </motion.div>
        )}
      </div>
    );
  }

  // Mobile: Accordion style
  return (
    <div className="flex flex-col">
      {hasNestedItems ? (
        <>
          <button
            className="flex items-center justify-between text-black hover:text-gray-300 py-2 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            <span>{item.title}</span>
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                isOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pl-4 flex flex-col gap-2 py-2">
                  {item.items?.map((childItem: NonNullable<MenuItemType['items']>[number]) => {
                    const childUrl = processMenuUrl(
                      childItem.url,
                      publicStoreDomain,
                      primaryDomainUrl,
                    );

                    if (!childItem.url) return null;

                    return (
                      <LocaleNavLink
                        key={childItem.id}
                        to={childUrl}
                        prefetch="intent"
                        className="text-black/80 hover:text-black py-1 transition-colors"
                        onClick={onClose}
                      >
                        {childItem.title}
                      </LocaleNavLink>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : isHomeLink ? (
        <a
          href={homePath}
          onClick={onClose}
          className="text-black hover:text-gray-300 py-2 transition-colors"
        >
          {item.title}
        </a>
      ) : (
        <LocaleNavLink
          className={({isActive}) =>
            cn(
              "text-black hover:text-gray-300 py-2 transition-colors",
              isActive && "font-semibold"
            )
          }
          end
          onClick={onClose}
          prefetch="intent"
          to={url}
        >
          {item.title}
        </LocaleNavLink>
      )}
    </div>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const currentLocale = useLocale();
  
  return (
    <nav className="flex items-center gap-2 ml-auto pr-4" role="navigation">
      {/* Country/Language Selector - Hidden on mobile, shown in hamburger menu */}

      <LocaleNavLink prefetch="intent" to="/account" className="hidden lg:flex items-center gap-2.5 text-white group p-2">
        <span className="w-9 h-9 rounded-none bg-white/10 border border-white/15 flex items-center justify-center group-hover:border-[#9ad2e6] group-hover:bg-[#9ad2e6]/10 transition-colors">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </span>
        <span className="text-xs leading-tight text-white/70 group-hover:text-[#9ad2e6] transition-colors">Register<br /><span className="font-bold text-white group-hover:text-[#9ad2e6]">or Log in</span></span>
      </LocaleNavLink>
      <LocaleNavLink prefetch="intent" to="/account" className="lg:hidden text-white hover:text-[#9ad2e6] p-2">
        <Suspense fallback={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }>
          <Await resolve={isLoggedIn} errorElement={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }>
            {(isLoggedIn) => (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label={isLoggedIn ? 'Account' : 'Sign in'}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </Await>
        </Suspense>
      </LocaleNavLink>
      <CartToggle cart={cart} />
      <HeaderMenuMobileToggle />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="md:hidden text-white hover:text-[#9ad2e6] p-2 flex items-center justify-center"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

export function HeaderSearch({className}: {className?: string} = {}) {
  const queriesDatalistId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skeletonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const debounceTimeout = debounceTimeoutRef.current;
    const blurTimeout = blurTimeoutRef.current;
    const skeletonTimeout = skeletonTimeoutRef.current;
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
      if (skeletonTimeout) {
        clearTimeout(skeletonTimeout);
      }
    };
  }, []);

  const closeDropdown = () => {
    setIsFocused(false);
    // Delay closing to allow exit animation
    setTimeout(() => {
      setShowResults(false);
    }, 300);
  };

  return (
    <div className={cn("flex-1 relative mx-4", className)}>
      <SearchFormPredictive>
        {({inputRef, fetchResults, goToSearch}) => {
          // Debounced fetch function with longer delay
          const debouncedFetch = (value: string) => {
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            
            debounceTimeoutRef.current = setTimeout(() => {
              if (value.trim()) {
                fetchResults({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
                setShowResults(true);
              } else {
                // Empty search - animate out then close
                setShowResults(false);
              }
            }, 600);
          };

          return (
            <>
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="search"
                  placeholder="Search products..."
                  className="w-full bg-white text-black pr-12 border-0 rounded-none h-11 focus:outline-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-cancel-button]:appearance-none"
                  style={{ textDecoration: 'none', WebkitAppearance: 'none' }}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    
                    // Debounce the API call
                    debouncedFetch(value);
                    
                    // Immediately update UI state (for instant feedback)
                    if (value.trim()) {
                      setShowResults(true);
                    } else {
                      // Empty - trigger exit animation
                      setShowResults(false);
                    }
                  }}
                  onFocus={() => {
                    setIsFocused(true);
                    if (searchValue.trim()) {
                      setShowResults(true);
                    }
                  }}
                  onBlur={(e) => {
                    // Delay blur to allow clicking on results
                    if (blurTimeoutRef.current) {
                      clearTimeout(blurTimeoutRef.current);
                    }
                    blurTimeoutRef.current = setTimeout(() => {
                      setIsFocused(false);
                      // Allow exit animation to complete
                      setTimeout(() => {
                        setShowResults(false);
                      }, 300);
                    }, 300);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      goToSearch();
                      setIsFocused(false);
                      setShowResults(false);
                    }
                  }}
                  list={queriesDatalistId}
                />
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    goToSearch();
                    setIsFocused(false);
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black/80 transition-colors"
                  aria-label="Search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
              <AnimatePresence>
                {isFocused && showResults && (
                <SearchResultsPredictive>
                  {({items, total, term, state}) => (
                    <SearchResultsDropdownContent
                      items={items}
                      total={total}
                      term={term}
                      state={state}
                      showSkeleton={showSkeleton}
                      setShowSkeleton={setShowSkeleton}
                      skeletonTimeoutRef={skeletonTimeoutRef}
                      closeDropdown={closeDropdown}
                    />
                  )}
                </SearchResultsPredictive>
                )}
            </AnimatePresence>
          </>
          );
        }}
      </SearchFormPredictive>
    </div>
  );
}

// Extracted component to fix useEffect in callback
interface SearchResultsDropdownContentProps {
  items: {
    articles: any[];
    collections: any[];
    pages: any[];
    products: any[];
    queries: any[];
  };
  total: number;
  term: { current: string };
  state: string;
  showSkeleton: boolean;
  setShowSkeleton: (show: boolean) => void;
  skeletonTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  closeDropdown: () => void;
}

function SearchResultsDropdownContent({
  items,
  total,
  term,
  state,
  showSkeleton,
  setShowSkeleton,
  skeletonTimeoutRef,
  closeDropdown,
}: SearchResultsDropdownContentProps) {
  const {articles, collections, pages, products} = items;
  const isLoading = state === 'loading';
  const hasSearchTerm = !!term.current;

  // Delay showing skeleton to avoid flash on fast responses
  useEffect(() => {
    if (isLoading && hasSearchTerm) {
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
      }
      skeletonTimeoutRef.current = setTimeout(() => {
        setShowSkeleton(true);
      }, 200);
    } else {
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
      }
      setShowSkeleton(false);
    }
  }, [isLoading, hasSearchTerm, setShowSkeleton, skeletonTimeoutRef]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-none shadow-xl z-50 overflow-hidden"
      style={{ maxHeight: '480px' }}
    >
      <div 
        className="overflow-y-auto relative"
        style={{ maxHeight: '480px' }}
      >
        <AnimatePresence mode="wait">
          {/* Show skeletons when loading (with delay to avoid flash) */}
          {showSkeleton && hasSearchTerm ? (
            <motion.div
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-2"
            >
              <div className="px-4 py-3">
                <Skeleton className="h-3 w-16 mb-3" />
                {[1, 2, 3].map((i) => (
                  <div key={`skeleton-${i}`} className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-12 h-12 rounded-none flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : !total && hasSearchTerm && !isLoading ? (
            /* No results */
            <motion.div 
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-8 px-4 text-center"
            >
              <p className="text-sm text-gray-500">No results found for <q className="font-semibold">{term.current}</q></p>
            </motion.div>
          ) : total && hasSearchTerm && !isLoading ? (
            /* Results */
            <motion.div 
              key={`results-${term.current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="py-2"
            >
              {products.length > 0 && (
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Products</h3>
                  <div className="space-y-1">
                    {products.map((product) => {
                      const productUrl = `/products/${product.handle}`;
                      const price = product?.selectedOrFirstAvailableVariant?.price;
                      const image = product?.selectedOrFirstAvailableVariant?.image;
                      return (
                        <LocaleLink
                          key={product.id}
                          to={productUrl}
                          onClick={closeDropdown}
                          className="flex items-center gap-3 px-2 py-2 rounded-none hover:bg-gray-50 transition-colors group"
                        >
                          {image && (
                            <div className="flex-shrink-0 w-12 h-12 rounded-none overflow-hidden bg-gray-100">
                              <Image
                                alt={image.altText ?? ''}
                                src={image.url}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-black truncate">
                              {product.title}
                            </p>
                            {price && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                <Money data={price} />
                              </p>
                            )}
                          </div>
                        </LocaleLink>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {collections.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Collections</h3>
                  <div className="space-y-1">
                    {collections.map((collection) => {
                      const collectionUrl = `/collections/${collection.handle}`;
                      return (
                        <LocaleLink
                          key={collection.id}
                          to={collectionUrl}
                          onClick={closeDropdown}
                          className="flex items-center gap-3 px-2 py-2 rounded-none hover:bg-gray-50 transition-colors group"
                        >
                          {collection.image?.url && (
                            <div className="flex-shrink-0 w-12 h-12 rounded-none overflow-hidden bg-gray-100">
                              <Image
                                alt={collection.image.altText ?? ''}
                                src={collection.image.url}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <p className="text-sm font-medium text-gray-900 group-hover:text-black">
                            {collection.title}
                          </p>
                        </LocaleLink>
                      );
                    })}
                  </div>
                </div>
              )}

              {pages.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pages</h3>
                  <div className="space-y-1">
                    {pages.map((page) => {
                      const pageUrl = `/pages/${page.handle}`;
                      return (
                        <LocaleLink
                          key={page.id}
                          to={pageUrl}
                          onClick={closeDropdown}
                          className="block px-2 py-2 rounded-none hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900 hover:text-black"
                        >
                          {page.title}
                        </LocaleLink>
                      );
                    })}
                  </div>
                </div>
              )}

              {articles.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Articles</h3>
                  <div className="space-y-1">
                    {articles.map((article) => {
                      const articleUrl = `/blogs/${article.blog.handle}/${article.handle}`;
                      return (
                        <LocaleLink
                          key={article.id}
                          to={articleUrl}
                          onClick={closeDropdown}
                          className="flex items-center gap-3 px-2 py-2 rounded-none hover:bg-gray-50 transition-colors group"
                        >
                          {article.image?.url && (
                            <div className="flex-shrink-0 w-12 h-12 rounded-none overflow-hidden bg-gray-100">
                              <Image
                                alt={article.image.altText ?? ''}
                                src={article.image.url}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <p className="text-sm font-medium text-gray-900 group-hover:text-black">
                            {article.title}
                          </p>
                        </LocaleLink>
                      );
                    })}
                  </div>
                </div>
              )}

              {term.current && total ? (
                <div className="border-t border-gray-200 mt-2">
                  <LocaleLink
                    onClick={closeDropdown}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    className="block text-center py-3 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    View all results for <q className="font-semibold">{term.current}</q> →
                  </LocaleLink>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="text-white cursor-pointer relative p-2 flex items-center gap-2.5 group"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      aria-label="Shopping bag"
    >
      <span className="relative w-9 h-9 flex items-center justify-center group-hover:text-[#9ad2e6] transition-colors">
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="19" cy="21" r="1.5" fill="currentColor" stroke="none" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 2.5h3l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 7H6" />
        </svg>
        {count !== null && count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#9ad2e6] text-black text-[10px] font-bold rounded-none w-4.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center">
            {count}
          </span>
        )}
      </span>
      <span className="hidden lg:block text-xs leading-tight text-white/70 group-hover:text-[#9ad2e6] transition-colors">Cart<br /><span className="font-bold text-white group-hover:text-[#9ad2e6]">{count ?? 0} items</span></span>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
