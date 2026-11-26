import { useState } from "react";
import { Link } from "react-router";

import { useCart } from "~/lib/cart";
import { CART_DRAWER_ID, SEARCH_DRAWER_ID, openDialogFromLinkClick } from "~/lib/cart-drawer";
import type { StorefrontShop } from "~/lib/storefront-shop";

import { MobileNav, MobileNavTrigger } from "./MobileNav";

export const NAV_COLLECTIONS = [
  { label: "Mystery Dumplings", to: "/collections/mystery-dumplings" },
  { label: "Format XXL", to: "/collections/squishies-xxl" },
  { label: "Crispy & Craquants", to: "/collections/crispy-et-craquants" },
  { label: "Gourmandises & Fruits", to: "/collections/gourmandises-et-fruits" },
  { label: "Animaux Kawaii", to: "/collections/animaux-kawaii" },
  { label: "Noël & Cadeaux", to: "/collections/noel-et-cadeaux" },
] as const;

function cartCountLabel(count: number) {
  return count === 1 ? "Panier (1 article)" : `Panier (${count} articles)`;
}

function liveCartCountLabel(count: number) {
  return count === 1 ? "1 article dans le panier" : `${count} articles dans le panier`;
}

function displayCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function SquishiesWordmark({
  name,
  className = "h-10 w-auto sm:h-11 md:h-12",
}: {
  name: string;
  className?: string;
}) {
  return (
    <img
      src="/images/logo-squishy.webp"
      alt={name}
      width={360}
      height={130}
      className={`${className} max-w-full object-contain drop-shadow-[0_1px_2px_rgba(35,25,45,0.08)]`}
      loading="eager"
      decoding="async"
    />
  );
}

export function Header({ shopInfo }: { shopInfo: StorefrontShop }) {
  const totalQuantity = useCart((state) => state.data.totalQuantity);
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const logo = shopInfo.logo;

  return (
    <header className="border-border bg-surface/92 sticky top-0 z-40 border-b backdrop-blur-md">
      <div
        className="max-w-page px-margin mx-auto grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-2 lg:flex lg:h-[72px] lg:justify-between"
        data-header-nav-group
      >
        <div className="-ms-2 flex items-center justify-self-start lg:hidden" data-hamburger-wrapper>
          <MobileNavTrigger />
        </div>

        <div className="flex min-w-0 items-center justify-self-center lg:shrink-0 lg:justify-self-start">
          <Link
            to="/"
            aria-label={shopInfo.name}
            title={shopInfo.name}
            className="text-on-surface focus-visible:outline-accent inline-flex max-w-36 min-w-0 items-center justify-center rounded-xl py-1 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-48"
          >
            {logo && failedLogoUrl !== logo.url ? (
              <img
                src={logo.url}
                alt={logo.altText ?? shopInfo.name}
                width={logo.width ?? undefined}
                height={logo.height ?? undefined}
                className="h-auto max-h-11 w-auto max-w-full object-contain"
                ref={(img) => {
                  if (img?.complete && img.naturalWidth === 0) setFailedLogoUrl(logo.url);
                }}
                onError={() => setFailedLogoUrl(logo.url)}
              />
            ) : (
              <SquishiesWordmark name={shopInfo.name} />
            )}
          </Link>
        </div>

        <nav
          aria-label="Navigation principale"
          className="mx-3 hidden flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1.5"
          data-desktop-nav
        >
          {NAV_COLLECTIONS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-on-surface hover:bg-surface-secondary focus-visible:outline-accent shrink-0 rounded-full px-2.5 py-2 text-[13px] font-medium whitespace-nowrap no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors xl:px-3.5 xl:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-self-end gap-0.5">
          <Link
            to="/search"
            className="button-icon squish-press focus-visible:outline-accent inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full font-medium hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Rechercher"
            aria-controls={SEARCH_DRAWER_ID}
            aria-haspopup="dialog"
            data-testid="search-trigger"
            onClick={(event) => openDialogFromLinkClick(event, SEARCH_DRAWER_ID)}
          >
            <img src="/icons/icon-search.svg" alt="" className="size-5" aria-hidden="true" />
          </Link>
          <Link
            to="/account"
            className="text-on-surface hover:bg-surface-secondary focus-visible:outline-accent hidden h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors md:inline-flex"
            aria-label="Mon compte"
          >
            <img src="/icons/icon-user.svg" alt="" className="size-5" aria-hidden="true" />
          </Link>
          <Link
            to="/cart"
            className="text-on-surface hover:bg-surface-secondary squish-press focus-visible:outline-accent relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label={cartCountLabel(totalQuantity)}
            aria-controls={CART_DRAWER_ID}
            aria-haspopup="dialog"
            data-testid="cart-trigger"
            onClick={(event) => openDialogFromLinkClick(event, CART_DRAWER_ID)}
          >
            <span
              className="relative inline-flex size-5 shrink-0 items-center justify-center"
              aria-hidden="true"
            >
              <img src="/icons/icon-cart.svg" alt="" className="size-5" />
              {totalQuantity > 0 ? (
                <span className="bg-primary text-interactive-text tabular-nums absolute end-0 top-0 flex h-5 min-w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1 text-[11px] font-bold shadow-sm">
                  {displayCount(totalQuantity)}
                </span>
              ) : null}
            </span>
          </Link>
          <span aria-live="polite" aria-atomic="true" className="sr-only">
            {liveCartCountLabel(totalQuantity)}
          </span>
        </div>
      </div>
      <MobileNav shopName={shopInfo.name} />
    </header>
  );
}
