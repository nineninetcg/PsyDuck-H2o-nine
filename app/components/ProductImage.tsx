import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  if (!image) {
    return (
      <div className="w-full aspect-square bg-gray-100 border-2 border-black rounded-none flex items-center justify-center">
        <span className="text-gray-600 text-sm">No image available</span>
      </div>
    );
  }
  return (
    <div className="w-full aspect-video border-2 border-black rounded-none overflow-hidden bg-gray-100 flex items-center justify-center">
      <Image
        alt={image.altText || 'Product Image'}
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
