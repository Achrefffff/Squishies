import { useState } from "react";
import { Link, useLocation } from "react-router";

import { useCart } from "~/lib/cart";
import { CART_DRAWER_ID, SEARCH_DRAWER_ID, openDialogFromLinkClick } from "~/lib/cart-drawer";
import type { StorefrontShop } from "~/lib/storefront-shop";

import { MobileNav, MobileNavTrigger } from "./MobileNav";

export const NAV_COLLECTIONS = [
  {
    label: "Mystery Dumplings",
    to: "/collections/mystery-dumplings",
    idleClass: "bg-[#E8F4FF] text-[#0E4A8A] border-[#B8DCFF] hover:bg-[#D6ECFF]",
    activeClass: "bg-[#1E88E5] text-white border-[#1565C0] shadow-xs",
  },
  {
    label: "Format XXL",
    to: "/collections/squishies-xxl",
    idleClass: "bg-[#FFECE2] text-[#9A3412] border-[#FFC7AE] hover:bg-[#FFDEC9]",
    activeClass: "bg-[#EA580C] text-white border-[#C2410C] shadow-xs",
  },
  {
    label: "Crispy & Craquants",
    to: "/collections/crispy-et-craquants",
    idleClass: "bg-[#EAFAE0] text-[#255910] border-[#B5E896] hover:bg-[#D9F6C6]",
    activeClass: "bg-[#3FA322] text-white border-[#2E7D17] shadow-xs",
  },
  {
    label: "Gourmandises & Fruits",
    to: "/collections/gourmandises-et-fruits",
    idleClass: "bg-[#FFF4D6] text-[#7A4200] border-[#FFD980] hover:bg-[#FFEBB8]",
    activeClass: "bg-[#E68A00] text-white border-[#B86E00] shadow-xs",
  },
  {
    label: "Animaux Kawaii",
    to: "/collections/animaux-kawaii",
    idleClass: "bg-[#F5EAFF] text-[#5A1E94] border-[#DAC0FF] hover:bg-[#EBD6FF]",
    activeClass: "bg-[#8B35DB] text-white border-[#6B21A8] shadow-xs",
  },
  {
    label: "Noël & Cadeaux",
    to: "/collections/noel-et-cadeaux",
    idleClass: "bg-[#E1F5EB] text-[#145339] border-[#A7DFC3] hover:bg-[#CBEEDB]",
    activeClass: "bg-festive text-surface border-festive shadow-xs",
  },
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
  const { pathname } = useLocation();
  const logo = shopInfo.logo;

  return (
    <header className="border-border bg-surface/95 sticky top-0 z-40 border-b backdrop-blur-md">
      {/* Ligne 1 : Recherche (gauche) · Logo centré star · Compte & Panier (droite) */}
      <div
        className="max-w-page px-margin mx-auto grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-2 lg:h-[74px]"
        data-header-nav-group
      >
        <div className="flex items-center justify-self-start">
          <div className="-ms-2 lg:hidden" data-hamburger-wrapper>
            <MobileNavTrigger />
          </div>
          <Link
            to="/search"
            className="squish-press focus-visible:outline-accent hidden h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface-secondary/75 px-4 text-xs font-medium text-on-surface-secondary no-underline hover:border-primary/40 hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:inline-flex"
            aria-label="Rechercher un squishy"
            aria-controls={SEARCH_DRAWER_ID}
            aria-haspopup="dialog"
            onClick={(event) => openDialogFromLinkClick(event, SEARCH_DRAWER_ID)}
          >
            <img src="/icons/icon-search.svg" alt="" className="size-4" aria-hidden="true" />
            <span>Rechercher un squishy…</span>
          </Link>
        </div>

        <div className="flex min-w-0 items-center justify-self-center">
          <Link
            to="/"
            aria-label={shopInfo.name}
            title={shopInfo.name}
            className="text-on-surface focus-visible:outline-accent inline-flex max-w-36 min-w-0 items-center justify-center rounded-xl py-1 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-52"
          >
            {logo && failedLogoUrl !== logo.url ? (
              <img
                src={logo.url}
                alt={logo.altText ?? shopInfo.name}
                width={logo.width ?? undefined}
                height={logo.height ?? undefined}
                className="h-auto max-h-11 w-auto max-w-full object-contain lg:max-h-14"
                ref={(img) => {
                  if (img?.complete && img.naturalWidth === 0) setFailedLogoUrl(logo.url);
                }}
                onError={() => setFailedLogoUrl(logo.url)}
              />
            ) : (
              <SquishiesWordmark name={shopInfo.name} className="h-10 w-auto sm:h-11 lg:h-14" />
            )}
          </Link>
        </div>

        <div className="flex shrink-0 items-center justify-self-end gap-1">
          <Link
            to="/search"
            className="button-icon squish-press focus-visible:outline-accent inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full font-medium hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
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
            className="text-on-surface hover:bg-pastel-rose/60 focus-visible:outline-accent hidden h-10 w-10 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors lg:inline-flex"
            aria-label="Mon compte"
          >
            <img src="/icons/icon-user.svg" alt="" className="size-5" aria-hidden="true" />
          </Link>
          <Link
            to="/cart"
            className="text-on-surface hover:bg-surface-secondary squish-press focus-visible:outline-accent relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:h-10 lg:w-auto lg:gap-2 lg:bg-primary lg:px-4 lg:text-sm lg:font-bold lg:text-interactive-text lg:shadow-sm lg:hover:bg-primary-hover"
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
              <img src="/icons/icon-cart.svg" alt="" className="size-5 lg:brightness-0 lg:invert" />
              {totalQuantity > 0 ? (
                <span className="bg-primary text-interactive-text tabular-nums absolute end-0 top-0 flex h-5 min-w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1 text-[11px] font-bold shadow-sm lg:hidden">
                  {displayCount(totalQuantity)}
                </span>
              ) : null}
            </span>
            <span className="hidden lg:inline">Panier</span>
            {totalQuantity > 0 ? (
              <span className="text-primary tabular-nums hidden h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-extrabold lg:inline-flex">
                {displayCount(totalQuantity)}
              </span>
            ) : null}
          </Link>
          <span aria-live="polite" aria-atomic="true" className="sr-only">
            {liveCartCountLabel(totalQuantity)}
          </span>
        </div>
      </div>

      {/* Ligne 2 desktop : fines pilules pastel centrées */}
      <nav
        aria-label="Navigation principale"
        className="hidden border-t border-[#F4DFEA] bg-surface-secondary/45 py-2.5 lg:block"
        data-desktop-nav
      >
        <div className="max-w-page px-margin mx-auto flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`font-heading squish-press focus-visible:outline-accent rounded-full border px-3.5 py-1 text-xs font-semibold whitespace-nowrap no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 xl:text-[13px] ${
              pathname === "/"
                ? "border-[#D93275] bg-[#FF4D94] text-white shadow-xs"
                : "border-[#FFBAD5] bg-[#FFEBF3] text-[#A81652] hover:bg-[#FFD9E8]"
            }`}
          >
            Accueil
          </Link>
          {NAV_COLLECTIONS.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={`font-heading squish-press focus-visible:outline-accent rounded-full border px-3.5 py-1 text-xs font-semibold whitespace-nowrap no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 xl:text-[13px] ${
                  isActive ? item.activeClass : item.idleClass
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <MobileNav shopName={shopInfo.name} />
    </header>
  );
}
