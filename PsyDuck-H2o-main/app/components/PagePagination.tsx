import {useSearchParams, useLocation} from 'react-router';
import {LocaleLink} from '~/components/LocaleLink';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

interface PagePaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  nextCursor?: string;
  prevCursor?: string;
}

export function PagePagination({
  hasNextPage,
  hasPreviousPage,
  currentPage,
  totalPages,
  baseUrl,
  nextCursor,
  prevCursor,
}: PagePaginationProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Build URL with page parameter and cursor
  const buildPageUrl = (page: number, cursor?: string, direction: 'next' | 'prev' = 'next') => {
    const params = new URLSearchParams(searchParams);
    
    if (page === 1 && !cursor) {
      // First page - remove all pagination params
      params.delete('page');
      params.delete('cursor');
    } else {
      params.set('page', page.toString());
      if (cursor) {
        params.set('cursor', cursor);
      } else {
        params.delete('cursor');
      }
    }
    
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  if (totalPages <= 1 && !hasNextPage && !hasPreviousPage) {
    return null;
  }

  return (
    <nav className="flex justify-center items-center gap-2 mt-8" aria-label="Pagination">
      {/* Previous Button */}
      <LocaleLink
        to={buildPageUrl(currentPage - 1, currentPage === 2 ? undefined : prevCursor, 'prev')}
        prefetch="intent"
        className={cn(
          "px-4 py-2 border-2 border-black rounded-none font-semibold transition-colors",
          !hasPreviousPage
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "hover:bg-white hover:text-black"
        )}
        aria-disabled={!hasPreviousPage}
      >
        Previous
      </LocaleLink>

      {/* Current Page Display */}
      <div className="px-4 py-2 text-sm font-semibold">
        Page {currentPage}
        {hasNextPage && ` of ${totalPages}+`}
      </div>

      {/* Next Button */}
      <LocaleLink
        to={buildPageUrl(currentPage + 1, nextCursor, 'next')}
        prefetch="intent"
        className={cn(
          "px-4 py-2 border-2 border-black rounded-none font-semibold transition-colors",
          !hasNextPage
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "hover:bg-white hover:text-black"
        )}
        aria-disabled={!hasNextPage}
      >
        Next
      </LocaleLink>
    </nav>
  );
}

