import {Await} from 'react-router';
import {Suspense, useEffect, useState} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderSearch, CATEGORY_LINKS} from '~/components/Header';
import {LocaleNavLink} from '~/components/LocaleLink';
import {CartMain} from '~/components/CartMain';
import {UrgencyPopup} from '~/components/UrgencyPopup';
import {CountrySelector} from '~/components/CountrySelector';
import {useLocale} from '~/components/LocaleLink';
import type {LocaleDetectionResult} from '~/lib/locale-detection';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
  localeDetection?: LocaleDetectionResult;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  localeDetection,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <UrgencyPopup />
      <CartAside cart={cart} />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      <div className="flex flex-col min-h-screen bg-white relative">
        {header && (
          <>
            <Header
              header={header}
              cart={cart}
              isLoggedIn={isLoggedIn}
              publicStoreDomain={publicStoreDomain}
              localeDetection={localeDetection}
            />
            <HeaderSpacer />
          </>
        )}
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      </div>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function HeaderSpacer() {
  const [height, setHeight] = useState(120); // Start with estimated height to prevent layout shift

  useEffect(() => {
    // Function to update height
    const updateHeight = () => {
      const header = document.getElementById('main-header');
      if (header) {
        // Use getBoundingClientRect for more accurate measurement
        const rect = header.getBoundingClientRect();
        const measuredHeight = rect.height || header.offsetHeight;
        if (measuredHeight > 0) {
          setHeight(measuredHeight);
        }
      }
    };

    // Use multiple strategies to catch the header at different render stages
    const updateWithRAF = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(updateHeight);
      });
    };

    // Initial measurements at different intervals
    updateWithRAF();
    const timeout1 = setTimeout(updateHeight, 0);
    const timeout2 = setTimeout(updateHeight, 50);
    const timeout3 = setTimeout(updateHeight, 200);
    const timeout4 = setTimeout(updateHeight, 500);

    // Find the header element for ResizeObserver
    const header = document.getElementById('main-header');
    if (header) {
      // Watch for resize (including when locale banner appears/disappears)
      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(header);

      // Also listen to window resize and scroll (in case header changes)
      window.addEventListener('resize', updateHeight);
      window.addEventListener('scroll', updateHeight, { passive: true });

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearTimeout(timeout4);
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateHeight);
        window.removeEventListener('scroll', updateHeight);
      };
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, []);

  return <div style={{ height: `${height}px` }} aria-hidden="true" />;
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  const currentLocale = useLocale();
  
  return (
    <Aside type="mobile" heading="MENU">
      <div className="flex flex-col gap-6">
        {/* Search Bar - Mobile only, at the top */}
        <div className="pb-4 border-b border-gray-800">
          <HeaderSearch className="!flex-none !mx-0 w-full" />
        </div>
        {/* Country/Language Selector - Mobile only */}
        {currentLocale && (
          <div className="border-b border-gray-800 pb-6">
            <CountrySelector currentLocale={currentLocale} />
          </div>
        )}
        {/* Real store categories — same list shown in the desktop nav bar */}
        <nav className="flex flex-col gap-1">
          {CATEGORY_LINKS.map(([label, to]) => (
            <LocaleNavLink
              key={to}
              to={to}
              className="text-black py-3 text-sm font-bold tracking-wide uppercase border-b border-gray-100 hover:text-[#9ad2e6] transition-colors"
            >
              {label}
            </LocaleNavLink>
          ))}
        </nav>
      </div>
    </Aside>
  );
}
