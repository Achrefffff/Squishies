import { AnalyticsEvent, getSortByValue } from "@shopify/hydrogen";
import { CollectionProvider } from "@shopify/hydrogen/react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate, useNavigation, useSearchParams } from "react-router";

import {
  ActiveFilterChips,
  COLLECTION_SORT_OPTIONS,
  FacetForm,
  FilterDrawer,
  LoadMore,
  Toolbar,
  useLoadMore,
} from "~/components/CollectionBrowse";
import { ProductCard } from "~/components/ProductCard";
import { loadCollectionPage } from "~/lib/collection";
import { shopifyImageUrl, srcSetFor } from "~/lib/image";
import { storefrontClientContext } from "~/lib/storefront";
import { formatPageTitle, getShopNameFromRootMatch } from "~/lib/storefront-shop";

import type { Route } from "./+types/collection";

export function meta({ data, matches }: Route.MetaArgs) {
  const shopName = getShopNameFromRootMatch(matches[0]);
  const title = data?.collection.title ?? "Collection";
  return [
    { title: formatPageTitle(title, shopName) },
    {
      name: "description",
      content: data?.collection.description || `Découvrez la collection ${title} chez ${shopName}.`,
    },
  ];
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) throw new Response("Not Found", { status: 404 });

  const storefrontClient = context.get(storefrontClientContext);
  return loadCollectionPage({ storefrontClient, handle, request });
}

type CollectionData = Route.ComponentProps["loaderData"]["collection"];
type ProductNode = Route.ComponentProps["loaderData"]["products"][number];

function CollectionViewedTracker({ collection }: { collection: CollectionData }) {
  useEffect(() => {
    window.Shopify?.analytics?.publish(AnalyticsEvent.COLLECTION_VIEWED, {
      collection: {
        id: collection.id,
        handle: collection.handle,
      },
    });
  }, [collection.id, collection.handle]);

  return null;
}

