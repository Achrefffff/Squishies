import { gql, type StorefrontApi } from "@shopify/hydrogen";
import { Link } from "react-router";

import { shopifyImageSrcSet, shopifyImageUrl } from "~/lib/image";

export const COLLECTION_CARD_PRODUCT_COUNT_LIMIT = 100;

export const COLLECTION_CARD_FRAGMENT = gql(`
  fragment CollectionCard on Collection {
    handle
    title
    image {
      url
      altText
      width
      height
    }
    products(first: 1) {
      nodes {
        featuredImage {
          url
          altText
        }
      }
    }
    productCountProbe: products(first: 100) {
      nodes {
        id
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`);

const COLLECTION_CARD_SHAPE_QUERY = gql(
  `query CollectionCardShape { collections(first: 1) { nodes { ...CollectionCard } } }`,
  [COLLECTION_CARD_FRAGMENT],
);

export type CollectionCardData = StorefrontApi.ResultOf<
  typeof COLLECTION_CARD_SHAPE_QUERY
>["collections"]["nodes"][number];

export type CollectionCardProps = {
  collection: CollectionCardData;
  priority?: boolean;
  productCount?: number;
  useProductImageFallback?: boolean;
};

function productCountText(collection: CollectionCardData, productCount?: number) {
  if (typeof productCount === "number") {
    return `${productCount} ${productCount <= 1 ? "squishy" : "squishies"}`;
  }

  if (collection.productCountProbe.pageInfo.hasNextPage) {
    return `${COLLECTION_CARD_PRODUCT_COUNT_LIMIT}+ squishies`;
  }

  const count = collection.productCountProbe.nodes.length;
  return `${count} ${count <= 1 ? "squishy" : "squishies"}`;
}

export function CollectionCard({
  collection,
  priority = false,
  productCount,
  useProductImageFallback = true,
}: CollectionCardProps) {
  const fallbackImage = useProductImageFallback
    ? (collection.products.nodes[0]?.featuredImage ?? null)
    : null;
  const image = collection.image ?? fallbackImage;
  const imageWidth = collection.image?.width ?? undefined;
  const imageHeight = collection.image?.height ?? undefined;

  return (
    <Link
      to={`/collections/${collection.handle}`}
      className="card group squishies-card-shadow squishies-card-hover focus-visible:outline-accent relative block overflow-hidden rounded-3xl no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-label={collection.title}
      data-testid="collection-card"
    >
      <div className="bg-surface-secondary relative block aspect-square overflow-hidden">
        {image ? (
          <div className="h-full w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.05]">
            <img
              src={shopifyImageUrl(image.url, { width: 480 })}
              srcSet={shopifyImageSrcSet(image.url, [240, 360, 480, 720])}
              sizes="(max-width: 1023px) 46vw, 23vw"
              alt=""
              width={imageWidth ?? 480}
              height={imageHeight ?? 480}
              className="h-full w-full object-cover"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
            />
          </div>
        ) : null}
      </div>
      <div className="overlay-dark pointer-events-none absolute inset-0" />
      <div className="text-interactive-text absolute inset-x-0 bottom-0 z-10 p-3.5 text-left sm:p-5">
        <h3 className="font-heading text-base leading-tight font-semibold sm:text-xl">
          {collection.title}
        </h3>
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium opacity-90 sm:text-sm">
          <span className="tabular-nums">{productCountText(collection, productCount)}</span>
          <span aria-hidden="true">→</span>
        </p>
      </div>
    </Link>
  );
}
