import { gql } from "@shopify/hydrogen";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import {
  CollectionCard,
  COLLECTION_CARD_FRAGMENT,
  type CollectionCardData,
} from "~/components/CollectionCard";
import { HomeHero } from "~/components/HomeHero";
import { ProductCard, PRODUCT_CARD_FRAGMENT, type ProductCardData } from "~/components/ProductCard";
import { shopifyImageSrcSet, shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import { storefrontClientContext } from "~/lib/storefront";
import { formatPageTitle, getShopNameFromRootMatch } from "~/lib/storefront-shop";

import type { Route } from "./+types/home";

const HOME_QUERY = gql(
  `
    query Home {
      products(first: 12, sortKey: CREATED_AT, reverse: false) {
        nodes {
          ...ProductCard
        }
      }
      collections(first: 4) {
        nodes {
          ...CollectionCard
          catalogProducts: products(first: 12) {
            nodes {
              id
            }
          }
        }
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT, COLLECTION_CARD_FRAGMENT],
);

export function meta({ matches }: Route.MetaArgs) {
  const shopName = getShopNameFromRootMatch(matches[0]);
  return [
    { title: formatPageTitle("Squishies kawaii, craquants & pailletés", shopName) },
    {
      name: "description",
      content: `Découvrez les squishies sensoriels, Mystery Dumplings, crispy squishies et le Calendrier de l'Avent chez ${shopName}.`,
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const storefrontClient = context.get(storefrontClientContext);
  const { data } = await storefrontClient.graphql(HOME_QUERY);

  const featuredProducts: ProductCardData[] = data?.products.nodes ?? [];
  const featuredCollections = data?.collections.nodes ?? [];

  return {
    featuredProducts,
    featuredCollections,
  };
}

type HomeCollectionData = CollectionCardData & {
  catalogProducts: {
    nodes: readonly { id: string }[];
  };
};

const PILL_PALETTE = [
  {
    idle: "bg-[#DFF0FF] text-[#0E4A8A] border-[#96CCFF] hover:bg-[#CCE6FF]",
    active: "bg-[#1E88E5] text-white border-[#1565C0] shadow-sm ring-2 ring-[#1E88E5]/25",
    halo: "border-[#1E88E5]",
    sparkle: "#1E88E5",
  },
  {
    idle: "bg-[#E3F9D4] text-[#255910] border-[#9DE06B] hover:bg-[#D2F4BA]",
    active: "bg-[#3FA322] text-white border-[#2E7D17] shadow-sm ring-2 ring-[#3FA322]/25",
    halo: "border-[#3FA322]",
    sparkle: "#3FA322",
  },
  {
    idle: "bg-[#FFF0CC] text-[#7A4200] border-[#FFD066] hover:bg-[#FFE5AA]",
    active: "bg-[#E68A00] text-white border-[#B86E00] shadow-sm ring-2 ring-[#E68A00]/25",
    halo: "border-[#E68A00]",
    sparkle: "#E68A00",
  },
  {
    idle: "bg-[#F2E3FF] text-[#5A1E94] border-[#CEA6FF] hover:bg-[#E7D0FF]",
    active: "bg-[#8B35DB] text-white border-[#6B21A8] shadow-sm ring-2 ring-[#8B35DB]/25",
    halo: "border-[#8B35DB]",
    sparkle: "#8B35DB",
  },
] as const;

function QuickCategoryPills({
  collections,
  activeHandle,
  transitionId,
  onSelect,
}: {
  collections: readonly HomeCollectionData[];
  activeHandle: string | null;
  transitionId: number;
  onSelect: (handle: string | null) => void;
}) {
  if (collections.length === 0) return null;

  const isAllActive = activeHandle === null;

  return (
    <div
      role="region"
      aria-label="Filtrer les squishies par univers"
      className="max-w-page px-margin mx-auto w-full py-3"
    >
      <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 py-1.5 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          aria-pressed={isAllActive}
          onClick={() => onSelect(null)}
          className={`squish-press focus-visible:outline-accent relative min-h-10 shrink-0 cursor-pointer snap-start rounded-full border px-4 py-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm ${
            isAllActive
              ? `border-[#D93275] bg-[#FF4D94] text-white shadow-sm ring-2 ring-[#FF4D94]/25 ${transitionId > 0 ? "kawaii-pill-active" : ""}`
              : "border-[#FF9BC4] bg-[#FFE4EF] text-[#A81652] hover:bg-[#FFD4E6]"
          }`}
        >
          {isAllActive && transitionId > 0 ? (
            <span
              key={`halo-all-${transitionId}`}
              aria-hidden="true"
              className="kawaii-pill-halo pointer-events-none absolute inset-0 rounded-full border-2 border-[#FF4D94]"
            />
          ) : null}
          Tout voir
        </button>
        {collections.map((collection, index) => {
          const palette = PILL_PALETTE[index % PILL_PALETTE.length];
          const isActive = activeHandle === collection.handle;

          return (
            <button
              key={collection.handle}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(collection.handle)}
              className={`${isActive ? `${palette.active} ${transitionId > 0 ? "kawaii-pill-active" : ""}` : palette.idle} squish-press focus-visible:outline-accent relative min-h-10 shrink-0 cursor-pointer snap-start rounded-full border px-4 py-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm`}
            >
              {isActive && transitionId > 0 ? (
                <span
                  key={`halo-${collection.handle}-${transitionId}`}
                  aria-hidden="true"
                  className={`kawaii-pill-halo pointer-events-none absolute inset-0 rounded-full border-2 ${palette.halo}`}
                />
              ) : null}
              {collection.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CatalogSection({
  products,
  activeCollection,
  accentColor,
  transitionId,
  onReset,
}: {
  products: readonly ProductCardData[];
  activeCollection: HomeCollectionData | null;
  accentColor: string;
  transitionId: number;
  onReset: () => void;
}) {
  const countLabel = `${products.length} ${products.length > 1 ? "produits" : "produit"}`;
  const shouldAnimate = transitionId > 0;

  return (
    <section
      id="catalogue"
      className="w-full scroll-mt-20 overflow-x-clip pt-4 pb-10 sm:pt-8 sm:pb-14"
      aria-labelledby="catalogue-heading"
    >
      <div className="max-w-page px-margin mx-auto mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div className="relative">
          <p className="type-overline text-primary mb-1">
            {activeCollection ? "Univers sélectionné" : "La collection"} ·{" "}
            <span className="tabular-nums">{countLabel}</span>
          </p>
          <div className="inline-flex items-center gap-2">
            <h2 id="catalogue-heading" className="type-heading-xl text-on-surface">
              {activeCollection ? activeCollection.title : "Tous nos Squishies"}
            </h2>
            {shouldAnimate ? (
              <svg
                key={`sparkle-${transitionId}`}
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="kawaii-sparkle size-5 shrink-0"
                fill={accentColor}
              >
                <path d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" />
              </svg>
            ) : null}
          </div>
        </div>
        {activeCollection ? (
          <button
            type="button"
            onClick={onReset}
            className="min-h-touch-target text-on-surface-secondary hover:text-primary focus-visible:outline-accent inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors"
          >
            <span>Tout voir</span>
          </button>
        ) : (
          <Link
            to="/collections"
            className="min-h-touch-target text-on-surface-secondary hover:text-primary focus-visible:outline-accent inline-flex shrink-0 items-center gap-1 rounded-full text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors"
          >
            <span>Univers</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {products.length > 0 ? (
        <div className="max-w-page px-margin mx-auto">
          <ul
            key={`grid-${transitionId}`}
            role="list"
            className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          >
            {products.map((product, index) => (
              <li
                key={product.handle}
                className={
                  shouldAnimate
                    ? index % 2 === 0
                      ? "kawaii-card-left"
                      : "kawaii-card-right"
                    : undefined
                }
              >
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ShopByCategory({ collections }: { collections: readonly CollectionCardData[] }) {
  if (collections.length === 0) return null;

  return (
    <section
      className="bg-surface-secondary/60 border-border/70 w-full border-y py-10 sm:py-14"
      aria-labelledby="category-heading"
    >
      <div className="max-w-page px-margin mx-auto mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <p className="type-overline text-primary mb-1">Par texture &amp; thème</p>
          <h2 id="category-heading" className="type-heading-xl text-on-surface">
            Explorer par univers
          </h2>
        </div>
        <Link
          to="/collections"
          className="min-h-touch-target text-on-surface-secondary hover:text-primary inline-flex shrink-0 items-center gap-1 text-sm font-semibold no-underline"
        >
          <span>Tout voir</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <ul
        role="list"
        className="max-w-page px-margin mx-auto grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      >
        {collections.map((collection) => (
          <li key={collection.handle}>
            <CollectionCard collection={collection} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FestiveSpotlight({ product }: { product: ProductCardData | undefined }) {
  if (!product) return null;

  return (
    <section className="max-w-page px-margin mx-auto w-full py-10 sm:py-14" aria-labelledby="festive-heading">
      <div className="bg-festive text-surface overflow-hidden rounded-[2rem] p-5 shadow-md sm:p-8 lg:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          {product.featuredImage ? (
            <Link
              to={`/products/${product.handle}`}
              className="group block overflow-hidden rounded-3xl bg-black/15"
            >
              <img
                src={shopifyImageUrl(product.featuredImage.url, { width: 640 })}
                srcSet={shopifyImageSrcSet(product.featuredImage.url, [360, 540, 720])}
                sizes="(max-width: 767px) 88vw, 40vw"
                width={640}
                height={640}
                alt={product.featuredImage.altText ?? product.title}
                className="aspect-square h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            </Link>
          ) : null}

          <div className="flex flex-col items-start text-left">
            <span className="bg-surface/15 inline-flex rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase">
              Édition Noël · 24 surprises
            </span>
            <h2 id="festive-heading" className="type-heading-xl mt-3">
              {product.title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed opacity-90 sm:text-base">
              24 cases numérotées renfermant chacune une figurine squishy surprise sur le thème de
              Noël. Le coffret cadeau idéal pour patienter jusqu&apos;au 24 décembre.
            </p>
            <div className="mt-5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                to={`/products/${product.handle}`}
                className="rounded-button button-primary squish-press focus-visible:outline-surface inline-flex h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold no-underline shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
              >
                <span>Découvrir · {formatPrice(product.priceRange.minVariantPrice)}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type PromiseIconId = "sensory" | "gift" | "payment" | "safety";

function PromiseIcon({
  id,
  color,
  softFill,
}: {
  id: PromiseIconId;
  color: string;
  softFill: string;
}) {
  if (id === "sensory") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <path
          d="M12.5 4.5L14.3 9.7L19.5 11.5L14.3 13.3L12.5 18.5L10.7 13.3L5.5 11.5L10.7 9.7L12.5 4.5Z"
          fill={softFill}
          stroke={color}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path
          d="M21 16L21.9 18.6L24.5 19.5L21.9 20.4L21 23L20.1 20.4L17.5 19.5L20.1 18.6L21 16Z"
          fill={color}
        />
        <circle cx="20.5" cy="7.5" r="1.6" fill={color} />
      </svg>
    );
  }

  if (id === "gift") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <rect
          x="5.5"
          y="12.5"
          width="17"
          height="10.5"
          rx="2.5"
          fill={softFill}
          stroke={color}
          strokeWidth="1.9"
        />
        <rect
          x="4.5"
          y="9.5"
          width="19"
          height="4"
          rx="1.5"
          fill="#FFFFFF"
          stroke={color}
          strokeWidth="1.9"
        />
        <path d="M14 9.5V23" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
        <path
          d="M14 9.5C14 9.5 10.5 9.5 9.5 7.4C8.8 5.9 10.1 4.6 11.6 5.3C13.1 6 14 9.5 14 9.5Z"
          fill={softFill}
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 9.5C14 9.5 17.5 9.5 18.5 7.4C19.2 5.9 17.9 4.6 16.4 5.3C14.9 6 14 9.5 14 9.5Z"
          fill={softFill}
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === "payment") {
    return (
      <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
        <path
          d="M14 4.5L21.5 7.5V13.8C21.5 18.6 18.3 22.2 14 23.8C9.7 22.2 6.5 18.6 6.5 13.8V7.5L14 4.5Z"
          fill={softFill}
          stroke={color}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <rect
          x="10.7"
          y="13"
          width="6.6"
          height="5.2"
          rx="1.4"
          fill="#FFFFFF"
          stroke={color}
          strokeWidth="1.8"
        />
        <path
          d="M12.2 13V11.6C12.2 10.6 13 9.8 14 9.8C15 9.8 15.8 10.6 15.8 11.6V13"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 28 28" fill="none" className="size-6" aria-hidden="true">
      <path
        d="M14 4.5L21.5 7.5V13.8C21.5 18.6 18.3 22.2 14 23.8C9.7 22.2 6.5 18.6 6.5 13.8V7.5L14 4.5Z"
        fill={softFill}
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M14 18.3C14 18.3 10.2 15.9 10.2 13.1C10.2 11.7 11.3 10.8 12.5 10.8C13.2 10.8 13.7 11.2 14 11.7C14.3 11.2 14.8 10.8 15.5 10.8C16.7 10.8 17.8 11.7 17.8 13.1C17.8 15.9 14 18.3 14 18.3Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PromisesStrip({ products }: { products: readonly ProductCardData[] }) {
  const previewProducts = products.filter((p) => p.featuredImage).slice(0, 3);

  return (
    <section
      className="max-w-page px-margin mx-auto w-full pb-6 sm:pb-8"
      aria-labelledby="promises-heading"
    >
      <div className="mb-4 sm:mb-6">
        <p className="type-overline text-primary mb-1">L&apos;expérience Squishies</p>
        <h2 id="promises-heading" className="type-heading-xl text-on-surface">
          Pourquoi on les adore
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12">
        {/* Grande carte vedette Bento : Textures sensorielles + miniatures produits */}
        <article className="squishies-card-hover relative col-span-2 flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#FFC2DB] bg-gradient-to-br from-[#FFF2F7] via-[#FFE3EF] to-[#FFE9DA] p-5 shadow-[0_14px_30px_-20px_rgba(232,74,127,0.55),inset_0_2px_0_rgba(255,255,255,0.9)] sm:p-6 lg:col-span-6 lg:row-span-2">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-[#FF9EC6]/30 blur-xl"
          />

          <div className="relative flex items-start justify-between gap-3">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/95 shadow-sm ring-1 ring-white">
              <PromiseIcon id="sensory" color="#E84A7F" softFill="#FFD1E4" />
            </span>
            <span className="inline-flex rounded-full border border-[#FFB3D2] bg-white/85 px-3 py-1 text-[11px] font-bold text-[#B81D58] tabular-nums">
              {products.length} modèles à collectionner
            </span>
          </div>

          <div className="relative mt-4">
            <h3 className="font-heading text-on-surface text-lg leading-snug font-bold sm:text-xl">
              Textures sensorielles uniques
            </h3>
            <p className="text-on-surface/80 mt-1.5 max-w-md text-xs leading-relaxed sm:text-sm">
              Moelleux, pailletés ou craquants crispy : chaque squishy offre une vraie sensation
              anti-stress dès la première pression.
            </p>
          </div>

          <div className="relative mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-[#B81D58] shadow-2xs">
                Moelleux
              </span>
              <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-[#6B21A8] shadow-2xs">
                Pailleté
              </span>
              <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-[#156B43] shadow-2xs">
                Crispy
              </span>
            </div>

            {previewProducts.length > 0 ? (
              <div className="flex items-center -space-x-3" aria-hidden="true">
                {previewProducts.map((product, index) => (
                  <img
                    key={product.handle}
                    src={shopifyImageUrl(product.featuredImage!.url, { width: 160 })}
                    alt=""
                    width={52}
                    height={52}
                    loading="lazy"
                    decoding="async"
                    className={`size-12 rounded-2xl border-2 border-white bg-white object-cover shadow-sm sm:size-14 ${
                      index === 0 ? "-rotate-6" : index === 1 ? "z-10 rotate-2" : "rotate-6"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </article>

        {/* Carte bandeau horizontal : Coffrets soignés */}
        <article className="squishies-card-hover relative col-span-2 flex items-center gap-4 overflow-hidden rounded-[1.75rem] border border-[#AAE8C2] bg-gradient-to-br from-[#F1FDF5] via-[#DFF9E9] to-[#CEF4DC] p-4 shadow-[0_12px_26px_-18px_rgba(30,142,90,0.45),inset_0_2px_0_rgba(255,255,255,0.85)] sm:p-5 lg:col-span-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-[#7CE0A6]/30 blur-lg"
          />
          <span className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/95 shadow-sm ring-1 ring-white">
            <PromiseIcon id="gift" color="#1D8F5A" softFill="#C7F4D9" />
          </span>
          <div className="relative min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-on-surface text-sm font-bold sm:text-base">
                Coffrets soignés
              </h3>
              <span className="inline-flex rounded-full border border-[#96E0B4] bg-white/85 px-2.5 py-0.5 text-[10px] font-bold text-[#156B43]">
                Prêt à offrir
              </span>
            </div>
            <p className="text-on-surface/75 mt-1 text-xs leading-relaxed sm:text-sm">
              Livrés dans leurs boîtes illustrées, étuis rigides ou paniers vapeur.
            </p>
          </div>
        </article>

        {/* Tuile compacte 1 : Paiement sécurisé */}
        <article className="squishies-card-hover relative col-span-1 overflow-hidden rounded-[1.75rem] border border-[#B3D9FF] bg-gradient-to-br from-[#F2F8FF] via-[#E1F0FF] to-[#D1E8FF] p-4 shadow-[0_12px_26px_-18px_rgba(29,114,214,0.45),inset_0_2px_0_rgba(255,255,255,0.85)] sm:p-5 lg:col-span-3">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-7 -right-7 size-20 rounded-full bg-[#8BC4FF]/30 blur-md"
          />
          <span className="relative inline-flex size-11 items-center justify-center rounded-2xl bg-white/95 shadow-sm ring-1 ring-white">
            <PromiseIcon id="payment" color="#1D72D6" softFill="#CCE4FF" />
          </span>
          <h3 className="font-heading text-on-surface relative mt-3 text-sm font-bold sm:text-base">
            Paiement sécurisé
          </h3>
          <p className="text-on-surface/75 relative mt-1 text-xs leading-relaxed">
            Checkout officiel Shopify &amp; Shop Pay chiffré.
          </p>
        </article>

        {/* Tuile compacte 2 : Sécurité jouets */}
        <article className="squishies-card-hover relative col-span-1 overflow-hidden rounded-[1.75rem] border border-[#D5B8FF] bg-gradient-to-br from-[#F8F3FF] via-[#EFE3FF] to-[#E5D2FF] p-4 shadow-[0_12px_26px_-18px_rgba(126,58,242,0.45),inset_0_2px_0_rgba(255,255,255,0.85)] sm:p-5 lg:col-span-3">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-7 -right-7 size-20 rounded-full bg-[#C29BFF]/30 blur-md"
          />
          <div className="relative flex items-start justify-between gap-1.5">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/95 shadow-sm ring-1 ring-white">
              <PromiseIcon id="safety" color="#7E3AF2" softFill="#E4D4FF" />
            </span>
            <span className="inline-flex rounded-full border border-[#C8A3FF] bg-white/85 px-2 py-0.5 text-[10px] font-bold text-[#5B21B6]">
              3+ / 6+
            </span>
          </div>
          <h3 className="font-heading text-on-surface relative mt-3 text-sm font-bold sm:text-base">
            Sécurité jouets
          </h3>
          <p className="text-on-surface/75 relative mt-1 text-xs leading-relaxed">
            Jouets non comestibles (ne pas ingérer).
          </p>
        </article>
      </div>
    </section>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featuredProducts, featuredCollections } = loaderData;
  const [activeCollectionHandle, setActiveCollectionHandle] = useState<string | null>(null);
  const [transitionId, setTransitionId] = useState(0);

  const handleSelectCollection = (handle: string | null) => {
    if (handle === activeCollectionHandle) return;
    setActiveCollectionHandle(handle);
    setTransitionId((count) => count + 1);
  };

  const activeCollectionIndex = useMemo(
    () => featuredCollections.findIndex((c) => c.handle === activeCollectionHandle),
    [featuredCollections, activeCollectionHandle],
  );

  const activeCollection =
    activeCollectionIndex >= 0 ? featuredCollections[activeCollectionIndex] : null;

  const accentColor =
    activeCollectionIndex >= 0
      ? PILL_PALETTE[activeCollectionIndex % PILL_PALETTE.length].sparkle
      : "#FF4D94";

  const visibleProducts = useMemo(() => {
    if (!activeCollection) return featuredProducts;
    const allowedIds = new Set(activeCollection.catalogProducts.nodes.map((product) => product.id));
    return featuredProducts.filter((product) => allowedIds.has(product.id));
  }, [featuredProducts, activeCollection]);

  const adventProduct = featuredProducts.find((p) => p.handle.includes("calendrier"));

  // Order hero spotlight: Advent Calendar first, then Donut & Blue Mystery Dumpling
  const spotlightProducts = [
    ...(adventProduct ? [adventProduct] : []),
    ...featuredProducts.filter((p) => p.handle !== adventProduct?.handle),
  ].slice(0, 4);

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <HomeHero
        spotlightProducts={spotlightProducts}
        totalCount={featuredProducts.length}
      />
      <QuickCategoryPills
        collections={featuredCollections}
        activeHandle={activeCollectionHandle}
        transitionId={transitionId}
        onSelect={handleSelectCollection}
      />
      <CatalogSection
        products={visibleProducts}
        activeCollection={activeCollection}
        accentColor={accentColor}
        transitionId={transitionId}
        onReset={() => handleSelectCollection(null)}
      />
      <ShopByCategory collections={featuredCollections} />
      <FestiveSpotlight product={adventProduct} />
      <PromisesStrip products={featuredProducts} />
    </main>
  );
}