function BreadcrumbJsonLd({ collection, origin }: { collection: CollectionData; origin: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `${origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: `${origin}/collections`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.title,
        item: `${origin}/collections/${collection.handle}`,
      },
    ],
  };

  return <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>;
}

function Breadcrumb({ collection }: { collection: CollectionData }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 sm:mb-6">
      <ol className="text-on-surface-secondary flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <Link
            to="/"
            className="hover:text-on-surface rounded-sm py-2 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-safe:transition-colors"
          >
            Accueil
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            to="/collections"
            className="hover:text-on-surface rounded-sm py-2 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-safe:transition-colors"
          >
            Collections
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <span aria-current="page" className="text-on-surface font-semibold">
            {collection.title}
          </span>
        </li>
      </ol>
    </nav>
  );
}

function CollectionHeader({ collection }: { collection: CollectionData }) {
  return (
    <div className="squishies-hero-bg border-border/80 mb-6 rounded-3xl border p-5 sm:mb-8 sm:p-7">
      <div className="grid items-center gap-5 md:grid-cols-[1fr_11rem]">
        <div>
          <p className="type-overline text-primary mb-1">Collection Squishies</p>
          <h1 className="type-display text-on-surface mb-2">{collection.title}</h1>
          {collection.description ? (
            <div className="richtext text-on-surface-secondary type-body-sm max-w-2xl">
              <p>{collection.description}</p>
            </div>
          ) : null}
        </div>
        {collection.image ? (
          <div className="bg-surface-secondary hidden aspect-square overflow-hidden rounded-2xl shadow-sm md:block">
            <img
              src={shopifyImageUrl(collection.image.url, { width: 320 })}
              srcSet={srcSetFor(collection.image.url, { width: 320 })}
              alt={collection.image.altText ?? collection.title}
              width={collection.image.width ?? 320}
              height={collection.image.height ?? 320}
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProductGrid({ products }: { products: readonly ProductNode[] }) {
  if (products.length === 0) return null;

  return (
    <div className="contain-paint">
      <ul
        id="product-grid"
        data-testid="product-grid"
        role="list"
        className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3"
      >
        {products.map((product, index) => (
          <li key={`${product.handle}-${index}`}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ collectionPath }: { collectionPath: string }) {
  return (
    <div className="border-border bg-surface-secondary rounded-3xl border p-8 text-center">
      <h2 className="type-heading-md text-on-surface">Aucun produit trouvé</h2>
      <p className="text-on-surface-secondary mt-2 text-sm">
        Essayez de retirer certains filtres pour afficher plus de squishies.
      </p>
      <Link
        to={collectionPath}
        preventScrollReset
        className="rounded-button button-primary squish-press focus-visible:outline-accent mt-6 inline-flex h-11 items-center justify-center px-5 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Réinitialiser les filtres
      </Link>
    </div>
  );
}

function CollectionResults({ loaderData }: { loaderData: Route.ComponentProps["loaderData"] }) {
  const location = useLocation();
  const navigation = useNavigation();
  const isUpdating =
    navigation.state === "loading" &&
    navigation.location?.pathname === location.pathname &&
    navigation.location.search !== location.search;
  const collectionPath = `/collections/${loaderData.collection.handle}`;
  const { nodes, pageInfo, isLoading, loadMore } = useLoadMore(
    loaderData.products,
    loaderData.pageInfo,
    loaderData.dataSearch,
  );
  const countText = `${nodes.length} ${nodes.length <= 1 ? "squishy" : "squishies"}`;
  const defaultSortValue = getSortByValue("COLLECTION_DEFAULT", false);

  return (
    <>
      <Toolbar
        countText={countText}
        sortOptions={COLLECTION_SORT_OPTIONS}
        defaultSortValue={defaultSortValue}
      />
      <ActiveFilterChips
        basePath={collectionPath}
        clearAllTo={collectionPath}
        currencyCode={loaderData.currencyCode}
      />
      <h2 className="sr-only">Produits</h2>
      <div
        aria-busy={isUpdating}
        className={`motion-safe:transition-opacity motion-safe:duration-150 ${isUpdating ? "opacity-60" : "opacity-100"}`}
      >
        {nodes.length > 0 ? (
          <ProductGrid products={nodes} />
        ) : (
          <EmptyState collectionPath={collectionPath} />
        )}
      </div>
      <LoadMore
        pageInfo={pageInfo}
        loadedCount={nodes.length}
        countLabel={`${nodes.length} produits affichés`}
        isLoading={isLoading}
        onLoad={loadMore}
      />
      <FilterDrawer
        availableFilters={loaderData.availableFilters}
        currencyCode={loaderData.currencyCode}
      />
    </>
  );
}

export default function CollectionRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <CollectionProvider
      data={{ handle: loaderData.collection.handle, dataSearch: loaderData.dataSearch }}
      urlSearch={searchParams.toString()}
      onChange={(search) => {
        const nextParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
        nextParams.delete("after");
        const nextSearch = nextParams.toString();
        void navigate(
          { search: nextSearch ? `?${nextSearch}` : "" },
          {
            replace: searchParams.size > 0,
            preventScrollReset: true,
          },
        );
      }}
    >
      <CollectionViewedTracker collection={loaderData.collection} />
      <main className="flex-1" id="main-content" tabIndex={-1}>
        <div className="max-w-page px-margin mx-auto w-full py-6 md:py-12">
          <BreadcrumbJsonLd collection={loaderData.collection} origin={loaderData.origin} />
          <Breadcrumb collection={loaderData.collection} />
          <CollectionHeader collection={loaderData.collection} />
          <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
            <aside className="hidden lg:block" aria-label="Filtres">
              <div className="sticky top-24">
                <h2 className="type-heading-sm text-on-surface mb-2">Filtres</h2>
                <FacetForm
                  availableFilters={loaderData.availableFilters}
                  currencyCode={loaderData.currencyCode}
                />
              </div>
            </aside>
            <div>
              <CollectionResults loaderData={loaderData} />
            </div>
          </div>
        </div>
      </main>
    </CollectionProvider>
  );
}
