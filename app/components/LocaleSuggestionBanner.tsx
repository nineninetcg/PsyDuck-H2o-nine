import {useState} from 'react';
import {useLocation} from 'react-router';
import {getLocalizedPath, type I18nLocale} from '~/lib/i18n';
import {Button} from '@/components/ui/button';

interface LocaleSuggestionBannerProps {
  currentLocale: I18nLocale;
  suggestedLocale: I18nLocale;
  message?: string;
}

/**
 * LocaleSuggestionBanner Component
 * 
 * Displays a banner at the top of the page suggesting a locale change
 * based on detected user preferences (cookies, Accept-Language header).
 * 
 * This follows Shopify's recommendation to suggest rather than
 * automatically redirect users to a different locale.
 * 
 * Note: Uses full page reload (window.location.href) instead of client-side
 * navigation to ensure the server reinitializes with the new locale context.
 * 
 * Usage in root.tsx or layout:
 * ```tsx
 * {shouldSuggestLocaleChange && suggestedLocale && (
 *   <LocaleSuggestionBanner
 *     currentLocale={currentLocale}
 *     suggestedLocale={suggestedLocale}
 *   />
 * )}
 * ```
 */
export function LocaleSuggestionBanner({
  currentLocale,
  suggestedLocale,
  message,
}: LocaleSuggestionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  if (dismissed) return null;

  const handleAccept = () => {
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
    const newPath = getLocalizedPath(pathname, suggestedLocale);
    
    // Set a cookie to remember user's preference
    document.cookie = `preferredLocale=${suggestedLocale.language}-${suggestedLocale.country}`.toLowerCase() + '; path=/; max-age=31536000';
    
    // Use full page reload instead of client-side navigation
    // This ensures the server reinitializes with the new locale context
    window.location.href = newPath + location.search;
  };

  const handleDismiss = () => {
    // Remember dismissal for this session
    sessionStorage.setItem('localeSuggestionDismissed', 'true');
    setDismissed(true);
  };

  // Check if user already dismissed this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('localeSuggestionDismissed')) {
    return null;
  }

  const defaultMessage = `We noticed you might prefer shopping in ${suggestedLocale.label}. Would you like to switch?`;

  return (
    <div className="bg-white text-black py-3 px-4 border-b border-[#9ad2e6]/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <GlobeIcon className="h-5 w-5 flex-shrink-0 text-[#9ad2e6]" />
          <p className="text-sm sm:text-base text-gray-200">
            {message || defaultMessage}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleAccept}
            variant="secondary"
            size="sm"
            className="bg-[#9ad2e6] text-black font-bold hover:bg-[#00c460] border-0"
          >
            Switch to {suggestedLocale.country}
          </Button>
          <button
            onClick={handleDismiss}
            className="text-gray-600 hover:text-black px-3 py-2 text-sm underline"
            aria-label="Dismiss locale suggestion"
          >
            No, thanks
          </button>
        </div>
      </div>
    </div>
  );
}

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

