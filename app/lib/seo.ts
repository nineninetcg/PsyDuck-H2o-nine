/**
 * SEO utility functions for generating canonical URLs and other SEO-related helpers
 */

/**
 * Build a canonical URL from a request, stripping query parameters
 * that shouldn't be part of the canonical URL (pagination, filters, etc.)
 *
 * @param request - The incoming request
 * @param options - Configuration options
 * @returns The canonical URL string
 */
export function getCanonicalUrl(
  request: Request,
  options: {
    /** Query params to preserve in canonical URL (e.g., for product variants) */
    preserveParams?: string[];
    /** Override the path (useful for localized redirects) */
    overridePath?: string;
  } = {},
): string {
  const url = new URL(request.url);
  const {preserveParams = [], overridePath} = options;

  // Use production domain if available, otherwise use request origin
  const origin = url.origin;
  const path = overridePath ?? url.pathname;

  // Build canonical URL with only preserved params
  const canonicalUrl = new URL(path, origin);

  // Only preserve specified query params
  for (const param of preserveParams) {
    const value = url.searchParams.get(param);
    if (value) {
      canonicalUrl.searchParams.set(param, value);
    }
  }

  return canonicalUrl.toString();
}

/**
 * Strip locale prefix from a path for canonical URL generation
 * This ensures canonical URLs point to the correct locale version
 *
 * @param pathname - The URL pathname
 * @returns Path without locale prefix
 */
export function stripLocaleFromPath(pathname: string): string {
  // Match locale patterns like /en-ca, /ko-kr, /es-mx
  return pathname.replace(/^\/[a-z]{2}-[a-z]{2}/i, '') || '/';
}





