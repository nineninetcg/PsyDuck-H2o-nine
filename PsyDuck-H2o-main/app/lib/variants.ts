import type {SelectedOption} from '@shopify/hydrogen/storefront-api-types';
import {useMemo} from 'react';

export function useVariantUrl(
  handle: string,
  selectedOptions?: SelectedOption[],
) {
  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname: '', // Not used anymore, but kept for function signature compatibility
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions]);
}

export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}: {
  handle: string;
  pathname: string;
  searchParams: URLSearchParams;
  selectedOptions?: SelectedOption[];
}) {
  // Always return path without locale prefix - LocaleLink will handle localization
  const path = `/products/${handle}`;

  selectedOptions?.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}
