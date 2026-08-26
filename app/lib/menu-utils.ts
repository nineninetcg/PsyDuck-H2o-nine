/**
 * Menu URL utilities for processing menu links
 */

/**
 * Process menu URLs - extracts pathname from internal links,
 * strips any existing locale prefixes, and leaves external links as-is
 */
export function processMenuUrl(
  url: string | null | undefined,
  publicStoreDomain: string,
  primaryDomainUrl: string,
): string {
  if (!url) return '#';

  try {
    let pathname = url;

    // If it's a full URL, extract the pathname
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      
      // Extract domains from the Shopify URLs for comparison
      const publicDomain = publicStoreDomain.replace(/^https?:\/\//, '');
      const primaryDomain = new URL(primaryDomainUrl).hostname;
      const urlHostname = urlObj.hostname;
      
      // Check if it's an internal URL
      // Include all your store domains and common patterns
      const isInternal =
        urlHostname.includes('myshopify.com') ||
        urlHostname.includes(publicDomain) ||
        urlHostname === primaryDomain ||
        urlHostname.endsWith('sassypsyduck.co') ||
        urlHostname.includes('sassypsyduck') || // Catch any productivity pals domain
        urlHostname === 'localhost' ||
        urlHostname.startsWith('127.0.0.1');

      if (!isInternal) {
        // External URL - return as-is (LocaleNavLink will detect it's external)
        return url;
      }

      // Internal URL - extract pathname
      pathname = urlObj.pathname;
    }

    // Strip any existing locale prefix (e.g., /ko/, /es/, /ko-kr/, /es-mx/)
    // Match patterns like /xx/ or /xx-yy/ at the start (with or without trailing slash)
    // Handles: /ko-kr/ -> /, /ko-kr -> /, /ko-kr/products -> /products
    pathname = pathname.replace(/^\/([a-z]{2})(?:-[a-z]{2})?(?:\/|$)/i, '/');

    return pathname;
  } catch (error) {
    // If URL parsing fails, try to extract pathname anyway
    console.warn('Failed to parse menu URL:', url, error);
    
    // Last resort: if it looks like a sassypsyduck URL, try to extract the path
    if (url.includes('sassypsyduck')) {
      try {
        const pathMatch = url.match(/sassypsyduck\.co(\/.+)$/);
        if (pathMatch) {
          let path = pathMatch[1];
          // Strip locale prefix (with or without trailing slash)
          path = path.replace(/^\/([a-z]{2})(?:-[a-z]{2})?(?:\/|$)/i, '/');
          return path;
        }
      } catch {
        // Invalid URL format, return original
      }
    }
    
    return url;
  }
}

