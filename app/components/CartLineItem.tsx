import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {useLocale} from '~/components/LocaleLink';
import {Button} from './ui/button';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Trash2, Minus, Plus} from 'lucide-react';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  
  return (
    <li key={id} className="flex gap-4 py-4 border-b border-black/10">
      {image && (
        <div className="flex-shrink-0">
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            height={100}
            loading="lazy"
            width={100}
            className="rounded-none object-cover"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
            className="hover:underline text-black"
          >
            <p className="font-semibold text-base mb-1 text-black">
              {product.title}
            </p>
          </Link>
          <div className="text-sm font-medium mb-2">
            <div className="text-black [&_*]:text-black">
              <ProductPrice
                price={line?.cost?.totalAmount ?? line?.merchandise?.price}
                compareAtPrice={line?.merchandise?.compareAtPrice}
                variant="compact"
              />
            </div>
          </div>
          {selectedOptions.length > 0 && selectedOptions.some(opt => opt.value !== 'Default Title') && (
            <ul className="text-xs space-y-1 text-black/70">
              {selectedOptions.map((option) => (
                option.value !== 'Default Title' && (
                  <li key={option.name}>
                    {option.name}: {option.value}
                  </li>
                )
              ))}
            </ul>
          )}
        </div>
        <CartLineQuantity line={line} layout={layout} />
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line, layout}: {line: CartLine; layout: CartLayout}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-2">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 !bg-transparent !border-black/10 border-2 text-black hover:!bg-white/20 hover:text-black hover:!border-black/10 disabled:opacity-40 disabled:!bg-transparent"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
          >
            <Minus className="h-4 w-4 stroke-[2.5]" />
          </Button>
        </CartLineUpdateButton>
        
        <span className="text-sm font-medium min-w-[2rem] text-center text-black">
          {quantity}
        </span>
        
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 !bg-transparent !border-black/10 border-2 text-black hover:!bg-white/20 hover:text-black hover:!border-black/10 disabled:opacity-40 disabled:!bg-transparent"
            aria-label="Increase quantity"
            name="increase-quantity"
            disabled={!!isOptimistic}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </Button>
        </CartLineUpdateButton>
      </div>
      
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} layout={layout} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
  layout,
}: {
  lineIds: string[];
  disabled: boolean;
  layout: CartLayout;
}) {
  const locale = useLocale();
  const cartRoute = locale?.pathPrefix ? `${locale.pathPrefix}/cart` : '/cart';
  
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route={cartRoute}
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <Button
        variant="ghost"
        size="sm"
        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
        disabled={disabled}
        type="submit"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Remove
      </Button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);
  const locale = useLocale();
  const cartRoute = locale?.pathPrefix ? `${locale.pathPrefix}/cart` : '/cart';

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route={cartRoute}
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}