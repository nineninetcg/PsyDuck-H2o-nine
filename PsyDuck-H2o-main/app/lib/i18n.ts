import type {I18nBase} from '@shopify/hydrogen';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
  label?: string;
}

/**
 * Default locale configuration
 * Update these values to match your store's primary market
 */
export const DEFAULT_LOCALE: I18nLocale = {
  language: 'EN',
  country: 'MY',
  pathPrefix: '',
  label: 'Malaysia',
};

/**
 * Supported locales configuration
 * Markets configured in Shopify Admin (Settings → Markets):
 * - "Malaysia & Singapore" market (MY, SG) — ships, priced in MYR
 * - "US, UK & Canada" market (US, GB, CA) — ships, priced in MYR (no local
 *   currency conversion yet, the current payment gateway doesn't support it)
 * ⚠️ Only list countries that are actually in a configured Shopify Market and
 * have an active shipping zone, otherwise checkout will break for them.
 */
export const SUPPORTED_LOCALES: I18nLocale[] = [
  {language: 'EN', country: 'MY', pathPrefix: '', label: 'Malaysia'},
  {language: 'EN', country: 'SG', pathPrefix: '/en-sg', label: 'Singapore'},
  {language: 'EN', country: 'US', pathPrefix: '/en-us', label: 'United States'},
  {language: 'EN', country: 'GB', pathPrefix: '/en-gb', label: 'United Kingdom'},
  {language: 'EN', country: 'CA', pathPrefix: '/en-ca', label: 'Canada'},
];

/**
 * Get locale from request URL path
 * Extracts locale from URL path (e.g., /en-ca/products -> {language: 'EN', country: 'CA'})
 */
export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

  type I18nFromUrl = [I18nLocale['language'], I18nLocale['country']];

  let pathPrefix = '';
  let [language, country]: I18nFromUrl = [
    DEFAULT_LOCALE.language,
    DEFAULT_LOCALE.country,
  ];

  // Check if first path part matches locale pattern (e.g., 'en-ca', 'fr-ca')
  if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
    const localeString = firstPathPart.toLowerCase();
    const foundLocale = SUPPORTED_LOCALES.find(
      (locale) => locale.pathPrefix === `/${localeString}`,
    );

    if (foundLocale) {
      return foundLocale;
    }

    // If locale format is valid but not in supported list, parse it anyway
    pathPrefix = '/' + localeString;
    [language, country] = firstPathPart.split('-') as I18nFromUrl;
    
    return {language, country, pathPrefix};
  }

  return DEFAULT_LOCALE;
}

/**
 * Check if a locale is the default locale
 */
export function isDefaultLocale(locale: I18nLocale): boolean {
  return (
    locale.language === DEFAULT_LOCALE.language &&
    locale.country === DEFAULT_LOCALE.country
  );
}

/**
 * Get locale path prefix for a given locale
 * Returns empty string for default locale, otherwise returns '/language-country'
 */
export function getLocalePathPrefix(locale: I18nLocale): string {
  return isDefaultLocale(locale) ? '' : locale.pathPrefix;
}

/**
 * Build a path with locale prefix
 * @param path - The path to prefix (e.g., '/products/snowboard')
 * @param locale - The locale to use for the prefix
 * @returns The path with locale prefix (e.g., '/en-ca/products/snowboard')
 */
export function getLocalizedPath(path: string, locale: I18nLocale): string {
  const pathPrefix = getLocalePathPrefix(locale);
  
  // Normalize the path
  let cleanPath = path.trim();
  
  // Remove leading slash from path if present
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  
  // Remove trailing slash if present (unless path becomes empty)
  if (cleanPath.endsWith('/') && cleanPath.length > 1) {
    cleanPath = cleanPath.slice(0, -1);
  }
  
  // If no prefix (default locale), return path as-is
  if (!pathPrefix) {
    return cleanPath ? '/' + cleanPath : '/';
  }
  
  // Return path with prefix  
  if (!cleanPath || cleanPath === '/') {
    // For root locale path, React Router v7 requires a trailing slash for index routes
    // The index route pattern ($locale)._index matches /ko-kr/ but not /ko-kr
    // Adding trailing slash ensures proper route matching
    return `${pathPrefix}/`;
  }
  
  return `${pathPrefix}/${cleanPath}`;
}

/**
 * Parse locale from a locale string (e.g., 'en-ca' -> {language: 'EN', country: 'CA'})
 */
export function parseLocale(localeString: string): I18nLocale | null {
  const normalized = localeString.toLowerCase();
  return (
    SUPPORTED_LOCALES.find((locale) => locale.pathPrefix === `/${normalized}`) ||
    null
  );
}

/**
 * Get the locale string (e.g., 'en-ca') from a locale object
 */
export function getLocaleString(locale: I18nLocale): string {
  return `${locale.language}-${locale.country}`.toLowerCase();
}

/**
 * Get locale from cookies (for locale detection)
 * Cookie name: 'preferredLocale'
 */
export function getLocaleFromCookie(request: Request): I18nLocale | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const localeCookie = cookies.find((c) => c.startsWith('preferredLocale='));
  
  if (!localeCookie) return null;
  
  const localeString = localeCookie.split('=')[1];
  return parseLocale(localeString);
}

/**
 * Get locale from Accept-Language header (for locale detection)
 */
export function getLocaleFromHeaders(request: Request): I18nLocale | null {
  const acceptLanguage = request.headers.get('Accept-Language');
  if (!acceptLanguage) return null;

  // Parse Accept-Language header (e.g., 'en-CA,en;q=0.9,fr;q=0.8')
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.split('=')[1] || '1');
      return {locale: locale.toLowerCase(), quality};
    })
    .sort((a, b) => b.quality - a.quality);

  // Try to find a matching supported locale
  for (const {locale} of languages) {
    const [lang, country] = locale.split('-');
    
    // Try exact match first
    const exactMatch = SUPPORTED_LOCALES.find(
      (l) =>
        l.language.toLowerCase() === lang &&
        (country ? l.country.toLowerCase() === country : true),
    );
    
    if (exactMatch) return exactMatch;
  }

  return null;
}
