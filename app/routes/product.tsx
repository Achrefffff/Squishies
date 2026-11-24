import {
  AnalyticsEvent,
  buildProductSelectionSearchParams,
  canAddToCart,
  getSelectedProductOptions,
  gql,
  type SelectedOption,
} from "@shopify/hydrogen";
import { ShopPayButton } from "@shopify/hydrogen/react";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { ProductCard, PRODUCT_CARD_FRAGMENT } from "~/components/ProductCard";
import { openCartDrawer } from "~/lib/cart-drawer";
import { shopifyImageSrcSet, shopifyImageUrl } from "~/lib/image";
import { formatPrice, salePercent } from "~/lib/money";
import { ProductProvider, useProductForm } from "~/lib/product";
import { storefrontClientContext } from "~/lib/storefront";
import { formatPageTitle, getShopNameFromRootMatch } from "~/lib/storefront-shop";

import type { Route } from "./+types/product";

const ADD_TO_CART_FORM_ID = "product-add-to-cart-form";

const PRODUCT_VARIANT_FRAGMENT = gql(`
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    selectedOptions {
      name
      value
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      id
      url
      altText
      width
      height
    }
    product {
      title
      handle
    }
    sku
  }
`);

const PRODUCT_QUERY = gql(
  `
    query ProductPage($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
      product(handle: $handle) {
        id
        handle
        title
        vendor
        tags
        description
        descriptionHtml
        requiresSellingPlan
        encodedVariantExistence
        encodedVariantAvailability
        featuredImage {
          id
          url
          altText
          width
          height
        }
        images(first: 8) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        options {
          name
          optionValues {
            name
            firstSelectableVariant {
              ...ProductVariantFields
            }
            swatch {
              color
              image {
                previewImage {
                  url
                }
              }
            }
          }
        }
        selectedOrFirstAvailableVariant(
          selectedOptions: $selectedOptions
          ignoreUnknownOptions: true
          caseInsensitiveMatch: true
        ) {
          ...ProductVariantFields
        }
        adjacentVariants(
          selectedOptions: $selectedOptions
          ignoreUnknownOptions: true
          caseInsensitiveMatch: true
        ) {
          ...ProductVariantFields
        }
      }
      products(first: 5) {
        nodes {
          ...ProductCard
        }
      }
    }
  `,
  [PRODUCT_VARIANT_FRAGMENT, PRODUCT_CARD_FRAGMENT],
);

export function meta({ data, matches }: Route.MetaArgs) {
  const shopName = getShopNameFromRootMatch(matches[0]);
  const title = data?.product.title ?? "Produit";
  return [
    { title: formatPageTitle(title, shopName) },
    {
      name: "description",
      content: data?.product.description || `Découvrez ${title} chez ${shopName}.`,
    },
  ];
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) throw new Response("Not Found", { status: 404 });

  const storefrontClient = context.get(storefrontClientContext);
  const selectedOptions = getSelectedProductOptions({
    searchParams: new URL(request.url).searchParams,
  });
  const { data } = await storefrontClient.graphql(PRODUCT_QUERY, {
    variables: { handle, selectedOptions },
  });

  if (!data?.product) throw new Response("Not Found", { status: 404 });

  return {
    product: data.product,
    relatedProducts: data.products.nodes
      .filter((product) => product.handle !== data.product?.handle)
      .slice(0, 4),
  };
}

type ProductData = Route.ComponentProps["loaderData"]["product"];
type ProductVariant = NonNullable<ProductData["selectedOrFirstAvailableVariant"]>;
type RelatedProduct = Route.ComponentProps["loaderData"]["relatedProducts"][number];

type ProductImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type SwatchValue = {
  color?: string | null;
  imageUrl?: string | null;
};

function toRouterLocation(url: string) {
  return url;
}

