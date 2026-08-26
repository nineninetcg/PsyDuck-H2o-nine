import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {Button} from './ui/button';
import {useLocale} from '~/components/LocaleLink';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
}) {
  const locale = useLocale();
  const cartRoute = locale?.pathPrefix ? `${locale.pathPrefix}/cart` : '/cart';
  
  return (
    <CartForm route={cartRoute} inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        const isAdding = fetcher.state !== 'idle';
        const isDisabled = disabled ?? isAdding;

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <Button
              type="submit"
              onClick={onClick}
              disabled={isDisabled}
              variant="outline"
              size="default"
              className={className ? `w-full font-semibold ${className}` : "w-full font-semibold"}
            >
              {isAdding ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin rounded-none h-4 w-4 border-b-2 border-black/10"></span>
                  Adding...
                </span>
              ) : (
                children
              )}
            </Button>
          </>
        );
      }}
    </CartForm>
  );
}
