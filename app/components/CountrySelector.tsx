import {useEffect, useId, useRef, useState} from 'react';
import {useLocation} from 'react-router';
import {
  SUPPORTED_LOCALES,
  getLocalizedPath,
  type I18nLocale,
} from '~/lib/i18n';
import {cn} from '@/lib/utils';

interface CountrySelectorProps {
  currentLocale: I18nLocale;
}

/**
 * CountrySelector Component
 * 
 * Displays a button that opens a modal/sheet allowing users to select their
 * preferred country and language. When a locale is selected, the user is
 * redirected to the current page with the new locale prefix.
 * 
 * This component follows Shopify's recommendation to let users manually
 * select their locale rather than automatically redirecting them.
 * 
 * Note: Uses full page reload (window.location.href) instead of client-side
 * navigation to ensure the server reinitializes with the new locale context.
 */
export function CountrySelector({currentLocale}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  const closePanel = () => setOpen(false);

  const handleLocaleChange = (newLocale: I18nLocale) => {
    // Remove current locale prefix from pathname
    let pathname = location.pathname;
    
    // Remove the current locale prefix if it exists (must be at the start)
    if (currentLocale.pathPrefix && pathname.startsWith(currentLocale.pathPrefix)) {
      // Remove the prefix and ensure we preserve the rest of the path
      pathname = pathname.slice(currentLocale.pathPrefix.length);
    }
    
    // Ensure pathname starts with '/' for consistency
    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }
    
    // If pathname is just '/', keep it as is, otherwise remove trailing slash
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    
    // Add new locale prefix
    const newPath = getLocalizedPath(pathname, newLocale);
    
    // Set a cookie to remember user's preference
    document.cookie = `preferredLocale=${newLocale.language}-${newLocale.country}`.toLowerCase() + '; path=/; max-age=31536000'; // 1 year
    
    // Use full page reload instead of client-side navigation
    // This ensures the server reinitializes with the new locale context
    window.location.href = newPath + location.search;
  };

  return (
    <>
      <button
        className="flex items-center gap-2 text-black hover:text-gray-300 hover:bg-white/10 px-3 py-2 rounded-none transition-colors"
        aria-label="Select country and language"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <GlobeIcon className="h-5 w-5" />
        <span className="text-sm font-medium">{currentLocale.country}</span>
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[60]",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity duration-300 ease-in-out",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={closePanel}
          onKeyDown={(e) => e.key === 'Escape' && closePanel()}
          role="button"
          tabIndex={0}
          aria-label="Close region selector"
        />

        <aside
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Select your region and language"
          className={cn(
            "absolute right-0 top-0 h-full w-full sm:w-[540px] max-w-full bg-white text-black shadow-2xl border-l-2 border-black flex flex-col",
            "transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <header className="flex items-start justify-between gap-4 p-5 border-b border-black/10">
            <div>
              <h2 className="text-lg font-semibold text-black">
                Select your region and language
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose your country and preferred language for the best shopping experience.
              </p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={closePanel}
              className="text-black/60 hover:text-black w-9 h-9 rounded-none border border-black/10 flex items-center justify-center transition-colors"
              aria-label="Close country selector"
            >
              ×
            </button>
          </header>

          <div className="flex-1 overflow-y-auto pr-3">
            <div className="space-y-3 pb-6 pl-5">
              {SUPPORTED_LOCALES.map((locale) => {
                const isCurrentLocale =
                  locale.language === currentLocale.language &&
                  locale.country === currentLocale.country;

                return (
                  <button
                    key={`${locale.language}-${locale.country}`}
                    onClick={() => handleLocaleChange(locale)}
                    className={cn(
                      "w-full text-left pl-5 pr-5 py-4 rounded-none border-2 transition-all hover:shadow-md active:scale-[0.98]",
                      isCurrentLocale
                        ? "border-[#9ad2e6] bg-white text-black shadow-sm"
                        : "border-gray-200 hover:border-black hover:bg-gray-50"
                    )}
                    aria-label={`Select ${locale.label}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">
                          {getCountryFlag(locale.country)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base leading-tight mb-1">
                            {locale.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {locale.language} • {locale.country}
                          </div>
                        </div>
                      </div>
                      {isCurrentLocale && (
                        <CheckIcon className="h-6 w-6 text-[#9ad2e6] flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

// Simple globe icon
function GlobeIcon({className}: {className?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

// Get country flag emoji
function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    MY: '🇲🇾',
    SG: '🇸🇬',
    US: '🇺🇸',
    GB: '🇬🇧',
    CA: '🇨🇦',
  };
  return flags[countryCode] || '🌍';
}

// Simple check icon
function CheckIcon({className}: {className?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

