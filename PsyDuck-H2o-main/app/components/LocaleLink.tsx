import {Link, NavLink, useMatches} from 'react-router';
import type {LinkProps, NavLinkProps} from 'react-router';
import {getLocalizedPath, SUPPORTED_LOCALES, DEFAULT_LOCALE, type I18nLocale} from '~/lib/i18n';
import type {RootLoader} from '~/root';

/**
 * Check if a path already starts with a locale prefix
 * Handles paths with query strings by checking only the pathname part
 */
function hasLocalePrefix(path: string): boolean {
  // Remove query string and hash if present
  const pathname = path.split('?')[0].split('#')[0];
  const firstPathPart = pathname.split('/')[1]?.toLowerCase() ?? '';
  return /^[a-z]{2}-[a-z]{2}$/.test(firstPathPart);
}

/**
 * LocaleLink Component
 * 
 * A wrapper around React Router's Link that automatically adds the locale prefix
 * to the path. This ensures all internal links maintain the current locale.
 * 
 * Usage:
 * <LocaleLink to="/products">Products</LocaleLink>
 * // If current locale is 'en-ca', this renders: <Link to="/en-ca/products">
 */
export function LocaleLink({to, ...props}: LinkProps) {
  const locale = useLocale();

  // Check if the URL is absolute (starts with http:// or https://) or has a protocol
  const isAbsoluteUrl = typeof to === 'string' && /^(https?:\/\/|mailto:|tel:)/.test(to);

  // If to is a string and we have a locale, add the locale prefix (unless it's an absolute URL or already has a locale prefix)
  const localizedTo =
    typeof to === 'string' && locale && !isAbsoluteUrl 
      ? hasLocalePrefix(to)
        ? to // Path already has a locale prefix, use it as-is
        : getLocalizedPath(to, locale) 
      : to;

  return <Link to={localizedTo} {...props} />;
}

/**
 * LocaleNavLink Component
 * 
 * A wrapper around React Router's NavLink that automatically adds the locale prefix
 * to the path. This ensures all navigation links maintain the current locale.
 * 
 * Usage:
 * <LocaleNavLink to="/products">Products</LocaleNavLink>
 * // If current locale is 'en-ca', this renders: <NavLink to="/en-ca/products">
 */
export function LocaleNavLink({to, ...props}: NavLinkProps) {
  const locale = useLocale();

  // Check if the URL is absolute (starts with http:// or https://) or has a protocol
  const isAbsoluteUrl = typeof to === 'string' && /^(https?:\/\/|mailto:|tel:)/.test(to);

  // If to is a string and we have a locale, add the locale prefix (unless it's an absolute URL or already has a locale prefix)
  const localizedTo =
    typeof to === 'string' && locale && !isAbsoluteUrl
      ? hasLocalePrefix(to)
        ? to // Path already has a locale prefix, use it as-is
        : getLocalizedPath(to, locale) 
      : to;

  return <NavLink to={localizedTo} {...props} />;
}

/**
 * useLocale hook
 * 
 * Returns the current locale from the root loader data
 */
export function useLocale(): I18nLocale | undefined {
  const matches = useMatches();
  const rootMatch = matches.find((match) => match.id === 'root');
  const rootData = rootMatch?.data as Awaited<ReturnType<RootLoader>> | undefined;

  // Use the currentLocale from localeDetection if available (preferred)
  if (rootData?.localeDetection?.currentLocale) {
    return rootData.localeDetection.currentLocale;
  }

  // Fallback to consent data if localeDetection is not available
  if (!rootData?.consent?.language || !rootData?.consent?.country) {
    return DEFAULT_LOCALE;
  }

  const {language, country} = rootData.consent;

  // Find the matching locale from SUPPORTED_LOCALES to get the correct pathPrefix
  // Use case-insensitive matching
  const matchedLocale = SUPPORTED_LOCALES.find(
    (locale) =>
      locale.language.toUpperCase() === language.toUpperCase() && 
      locale.country.toUpperCase() === country.toUpperCase(),
  );

  // If found, return the full locale with the correct pathPrefix
  // Otherwise, return the default locale as fallback
  return matchedLocale || DEFAULT_LOCALE;
}

