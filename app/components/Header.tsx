import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import { useCart } from "~/lib/cart";
import { CART_DRAWER_ID, SEARCH_DRAWER_ID, openDialogFromLinkClick } from "~/lib/cart-drawer";
import type { StorefrontShop } from "~/lib/storefront-shop";

import { MobileNav, MobileNavTrigger } from "./MobileNav";

export const NAV_COLLECTIONS = [
  {
    label: "Mystery Dumplings",
    to: "/collections/mystery-dumplings",
    desc: "Pailletés en panier vapeur",
    pillBg: "bg-[#DFF0FF] text-[#0E4A8A]",
  },
  {
    label: "Format XXL",
    to: "/collections/squishies-xxl",
    desc: "Fraise & grappe géantes",
    pillBg: "bg-[#FFE6DA] text-[#9A3412]",
  },
  {
    label: "Crispy & Craquants",
    to: "/collections/crispy-et-craquants",
    desc: "Texture crépitante anti-stress",
    pillBg: "bg-[#E3F9D4] text-[#255910]",
  },
  {
    label: "Gourmandises & Fruits",
    to: "/collections/gourmandises-et-fruits",
    desc: "Donut, beurre, pêche & fruits",
    pillBg: "bg-[#FFF0CC] text-[#7A4200]",
  },
  {
    label: "Animaux Kawaii",
    to: "/collections/animaux-kawaii",
    desc: "Lapin, hippocampe & licorne",
    pillBg: "bg-[#F2E3FF] text-[#5A1E94]",
  },
  {
    label: "Noël & Cadeaux",
    to: "/collections/noel-et-cadeaux",
    desc: "Calendrier 24 surprises & coffrets",
    pillBg: "bg-[#D8F3E5] text-[#145339]",
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
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const logo = shopInfo.logo;

  useEffect(() => {
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMegaOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [megaOpen]);

  const isCollectionPage = pathname.startsWith("/collections");

  return (
    <header className="border-border bg-surface/95 sticky top-0 z-40 border-b backdrop-blur-md">
      <div
        className="max-w-page px-margin mx-auto grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-2 lg:flex lg:h-[76px] lg:justify-between lg:gap-6"
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
          className="hidden items-center gap-1.5 lg:flex"
          data-desktop-nav
        >
          <Link
            to="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`font-heading squish-press focus-visible:outline-accent rounded-full px-4 py-2 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              pathname === "/"
                ? "bg-pastel-rose text-primary"
                : "text-on-surface hover:bg-pastel-rose/60 hover:text-primary"
            }`}
          >
            Accueil
          </Link>

          <div
            ref={megaRef}
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onClick={() => setMegaOpen((open) => !open)}
              className={`font-heading squish-press focus-visible:outline-accent inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                megaOpen || isCollectionPage
                  ? "bg-pastel-rose text-primary"
                  : "text-on-surface hover:bg-pastel-rose/60 hover:text-primary"
              }`}
            >
              <span>Nos univers</span>
              <svg
                viewBox="0 0 16 16"
                className={`size-3.5 motion-safe:transition-transform motion-safe:duration-200 ${megaOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {megaOpen ? (
              <div className="absolute top-full left-1/2 z-50 w-[540px] -translate-x-1/2 pt-3">
                <div className="bg-surface-elevated border-border/90 overflow-hidden rounded-3xl border p-4 shadow-[0_24px_48px_-18px_rgba(35,25,45,0.22)]">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <p className="type-overline text-primary">Explorer par univers</p>
                    <Link
                      to="/collections"
                      onClick={() => setMegaOpen(false)}
                      className="text-on-surface-secondary hover:text-primary text-xs font-semibold no-underline"
                    >
                      Toutes les collections →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {NAV_COLLECTIONS.map((item) => {
                      const active = pathname === item.to;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMegaOpen(false)}
                          className={`group flex items-start gap-3 rounded-2xl border p-3 no-underline motion-safe:transition-colors ${
                            active
                              ? "border-primary/40 bg-pastel-rose/40"
                              : "border-transparent bg-surface-secondary/60 hover:border-border hover:bg-surface-secondary"
                          }`}
                        >
                          <span
                            className={`${item.pillBg} mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold`}
                            aria-hidden="true"
                          >
                            ✦
                          </span>
                          <span className="min-w-0">
                            <span className="font-heading text-on-surface group-hover:text-primary block text-sm font-semibold">
                              {item.label}
                            </span>
                            <span className="text-on-surface-secondary mt-0.5 block text-xs leading-snug">
                              {item.desc}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <Link
            to="/collections/squishies-xxl"
            aria-current={pathname === "/collections/squishies-xxl" ? "page" : undefined}
            className={`font-heading squish-press focus-visible:outline-accent inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              pathname === "/collections/squishies-xxl"
                ? "bg-[#FFE6DA] text-[#9A3412]"
                : "text-on-surface hover:bg-[#FFE6DA]/80 hover:text-[#9A3412]"
            }`}
          >
            <span>Format XXL</span>
          </Link>

          <Link
            to="/collections/noel-et-cadeaux"
            aria-current={pathname === "/collections/noel-et-cadeaux" ? "page" : undefined}
            className="font-heading bg-festive text-surface squish-press focus-visible:outline-accent inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold no-underline shadow-xs hover:opacity-92 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span>Édition Noël</span>
          </Link>
        </nav>

        <div className="flex shrink-0 items-center justify-self-end gap-1.5">
          <Link
            to="/search"
            className="button-icon squish-press focus-visible:outline-accent inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full font-medium hover:bg-surface-secondary no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:h-10 lg:w-auto lg:gap-2 lg:border lg:border-border lg:bg-surface-secondary/75 lg:px-3.5 lg:text-xs lg:font-medium lg:text-on-surface-secondary lg:hover:border-primary/40 lg:hover:text-on-surface"
            aria-label="Rechercher"
            aria-controls={SEARCH_DRAWER_ID}
            aria-haspopup="dialog"
            data-testid="search-trigger"
            onClick={(event) => openDialogFromLinkClick(event, SEARCH_DRAWER_ID)}
          >
            <img src="/icons/icon-search.svg" alt="" className="size-4 lg:size-4" aria-hidden="true" />
            <span className="hidden xl:inline">Rechercher un squishy…</span>
          </Link>
          <Link
            to="/account"
            className="text-on-surface hover:bg-surface-secondary focus-visible:outline-accent hidden h-10 w-10 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors lg:inline-flex"
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
      <MobileNav shopName={shopInfo.name} />
    </header>
  );
}