function variantUrl(
  product: { handle: string; options: Array<{ name: string }> },
  selectedOptions: SelectedOption[],
  handle = product.handle,
  base: URLSearchParams = new URLSearchParams(),
) {
  const params = buildProductSelectionSearchParams({
    selectedOptions,
    optionNames: product.options.map((option) => option.name),
    base,
  });
  const query = params.toString();
  return `/products/${handle}${query ? `?${query}` : ""}`;
}

function buildSwatchLookup(product: ProductData) {
  const lookup = new Map<string, SwatchValue>();
  for (const option of product.options) {
    for (const value of option.optionValues) {
      const swatch = value.swatch;
      lookup.set(`${option.name}:${value.name}`, {
        color: swatch?.color ?? null,
        imageUrl: swatch?.image?.previewImage?.url ?? null,
      });
    }
  }
  return lookup;
}

function hasSwatchData(product: ProductData, optionName: string) {
  const option = product.options.find((candidate) => candidate.name === optionName);
  return Boolean(
    option?.optionValues.some(
      (value) => value.swatch?.color || value.swatch?.image?.previewImage?.url,
    ),
  );
}

function ProductViewedTracker({ product }: { product: ProductData }) {
  useEffect(() => {
    const selectedVariant = product.selectedOrFirstAvailableVariant;
    window.Shopify?.analytics?.publish(AnalyticsEvent.PRODUCT_VIEWED, {
      products: [
        {
          id: product.id,
          title: product.title,
          price: selectedVariant?.price ?? product.priceRange.minVariantPrice,
          vendor: product.vendor ?? "",
          variantId: selectedVariant?.id ?? product.id,
          variantTitle: selectedVariant?.title ?? product.title,
          quantity: 1,
          sku: selectedVariant?.sku,
        },
      ],
    });
  }, [product]);

  return null;
}

function useGalleryImages(product: ProductData, selectedVariant: ProductVariant | null) {
  return useMemo(() => {
    const images: ProductImage[] = [];
    const seen = new Set<string>();
    const addImage = (image: ProductImage | null | undefined) => {
      if (!image?.url || seen.has(image.url)) return;
      seen.add(image.url);
      images.push(image);
    };

    addImage(selectedVariant?.image ?? product.featuredImage ?? product.images.nodes[0]);
    for (const image of product.images.nodes) addImage(image);
    return images;
  }, [product, selectedVariant]);
}

function galleryDotClass(active: boolean) {
  if (active) return "bg-primary h-2 w-5 rounded-full motion-safe:transition-all";
  return "bg-on-surface/25 size-2 rounded-full motion-safe:transition-all";
}

