import { Link } from "react-router";

import { CollectionCard } from "~/components/CollectionCard";
import { loadCollectionsPage } from "~/lib/collections";
import { storefrontClientContext } from "~/lib/storefront";
import { formatPageTitle, getShopNameFromRootMatch } from "~/lib/storefront-shop";

import type { Route } from "./+types/collections";

export function meta({ matches }: Route.MetaArgs) {
  const shopName = getShopNameFromRootMatch(matches[0]);
  return [
    { title: formatPageTitle("Collections", shopName) },
    {
      name: "description",
      content: `Explorez tous les univers squishies chez ${shopName} : Mystery Dumplings, Format XXL, Crispy & Craquants, Gourmandises & Fruits, Animaux Kawaii, Noël & Cadeaux.`,
    },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const storefrontClient = context.get(storefrontClientContext);
  return loadCollectionsPage({ storefrontClient, request });
}

type CollectionNode = Route.ComponentProps["loaderData"]["collections"]["nodes"][number];

function BreadcrumbJsonLd({ origin }: { origin: string }) {
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
    ],
  };

  return <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>;
}

function Breadcrumb() {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 sm:mb-6">
      <ol className="text-on-surface-secondary flex items-center gap-1.5 text-sm">
        <li>
          <Link
            to="/"
            className="hover:text-on-surface rounded-sm py-2 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-safe:transition-colors"
          >
            Accueil
          </Link>
        </li>
        <li aria-hidden="true" className="text-on-surface-secondary">
          /
        </li>
        <li>
          <span aria-current="page" className="text-on-surface font-semibold">
            Collections
          </span>
        </li>
      </ol>
    </nav>
  );
}

function CollectionsGrid({ collections }: { collections: readonly CollectionNode[] }) {
  if (collections.length === 0) {
    return (
      <div className="border-border bg-surface-secondary rounded-3xl border p-8 text-center">
        <h2 className="type-heading-md text-on-surface">Aucune collection trouvée</h2>
        <p className="text-on-surface-secondary mt-2 text-sm">
          Aucune collection n&apos;est disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="sr-only">Parcourir les collections</h2>
      <ul role="list" className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <li key={collection.handle}>
            <CollectionCard collection={collection} priority={index < 2} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function CollectionsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <div className="max-w-page px-margin mx-auto w-full py-6 md:py-12">
        <BreadcrumbJsonLd origin={loaderData.origin} />
        <Breadcrumb />
        <div className="mb-6 sm:mb-8">
          <p className="type-overline text-primary mb-1">Nos univers</p>
          <h1 className="type-display text-on-surface">Collections</h1>
        </div>
        <CollectionsGrid collections={loaderData.collections.nodes} />
      </div>
    </main>
  );
}
