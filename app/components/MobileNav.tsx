import { Link } from "react-router";

import { closeMobileNavDrawer, MOBILE_NAV_DRAWER_ID, openDialogFallback } from "~/lib/cart-drawer";

import { NAV_COLLECTIONS, SquishiesWordmark } from "./Header";

export function MobileNav({ shopName = "Squishies" }: { shopName?: string }) {
  return (
    <dialog
      id={MOBILE_NAV_DRAWER_ID}
      className="drawer-left bg-surface text-on-surface"
      aria-labelledby="mobile-nav-title"
      data-testid="mobile-nav"
      closedby="any"
    >
      <div className="flex h-full flex-col">
        <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-4">
          <span id="mobile-nav-title">
            <SquishiesWordmark name={shopName} className="h-10 w-auto" />
          </span>
          <button
            type="button"
            commandfor={MOBILE_NAV_DRAWER_ID}
            command="close"
            className="button-icon squish-press focus-visible:outline-accent inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-pastel-rose/55 hover:bg-pastel-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Fermer le menu"
            onClick={() => closeMobileNavDrawer()}
          >
            <img src="/icons/icon-x.svg" alt="" className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-6">
            <div>
              <p className="type-overline text-on-surface-secondary mb-2 px-3">Nos univers</p>
              <ul role="list" className="flex flex-col gap-1">
                <li>
                  <Link
                    to="/collections"
                    className="min-h-touch-target text-on-surface hover:bg-surface-secondary flex items-center justify-between rounded-2xl px-3 py-2.5 text-base font-semibold no-underline motion-safe:transition-colors"
                    onClick={() => closeMobileNavDrawer()}
                  >
                    <span>Toutes les collections</span>
                    <span className="text-on-surface-secondary text-sm" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
                {NAV_COLLECTIONS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="min-h-touch-target text-on-surface hover:bg-surface-secondary flex items-center justify-between rounded-2xl px-3 py-2.5 text-base font-medium no-underline motion-safe:transition-colors"
                      onClick={() => closeMobileNavDrawer()}
                    >
                      <span>{item.label}</span>
                      <span className="text-on-surface-secondary text-sm" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/products/calendrier-avent-mystery-dumpling"
              onClick={() => closeMobileNavDrawer()}
              className="bg-festive text-surface block rounded-3xl p-4 no-underline shadow-sm"
            >
              <span className="bg-surface/15 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                Édition Noël
              </span>
              <p className="font-heading mt-2 text-lg font-semibold leading-snug">
                Calendrier de l&apos;Avent Mystery Dumpling
              </p>
              <p className="mt-1 text-xs opacity-90">24 squishies surprises · 30,07 € →</p>
            </Link>

            <div className="border-border border-t pt-4">
              <ul role="list" className="flex flex-col gap-1">
                <li>
                  <Link
                    to="/search"
                    className="min-h-touch-target text-on-surface-secondary hover:bg-surface-secondary hover:text-on-surface flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium no-underline"
                    onClick={() => closeMobileNavDrawer()}
                  >
                    <img src="/icons/icon-search.svg" alt="" className="size-4" aria-hidden="true" />
                    <span>Rechercher un squishy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/account"
                    className="min-h-touch-target text-on-surface-secondary hover:bg-surface-secondary hover:text-on-surface flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium no-underline"
                    onClick={() => closeMobileNavDrawer()}
                  >
                    <img src="/icons/icon-user.svg" alt="" className="size-4" aria-hidden="true" />
                    <span>Mon compte & commandes</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="min-h-touch-target text-on-surface-secondary hover:bg-surface-secondary hover:text-on-surface flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium no-underline"
                    onClick={() => closeMobileNavDrawer()}
                  >
                    <img src="/icons/icon-cart.svg" alt="" className="size-4" aria-hidden="true" />
                    <span>Mon panier</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="border-border bg-surface-secondary/60 pb-safe shrink-0 border-t px-5 pt-3 text-xs text-on-surface-secondary">
          Jouets sensoriels anti-stress non comestibles. Ne pas ingérer.
        </div>
      </div>
    </dialog>
  );
}

export function MobileNavTrigger() {
  return (
    <button
      type="button"
      commandfor={MOBILE_NAV_DRAWER_ID}
      command="show-modal"
      className="button-icon squish-press focus-visible:outline-accent inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-pastel-rose/55 hover:bg-pastel-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-label="Ouvrir le menu"
      aria-controls={MOBILE_NAV_DRAWER_ID}
      aria-haspopup="dialog"
      data-testid="nav-trigger"
      onClick={() => openDialogFallback(MOBILE_NAV_DRAWER_ID)}
    >
      <img src="/icons/icon-menu.svg" alt="" className="size-5" aria-hidden="true" />
    </button>
  );
}