function ProductGallery({
  product,
  selectedVariant,
}: {
  product: ProductData;
  selectedVariant: ProductVariant | null;
}) {
  const images = useGalleryImages(product, selectedVariant);
  const primaryImageUrl = images[0]?.url;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [primaryImageUrl]);

  return (
    <div data-testid="product-gallery">
      <div
        role="region"
        aria-roledescription="carrousel"
        aria-label={product.title}
        className="relative grid"
      >
        <div
          data-product-gallery-track
          className={`flex snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:overflow-visible ${
            images.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"
          }`}
          style={{ scrollbarWidth: "none" }}
          tabIndex={0}
          onScroll={(event) => {
            const track = event.currentTarget;
            if (track.clientWidth > 0) {
              setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
            }
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.url}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`Photo ${index + 1} sur ${images.length}`}
              className="w-full shrink-0 snap-center contain-paint md:w-auto md:shrink"
            >
              <div className="bg-surface-elevated border-border/80 squishies-card-shadow aspect-square overflow-hidden rounded-3xl border">
                <img
                  src={shopifyImageUrl(image.url, { width: 900 })}
                  srcSet={shopifyImageSrcSet(image.url, [480, 720, 960, 1200])}
                  sizes="(max-width: 767px) 92vw, 52vw"
                  alt={image.altText ?? product.title}
                  width={image.width ?? 900}
                  height={image.height ?? 900}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding={index === 0 ? "sync" : "async"}
                  data-testid={index === 0 ? "product-gallery-image" : undefined}
                />
              </div>
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <div className="mt-3 flex items-center justify-center gap-3 md:hidden">
            <div
              data-slideshow-dots
              role="group"
              aria-label="Pagination de la galerie"
              className="flex items-center justify-center gap-1.5"
            >
              {images.map((image, index) => (
                <span key={image.url} className={galleryDotClass(index === activeIndex)} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PriceBlock({
  product,
  selectedVariant,
}: {
  product: ProductData;
  selectedVariant: ProductVariant | null;
}) {
  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice;
  const percent = salePercent(price, compareAt);

  return (
    <div className="mt-3" data-product-price>
      <div className="inline-flex flex-wrap items-baseline gap-2.5 tabular-nums">
        {compareAt && percent ? (
          <>
            <span className="text-sale text-2xl font-bold">
              <span className="sr-only">Prix promo : </span>
              {formatPrice(price)}
            </span>
            <s className="text-compare text-base">
              <span className="sr-only">Prix habituel : </span>
              {formatPrice(compareAt)}
            </s>
            <span
              className="bg-pastel-rose text-primary rounded-full px-2.5 py-0.5 text-xs font-bold"
              aria-label={`Économisez ${percent}%`}
            >
              -{percent}%
            </span>
          </>
        ) : (
          <span className="text-on-surface text-2xl font-bold sm:text-3xl">
            <span className="sr-only">Prix : </span>
            {formatPrice(price)}
          </span>
        )}
      </div>
    </div>
  );
}

function InventoryHint({ selectedVariant }: { selectedVariant: ProductVariant | null }) {
  if (!selectedVariant) return null;
  if (!selectedVariant.availableForSale) {
    return (
      <div className="mt-2.5">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold" data-product-inventory>
          <span className="bg-critical inline-block size-2 shrink-0 rounded-full" aria-hidden="true" />
          <span className="text-critical">Rupture de stock</span>
        </div>
      </div>
    );
  }

  const quantity = selectedVariant.quantityAvailable;
  if (quantity != null && quantity <= 5) {
    return (
      <div className="mt-2.5">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold" data-product-inventory>
          <span className="bg-warning inline-block size-2 shrink-0 rounded-full" aria-hidden="true" />
          <span className="text-warning">Plus que {quantity} en stock</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2.5">
      <div className="bg-pastel-mint/80 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" data-product-inventory>
        <span className="bg-success inline-block size-2 shrink-0 rounded-full" aria-hidden="true" />
        <span className="text-success">En stock · Prêt à expédier</span>
      </div>
    </div>
  );
}

function isPlainActivation(event: MouseEvent<HTMLAnchorElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    (!event.currentTarget.target || event.currentTarget.target === "_self")
  );
}

function VariantOptions({ product }: { product: ProductData }) {
  const { options, register } = useProductForm();
  const swatches = useMemo(() => buildSwatchLookup(product), [product]);
  const location = useLocation();
  const baseParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Hide single default Shopify option ("Title: Default Title")
  const visibleOptions = options.filter(
    (option) => !(option.values.length === 1 && option.values[0]?.name === "Default Title"),
  );
  if (visibleOptions.length === 0) return null;

  return (
    <div className="swatch-buttons mb-5 space-y-4">
      {visibleOptions.map((option) => {
        const selectedValue = option.values.find((value) => value.selected)?.name;
        const renderSwatches = hasSwatchData(product, option.name);
        const isColorOption = option.name.toLowerCase().includes("color") || option.name.toLowerCase().includes("couleur");

        return (
          <fieldset key={option.name} className="space-y-2">
            <legend className="text-on-surface text-sm font-semibold">
              {option.name}
              {selectedValue ? ` : ${selectedValue}` : ""}
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label={option.name}>
              {option.values.map((variantOption) => {
                const valueName = variantOption.name;
                const registered = register("optionValue", {
                  optionName: option.name,
                  value: valueName,
                });
                const isCrossProduct = variantOption.handle !== product.handle;
                const linkTarget = variantUrl(
                  product,
                  variantOption.selectedOptions,
                  variantOption.handle,
                  baseParams,
                );
                const soldOut = !variantOption.available;
                const testId = isColorOption ? "color-swatch" : undefined;
                const swatch = renderSwatches ? swatches.get(`${option.name}:${valueName}`) : null;
                const swatchStyle = swatch?.imageUrl
                  ? { backgroundImage: `url("${swatch.imageUrl}")` }
                  : { backgroundColor: swatch?.color ?? undefined };

                const className = renderSwatches
                  ? `min-h-touch-target min-w-touch-target relative inline-flex cursor-pointer items-center justify-center motion-safe:transition-transform motion-safe:active:scale-[0.93] ${soldOut ? "opacity-50" : ""}`
                  : `option-pill rounded-full focus-visible:outline-accent motion-safe:transition-[color,background-color,border-color,transform] motion-safe:active:scale-[0.97] ${variantOption.selected ? "is-selected" : ""} ${soldOut ? "opacity-50" : ""}`;
                const content = renderSwatches ? (
                  <>
                    <span
                      className={`swatch-md border-border relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 ring-offset-2 ${variantOption.selected ? "border-interactive" : ""}`}
                      style={swatchStyle}
                    >
                      {variantOption.selected ? (
                        <span className="swatch-scrim absolute inset-0" />
                      ) : null}
                      {soldOut ? (
                        <svg
                          className="absolute inset-0 h-full w-full"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <line x1="4" y1="4" x2="20" y2="20" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="sr-only">
                      {valueName}
                      {soldOut ? " (Épuisé)" : ""}
                    </span>
                  </>
                ) : (
                  `${valueName}${soldOut ? " (Épuisé)" : ""}`
                );

                if (!isCrossProduct && !variantOption.exists) {
                  return (
                    <button
                      key={valueName}
                      type="button"
                      disabled
                      className={className}
                      aria-label={renderSwatches ? valueName : undefined}
                      aria-pressed={variantOption.selected}
                      data-testid={testId}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link
                    key={valueName}
                    to={toRouterLocation(linkTarget)}
                    replace={!isCrossProduct}
                    preventScrollReset
                    className={className}
                    aria-label={renderSwatches ? valueName : undefined}
                    aria-current={variantOption.selected ? "true" : undefined}
                    data-testid={testId}
                    onClick={
                      isCrossProduct
                        ? undefined
                        : (event) => {
                            if (!isPlainActivation(event)) return;
                            registered.onClick();
                            event.preventDefault();
                          }
                    }
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

function QuantitySelector({
  quantity,
  setQuantity,
}: {
  quantity: number;
  setQuantity: (quantity: number) => void;
}) {
  const { register } = useProductForm();
  const clamp = (value: number) => Math.min(99, Math.max(1, value));

  return (
    <div className="shrink-0">
      <label className="text-on-surface mb-2 block text-sm font-semibold" htmlFor="quantity">
        Quantité
      </label>
      <div
        className="quantity-selector-outlined bg-surface-elevated inline-flex items-center rounded-full"
        data-testid="quantity-stepper"
      >
        <button
          type="button"
          className="text-on-surface-secondary hover:text-on-surface inline-flex size-11 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-[color,transform] motion-safe:active:scale-[0.90]"
          aria-label="Diminuer la quantité"
          onClick={() => setQuantity(clamp(quantity - 1))}
          disabled={quantity <= 1}
        >
          <img src="/icons/icon-minus.svg" alt="" className="size-4" aria-hidden="true" />
        </button>
        <input
          type="number"
          id="quantity"
          {...register("quantity", { value: quantity })}
          min={1}
          max={99}
          step={1}
          className="number-reset text-on-surface tabular-nums h-11 w-12 rounded-none border-0 bg-transparent p-0 text-center text-base font-semibold sm:text-sm"
          aria-label="Quantité"
          onChange={(event) =>
            setQuantity(clamp(Number.parseInt(event.currentTarget.value, 10) || 1))
          }
        />
        <button
          type="button"
          className="text-on-surface-secondary hover:text-on-surface inline-flex size-11 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-[color,transform] motion-safe:active:scale-[0.90]"
          aria-label="Augmenter la quantité"
          onClick={() => setQuantity(clamp(quantity + 1))}
          disabled={quantity >= 99}
        >
          <img src="/icons/icon-plus.svg" alt="" className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function AddToCart({
  product,
  quantity,
  setQuantity,
  selectedVariant,
}: {
  product: ProductData;
  quantity: number;
  setQuantity: (quantity: number) => void;
  selectedVariant: ProductVariant | null;
}) {
  const { options, register, formProps, errors, pending } = useProductForm();
  const addable = canAddToCart(product, options);
  const buttonText = pending
    ? "Ajout en cours…"
    : addable
      ? "Ajouter au panier"
      : selectedVariant
        ? "Épuisé"
        : "Choisir une option";

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;

  return (
    <>
      <form id={ADD_TO_CART_FORM_ID} {...formProps({ afterSubmit: openCartDrawer })}>
        <div className="mt-4 mb-5 flex items-end gap-4">
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
        </div>
        <input type="hidden" {...register("merchandiseId", {})} />
        <button
          {...register("addToCart", {})}
          className="rounded-button button-primary squish-press focus-visible:outline-accent inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 px-5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!addable || pending}
          data-testid="add-to-cart"
        >
          {buttonText}
        </button>
      </form>

      {selectedVariant ? (
        <div className="mt-3">
          <ShopPayButton
            variants={[{ id: selectedVariant.id, quantity }]}
            disabled={!addable || pending}
            width="100%"
            borderRadius="9999px"
          />
        </div>
      ) : null}

      {[...errors.userErrors, ...errors.warnings, ...errors.networkErrors].length ? (
        <div className="mt-3 grid gap-1 text-sm" role="alert">
          {errors.userErrors.map((error) => (
            <p key={error.message} className="text-critical">
              {error.message}
            </p>
          ))}
          {errors.warnings.map((warning) => (
            <p key={warning.message} className="text-warning">
              {warning.message}
            </p>
          ))}
          {errors.networkErrors.map((error) => (
            <p key={error.message} className="text-critical">
              {error.message}
            </p>
          ))}
        </div>
      ) : null}

      {/* Mobile sticky thumb-zone Add-to-Cart bar */}
      <div className="bg-surface/95 border-border pb-safe fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-on-surface-secondary truncate text-xs font-medium">
              {product.title}
            </p>
            <p className="text-on-surface tabular-nums text-base font-bold">
              {formatPrice(price)}
            </p>
          </div>
          <button
            type="submit"
            form={ADD_TO_CART_FORM_ID}
            className="rounded-button button-primary squish-press focus-visible:outline-accent inline-flex h-12 shrink-0 cursor-pointer items-center justify-center px-6 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!addable || pending}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </>
  );
}

function ProductInfo({
  product,
  selectedVariant,
}: {
  product: ProductData;
  selectedVariant: ProductVariant | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const ageTag = product.tags.find((t) => t === "6+" || t === "3+");
  const isFestive = product.tags.some((t) => t.toLowerCase().includes("noël"));

  return (
    <div className="flex flex-col gap-5 md:sticky md:top-24 md:self-start">
      <div>
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          {isFestive ? (
            <span className="bg-festive text-surface rounded-full px-3 py-0.5 text-xs font-semibold">
              Édition Noël
            </span>
          ) : null}
          {ageTag ? (
            <span className="bg-pastel-sky text-on-surface rounded-full px-3 py-0.5 text-xs font-semibold">
              Âge {ageTag}
            </span>
          ) : null}
          <span className="bg-surface-secondary text-on-surface-secondary rounded-full px-3 py-0.5 text-xs font-medium">
            {product.vendor || "Squishies"}
          </span>
        </div>

        <h1 className="type-heading-xl sm:type-display text-on-surface">{product.title}</h1>
        <PriceBlock product={product} selectedVariant={selectedVariant} />
        <InventoryHint selectedVariant={selectedVariant} />
      </div>

      <span className="sr-only" aria-live="polite" id="inventory-status" />

      <div data-product-form>
        <span className="sr-only" aria-live="polite" data-add-to-cart-status />
        <VariantOptions product={product} />
        <AddToCart
          product={product}
          quantity={quantity}
          setQuantity={setQuantity}
          selectedVariant={selectedVariant}
        />
      </div>

      <div className="bg-pastel-peach/65 border-border/80 rounded-2xl border px-4 py-3 text-xs leading-relaxed text-on-surface">
        <strong className="font-semibold">Sécurité jouet :</strong> squishy sensoriel anti-stress
        non comestible — ne pas ingérer.
        {ageTag ? ` Recommandé dès ${ageTag.replace("+", "")} ans.` : ""}
      </div>

      <h2 className="sr-only">Détails du produit</h2>
      <details
        className="group border-border bg-surface-elevated rounded-2xl border px-4"
        name="product-details"
        open
      >
        <summary className="marker-hidden text-on-surface flex cursor-pointer items-center justify-between py-4 text-sm font-semibold">
          <span>Description &amp; caractéristiques</span>
          <span
            className="ms-4 size-4 shrink-0 group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-200"
            aria-hidden="true"
          >
            <img src="/icons/icon-chevron-down.svg" alt="" className="size-4" />
          </span>
        </summary>
        <div className="richtext text-on-surface-secondary pb-4 text-sm">
          {product.descriptionHtml ? (
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          ) : (
            <p>{product.description}</p>
          )}
        </div>
      </details>
    </div>
  );
}

function ProductPageContent({ product }: { product: ProductData }) {
  const { selectedVariant } = useProductForm();

  return (
    <section className="max-w-page px-margin mx-auto w-full pt-4 pb-6 md:pt-8">
      <nav aria-label="Fil d'Ariane" className="mb-4 sm:mb-6">
        <ol className="text-on-surface-secondary flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
          <li>
            <Link to="/" className="hover:text-on-surface no-underline">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/collections" className="hover:text-on-surface no-underline">
              Collections
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="text-on-surface line-clamp-1 font-semibold">
              {product.title}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_0.9fr] md:gap-10 lg:gap-14">
        <ProductGallery product={product} selectedVariant={selectedVariant} />
        <ProductInfo product={product} selectedVariant={selectedVariant} />
      </div>
    </section>
  );
}

function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-6" aria-labelledby="related-products-heading">
      <div className="border-border border-t pt-10">
        <div className="max-w-page px-margin mx-auto mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="type-overline text-primary mb-1">Complétez votre collection</p>
            <h2 id="related-products-heading" className="type-heading-xl text-on-surface">
              Vous aimerez aussi
            </h2>
          </div>
          <Link
            to="/collections"
            className="text-on-surface-secondary hover:text-primary text-sm font-semibold no-underline"
          >
            Tout voir →
          </Link>
        </div>
        <div className="max-w-page px-margin mx-auto contain-paint">
          <ul
            role="list"
            className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
          >
            {products.map((product) => (
              <li key={product.handle}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function ProductRoute({ loaderData }: Route.ComponentProps) {
  const { product, relatedProducts } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ProductProvider
      product={product}
      onSelect={(result) => {
        const url = toRouterLocation(
          variantUrl(
            product,
            result.selectedOptions,
            result.selectedVariant?.product?.handle,
            new URLSearchParams(location.search),
          ),
        );
        void navigate(url, {
          replace: true,
          preventScrollReset: true,
          ...(result.status === "resolved" ? { defaultShouldRevalidate: false } : {}),
        });
      }}
    >
      <ProductViewedTracker product={product} />
      <main className="flex-1 pb-24 md:pb-0" id="main-content" tabIndex={-1}>
        <ProductPageContent product={product} />
        <RelatedProducts products={relatedProducts} />
      </main>
    </ProductProvider>
  );
}
