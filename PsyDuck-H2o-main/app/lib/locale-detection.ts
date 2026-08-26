import {
  getLocaleFromRequest,
  getLocaleFromCookie,
  getLocaleFromHeaders,
  type I18nLocale,
} from '~/lib/i18n';

/**
 * Locale Detection Strategy
 * 
 * Determines the best locale for a user based on multiple factors:
 * 1. URL path (highest priority - explicit user choice)
 * 2. Cookie (user's saved preference)
 * 3. Accept-Language header (browser/system preference)
 * 4. Default locale (fallback)
 * 
 * Note: This returns the detected locale but DOES NOT automatically redirect.
 * Following Shopify's best practices, we only use this information to:
 * - Show a banner suggesting locale change
 * - Pre-select the user's likely locale in the country selector
 * - Provide locale hints in the UI
 * 
 * Automatic redirects are NOT recommended as they:
 * - Can confuse users and break bookmarks/shared links
 * - Hurt SEO (bots often appear to be from US)
 * - Ignore caching benefits
 */

export interface LocaleDetectionResult {
  /** The current active locale (from URL) */
  currentLocale: I18nLocale;
  /** The suggested locale based on detection (may differ from current) */
  suggestedLocale: I18nLocale | null;
  /** Whether we should show a locale suggestion banner */
  shouldSuggestLocaleChange: boolean;
  /** The source of the suggestion (cookie, header, etc.) */
  suggestionSource: 'cookie' | 'header' | 'none';
}

/**
 * Detect locale with all available methods
 * 
 * @param request - The incoming request
 * @returns LocaleDetectionResult with current and suggested locales
 */
export function detectLocale(request: Request): LocaleDetectionResult {
  // 1. Get current locale from URL (this is the active locale)
  const currentLocale = getLocaleFromRequest(request);

  // 2. Check if user has a saved preference in cookies
  const cookieLocale = getLocaleFromCookie(request);

  // 3. Check browser's Accept-Language header
  const headerLocale = getLocaleFromHeaders(request);

  // Determine suggested locale
  let suggestedLocale: I18nLocale | null = null;
  let suggestionSource: 'cookie' | 'header' | 'none' = 'none';

  // Cookie preference takes priority over header
  if (cookieLocale) {
    suggestedLocale = cookieLocale;
    suggestionSource = 'cookie';
  } else if (headerLocale) {
    suggestedLocale = headerLocale;
    suggestionSource = 'header';
  }

  // Locale suggestion banner permanently disabled
  const shouldSuggestLocaleChange = false;

  return {
    currentLocale,
    suggestedLocale: shouldSuggestLocaleChange ? suggestedLocale : null,
    shouldSuggestLocaleChange,
    suggestionSource,
  };
}

/**
 * Generate a locale suggestion message
 * 
 * @param result - The locale detection result
 * @returns A user-friendly message suggesting locale change
 */
export function getLocaleSuggestionMessage(
  result: LocaleDetectionResult,
): string | null {
  if (!result.shouldSuggestLocaleChange || !result.suggestedLocale) {
    return null;
  }

  const {suggestedLocale} = result;
  return `We noticed you might prefer shopping in ${suggestedLocale.label}. Would you like to switch?`;
}

