import { gql } from "@shopify/hydrogen";
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
  const featuredCollections: CollectionCardData[] = data?.collections.nodes ?? [];

  return {
    featuredProducts,
    featuredCollections,
  };
}

const PILL_PALETTE = [
  "bg-[#DFF0FF] text-[#0E4A8A] border-[#96CCFF] hover:bg-[#CCE6FF]", // Bleu ciel (u du logo)
  "bg-[#E3F9D4] text-[#255910] border-[#9DE06B] hover:bg-[#D2F4BA]", // Vert pomme (s du logo)
  "bg-[#FFF0CC] text-[#7A4200] border-[#FFD066] hover:bg-[#FFE5AA]", // Jaune-orange (q/h du logo)
  "bg-[#F2E3FF] text-[#5A1E94] border-[#CEA6FF] hover:bg-[#E7D0FF]", // Violet kawaii (i du logo)
] as const;

function QuickCategoryPills({ collections }: { collections: readonly CollectionCardData[] }) {
  if (collections.length === 0) return null;

  return (
    <nav
      aria-label="Accès rapide aux univers"
      className="max-w-page px-margin mx-auto w-full py-3"
    >
      <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        <a
          href="#catalogue"
          className="squish-press shrink-0 snap-start rounded-full border border-[#D93275] bg-[#FF4D94] px-4 py-2 text-xs font-bold text-white no-underline shadow-sm hover:bg-[#EC3A82] sm:text-sm"
        >
          Tout voir
        </a>
        {collections.map((collection, index) => (
          <Link
            key={collection.handle}
            to={`/collections/${collection.handle}`}
            className={`${PILL_PALETTE[index % PILL_PALETTE.length]} squish-press shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-bold no-underline shadow-xs sm:text-sm`}
          >
            {collection.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function CatalogSection({ products }: { products: readonly ProductCardData[] }) {
  return (
    <section
      id="catalogue"
      className="w-full scroll-mt-20 pt-6 pb-10 sm:pt-10 sm:pb-14"
      aria-labelledby="catalogue-heading"
    >
      <div className="max-w-page px-margin mx-auto mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <p className="type-overline text-primary mb-1">La collection</p>
          <h2 id="catalogue-heading" className="type-heading-xl text-on-surface">
            Tous nos Squishies
          </h2>
        </div>
        <Link
          to="/collections"
          className="min-h-touch-target text-on-surface-secondary hover:text-primary focus-visible:outline-accent inline-flex shrink-0 items-center gap-1 rounded-full text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors"
        >
          <span>Univers</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="max-w-page px-margin mx-auto contain-paint">
          <ul
            role="list"
            className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          >
            {products.map((product) => (
              <li key={product.handle}>
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

const PROMISES = [
  {
    title: "Textures sensorielles",
    desc: "Moelleux, pailletés ou craquants crispy pour un vrai effet anti-stress.",
    bg: "bg-pastel-rose",
  },
  {
    title: "Coffrets soignés",
    desc: "Livrés dans leurs boîtes illustrées, étuis rigides ou paniers vapeur.",
    bg: "bg-pastel-mint",
  },
  {
    title: "Paiement sécurisé",
    desc: "Règlement chiffré via le checkout officiel Shopify & Shop Pay.",
    bg: "bg-pastel-sky",
  },
  {
    title: "Sécurité jouets",
    desc: "Jouets non comestibles (ne pas ingérer). Âge recommandé 3+ ou 6+.",
    bg: "bg-pastel-lilac",
  },
] as const;

function PromisesStrip() {
  return (
    <section className="max-w-page px-margin mx-auto w-full pb-4" aria-label="Engagements Squishies">
      <ul role="list" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {PROMISES.map((item) => (
          <li
            key={item.title}
            className="bg-surface-elevated border-border/80 rounded-3xl border p-4 sm:p-5"
          >
            <span
              className={`${item.bg} mb-3 inline-flex size-8 items-center justify-center rounded-full`}
              aria-hidden="true"
            >
              <span className="bg-on-surface/70 size-2 rounded-full" />
            </span>
            <h3 className="font-heading text-on-surface text-sm font-semibold sm:text-base">
              {item.title}
            </h3>
            <p className="text-on-surface-secondary mt-1 text-xs leading-relaxed sm:text-sm">
              {item.desc}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featuredProducts, featuredCollections } = loaderData;
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
      <QuickCategoryPills collections={featuredCollections} />
      <CatalogSection products={featuredProducts} />
      <ShopByCategory collections={featuredCollections} />
      <FestiveSpotlight product={adventProduct} />
      <PromisesStrip />
    </main>
  );
}
