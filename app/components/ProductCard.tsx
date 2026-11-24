import { gql, type StorefrontApi } from "@shopify/hydrogen";
import { createProductComponents } from "@shopify/hydrogen/react";
import { Link } from "react-router";

import { openCartDrawer } from "~/lib/cart-drawer";
import { shopifyImageSrcSet, shopifyImageUrl } from "~/lib/image";
import { compareMoney, formatPrice } from "~/lib/money";

export const PRODUCT_CARD_FRAGMENT = gql(`
  fragment ProductCard on Product {
    id
    handle
    title
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        url
        altText
      }
    }
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    selectedOrFirstAvailableVariant {
      id
      title
      availableForSale
      price {
        amount
        currencyCode
      }
      image {
        url
        altText
      }
      selectedOptions {
        name
        value
      }
      product {
        title
        handle
      }
    }
  }
`);

const PRODUCT_CARD_SHAPE_QUERY = gql(
  `query ProductCardShape { products(first: 1) { nodes { ...ProductCard } } }`,
  [PRODUCT_CARD_FRAGMENT],
);

export type ProductCardData = StorefrontApi.ResultOf<
  typeof PRODUCT_CARD_SHAPE_QUERY
>["products"]["nodes"][number];

type CardProductInput = ProductCardData & {
  options: [];
  adjacentVariants: [];
};

const { ProductProvider: CardProductProvider, useProductForm: useCardProductForm } =
  createProductComponents<CardProductInput>();

type ProductCardProps = {
  product: ProductCardData;
  priority?: boolean;
};

function getSensoryBadge(tags: readonly string[]): { label: string; className: string } | null {
  const normalized = tags.map((tag) => tag.toLowerCase());
  if (normalized.some((t) => t.includes("noël") || t.includes("avent"))) {
    return { label: "Édition Noël", className: "bg-festive text-surface" };
  }
  if (normalized.some((t) => t.includes("crispy") || t.includes("crackle"))) {
    return { label: "Craquant", className: "bg-pastel-mint text-[#145339]" };
  }
  if (normalized.some((t) => t.includes("paillet"))) {
    return { label: "Pailleté", className: "bg-pastel-lilac text-[#4C2A85]" };
  }
  if (normalized.some((t) => t.includes("gourmandise") || t.includes("fruits"))) {
    return { label: "Kawaii", className: "bg-pastel-rose text-[#9D1C4D]" };
  }
  return null;
}

function CardAddToCartButton({ available }: { available: boolean }) {
  const { register, formProps, pending } = useCardProductForm();

  return (
    <form {...formProps({ afterSubmit: openCartDrawer })} className="relative z-10 mt-1 w-full">
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: 1 })} />
      <button
        {...register("addToCart", {})}
        disabled={!available || pending}
        className="rounded-button button-primary squish-press focus-visible:outline-accent inline-flex h-10 w-full cursor-pointer items-center justify-center px-3 text-xs font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:text-sm"
      >
        {pending ? "Ajout…" : available ? "Ajouter au panier" : "Épuisé"}
      </button>
    </form>
  );
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage = product.featuredImage ?? product.images.nodes[0] ?? null;
  const hoverImage = product.images.nodes[1] ?? null;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const onSale = compareMoney(compareAt, price) > 0;
  const sensoryBadge = getSensoryBadge(product.tags);
  const variant = product.selectedOrFirstAvailableVariant;
  const canQuickAdd = Boolean(product.availableForSale && variant?.availableForSale && variant?.id);

  const badge = !product.availableForSale
    ? { label: "Épuisé", className: "badge-soldout" }
    : onSale
      ? { label: "Promo", className: "badge-sale" }
      : sensoryBadge;

  return (
    <article
      className="group bg-surface-elevated border-border/80 squishies-card-shadow squishies-card-hover flex h-full flex-col overflow-hidden rounded-3xl border p-2 sm:p-3"
      aria-label={product.title}
      data-testid="product-card"
    >
      <Link
        to={`/products/${product.handle}`}
        className="bg-surface-secondary focus-visible:outline-accent relative block aspect-square overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        tabIndex={-1}
        aria-hidden="true"
      >
        {primaryImage ? (
          <div className="h-full w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.04]">
            <img
              src={shopifyImageUrl(primaryImage.url, { width: 480 })}
              srcSet={shopifyImageSrcSet(primaryImage.url, [240, 360, 480, 720])}
              sizes="(max-width: 639px) 46vw, (max-width: 1023px) 44vw, 30vw"
              width={480}
              height={480}
              alt={primaryImage.altText ?? product.title}
              className="h-full w-full object-cover"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
            />
          </div>
        ) : null}
        {hoverImage ? (
          <div className="pointer-events-none absolute inset-0 opacity-0 motion-safe:transition-opacity motion-safe:duration-300 motion-safe:group-hover:opacity-100">
            <img
              src={shopifyImageUrl(hoverImage.url, { width: 480 })}
              srcSet={shopifyImageSrcSet(hoverImage.url, [240, 360, 480, 720])}
              sizes="(max-width: 639px) 46vw, (max-width: 1023px) 44vw, 30vw"
              width={480}
              height={480}
              alt={hoverImage.altText ?? ""}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        {badge ? (
          <span
            className={`${badge.className} absolute start-2 top-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight shadow-sm`}
          >
            {badge.label}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-2 px-1 pt-2.5 pb-1 text-left sm:px-1.5 sm:pt-3">
        <div>
          <h3 className="font-heading text-on-surface line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
            <Link
              to={`/products/${product.handle}`}
              className="text-on-surface hover:text-primary focus-visible:outline-accent rounded-sm no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors"
            >
              {product.title}
            </Link>
          </h3>

          <div className="mt-1 inline-flex flex-wrap items-baseline gap-1.5 tabular-nums">
            {onSale ? (
              <>
                <span className="text-sale text-sm font-bold sm:text-base">
                  <span className="sr-only">Prix promo : </span>
                  {formatPrice(price)}
                </span>
                <s className="text-compare text-xs sm:text-sm">
                  <span className="sr-only">Prix habituel : </span>
                  {formatPrice(compareAt)}
                </s>
              </>
            ) : (
              <span className="text-on-surface text-sm font-bold sm:text-base">
                <span className="sr-only">Prix : </span>
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>

        <CardProductProvider product={{ ...product, options: [], adjacentVariants: [] }}>
          <CardAddToCartButton available={canQuickAdd} />
        </CardProductProvider>
      </div>
    </article>
  );
}
