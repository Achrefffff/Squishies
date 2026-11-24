import { getPredictiveSearchItemUrl, getSearchResultUrl } from "@shopify/hydrogen";
import type { PredictiveSearchProductItem, PredictiveSearchState } from "@shopify/hydrogen";
import {
  PredictiveSearchProvider,
  usePredictiveSearch,
  usePredictiveSearchActions,
  usePredictiveSearchForm,
} from "@shopify/hydrogen/react";
import { useRef } from "react";
import { Link, useNavigate } from "react-router";

import { SEARCH_DRAWER_ID, closeSearchDrawer } from "~/lib/cart-drawer";
import { shopifyImageUrl, srcSetFor } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import { describeSuggestions } from "~/lib/predictive-search";
import { routeTemplates } from "~/lib/route-templates";

const SEARCH_PAGE_PATH = "/search";
const TITLE_ID = "search-drawer-title";
const INPUT_ID = "search-drawer-query";
const RESULTS_ID = "search-drawer-results";

const POPULAR_TERMS = ["Dumpling", "Donut", "Crispy", "Noël", "Pêche"] as const;

export function SearchDrawer() {
  return (
    <PredictiveSearchProvider searchAction={SEARCH_PAGE_PATH}>
      <SearchDialog />
    </PredictiveSearchProvider>
  );
}

function SearchDialog() {
  const navigate = useNavigate();
  const { clear } = usePredictiveSearchActions();
  const { formProps, register } = usePredictiveSearchForm();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <dialog
      id={SEARCH_DRAWER_ID}
      className="drawer-right bg-surface text-on-surface"
      aria-labelledby={TITLE_ID}
      data-testid="search-drawer"
      closedby="any"
      onClose={() => {
        if (inputRef.current) inputRef.current.value = "";
        clear();
      }}
    >
      <div className="flex h-full flex-col">
        <div className="border-border flex shrink-0 items-center gap-2 border-b py-2.5 ps-4 pe-2">
          <h2 id={TITLE_ID} className="sr-only">
            Rechercher un squishy
          </h2>
          <form
            {...formProps({
              className: "relative flex-1",
              "aria-labelledby": TITLE_ID,
              onSubmit: (event, term) => {
                event.preventDefault();
                closeSearchDrawer();
                void navigate(getSearchResultUrl({ baseUrl: SEARCH_PAGE_PATH, term }));
              },
            })}
          >
            <label htmlFor={INPUT_ID} className="sr-only">
              Rechercher des produits
            </label>
            <span
              className="text-on-surface-secondary pointer-events-none absolute start-3.5 top-1/2 inline-flex size-5 -translate-y-1/2"
              aria-hidden="true"
            >
              <img src="/icons/icon-search.svg" alt="" className="size-5" />
            </span>
            <input
              ref={inputRef}
              {...register("query", {
                id: INPUT_ID,
                placeholder: "Rechercher un squishy, donut, dumpling…",
                "aria-controls": RESULTS_ID,
                className: "h-11 w-full rounded-full ps-10 text-base sm:text-sm",
                onKeyDown: (event) => {
                  if (event.key !== "Escape") return;
                  event.preventDefault();
                  closeSearchDrawer();
                },
              })}
            />
          </form>
          <button
            type="button"
            commandfor={SEARCH_DRAWER_ID}
            command="close"
            className="button-icon squish-press focus-visible:outline-accent inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Fermer la recherche"
            onClick={() => closeSearchDrawer()}
          >
            <img src="/icons/icon-x.svg" alt="" className="size-5" aria-hidden="true" />
          </button>
        </div>
        <SearchSuggestions />
      </div>
    </dialog>
  );
}

function SearchSuggestions() {
  const state = usePredictiveSearch();
  const { status, result, term } = state;

  return (
    <div id={RESULTS_ID} className="pb-safe flex-1 overflow-y-auto p-4" aria-busy={status === "loading"}>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {describeSuggestions(state)}
      </p>
      <SuggestionsBody status={status} result={result} />
      {term.length > 0 ? (
        <Link
          to={getSearchResultUrl({ baseUrl: SEARCH_PAGE_PATH, term })}
          className="text-primary focus-visible:outline-accent mt-4 inline-flex min-h-11 items-center text-sm font-semibold no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => closeSearchDrawer()}
        >
          Voir tous les résultats pour « {term} » →
        </Link>
      ) : null}
    </div>
  );
}

type SuggestionsBodyProps = Pick<PredictiveSearchState, "status" | "result">;

function SuggestionsBody({ status, result }: SuggestionsBodyProps) {
  switch (status) {
    case "idle":
      return (
        <div>
          <p className="type-overline text-on-surface-secondary mb-3">Recherches populaires</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TERMS.map((word) => (
              <Link
                key={word}
                to={getSearchResultUrl({ baseUrl: SEARCH_PAGE_PATH, term: word })}
                onClick={() => closeSearchDrawer()}
                className="bg-surface-secondary text-on-surface hover:bg-pastel-rose rounded-full px-3.5 py-2 text-sm font-medium no-underline motion-safe:transition-colors"
              >
                {word}
              </Link>
            ))}
          </div>
        </div>
      );
    case "error":
      return (
        <p role="alert" className="text-critical text-sm">
          Les suggestions sont momentanément indisponibles. Utilisez la page de recherche complète.
        </p>
      );
    case "loading":
      if (result.items.products.length === 0) {
        return <p className="text-on-surface-secondary text-sm">Recherche en cours…</p>;
      }
      return <SuggestionList products={result.items.products} term={result.term} stale />;
    case "success":
      if (result.items.products.length === 0) {
        return (
          <p className="text-on-surface-secondary text-sm">
            Aucun résultat pour « {result.term} ».
          </p>
        );
      }
      return <SuggestionList products={result.items.products} term={result.term} />;
  }
}

type SuggestionListProps = {
  products: readonly PredictiveSearchProductItem[];
  term: string;
  stale?: boolean;
};

function SuggestionList({ products, term, stale = false }: SuggestionListProps) {
  return (
    <ul role="list" className={stale ? "grid gap-1.5 opacity-60" : "grid gap-1.5"}>
      {products.map((product) => (
        <li key={product.id}>
          <SuggestionLink product={product} term={term} />
        </li>
      ))}
    </ul>
  );
}

function SuggestionLink({ product, term }: { product: PredictiveSearchProductItem; term: string }) {
  const variant = product.selectedOrFirstAvailableVariant;
  const image = variant?.image ?? null;

  return (
    <Link
      to={getPredictiveSearchItemUrl(product, { routes: routeTemplates, term })}
      className="hover:bg-surface-secondary focus-visible:outline-accent flex items-center gap-3 rounded-2xl p-2 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors"
      onClick={() => closeSearchDrawer()}
    >
      {image !== null ? (
        <img
          src={shopifyImageUrl(image.url, { width: 104 })}
          srcSet={srcSetFor(image.url, { width: 104 })}
          alt={image.altText ?? ""}
          width={52}
          height={52}
          className="bg-surface-secondary size-13 shrink-0 rounded-xl object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="bg-surface-secondary size-13 shrink-0 rounded-xl" aria-hidden="true" />
      )}
      <span className="flex min-w-0 flex-col">
        <span className="font-heading text-on-surface line-clamp-2 text-sm font-semibold">
          {product.title}
        </span>
        {variant !== null ? (
          <span className="text-primary tabular-nums text-sm font-bold">
            {formatPrice(variant.price)}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
