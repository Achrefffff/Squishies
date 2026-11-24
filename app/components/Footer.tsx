import { Link } from "react-router";

import type { StorefrontShop } from "~/lib/storefront-shop";

import { NAV_COLLECTIONS, SquishiesWordmark } from "./Header";
import { PaymentMethodIcon } from "./PaymentMethodIcon";

const linkClass =
  "min-h-touch-target text-on-surface-secondary hover:text-primary focus-visible:outline-accent inline-flex items-center text-sm font-medium no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-colors";

export function Footer({ shopInfo }: { shopInfo: StorefrontShop }) {
  return (
    <footer className="border-border bg-surface-secondary/70 mt-12 w-full border-t">
      <div className="max-w-page px-margin mx-auto w-full py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 wrap-anywhere">
            <SquishiesWordmark name={shopInfo.name} className="h-12 w-auto sm:h-14" />
            <p className="text-on-surface-secondary mt-3 max-w-xs text-sm leading-relaxed">
              Squishies kawaii, craquants et pailletés à collectionner et presser sans modération.
            </p>
            <p className="bg-surface-elevated border-border text-on-surface-secondary mt-4 inline-block rounded-2xl border px-3 py-2 text-xs leading-relaxed">
              Jouets sensoriels anti-stress non comestibles. Ne pas ingérer. Âge recommandé indiqué
              sur chaque fiche produit (3+ ou 6+).
            </p>
          </div>

          <nav aria-labelledby="footer-collections-heading">
            <h2
              id="footer-collections-heading"
              className="font-heading text-on-surface mb-2 text-base font-semibold"
            >
              Nos univers
            </h2>
            <ul role="list" className="flex flex-col">
              {NAV_COLLECTIONS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-customer-care-heading">
            <h2
              className="font-heading text-on-surface mb-2 text-base font-semibold"
              id="footer-customer-care-heading"
            >
              Boutique
            </h2>
            <ul role="list" className="flex flex-col">
              <li>
                <Link to="/collections" className={linkClass}>
                  Toutes les collections
                </Link>
              </li>
              <li>
                <Link to="/search" className={linkClass}>
                  Rechercher
                </Link>
              </li>
              <li>
                <Link to="/account" className={linkClass}>
                  Mon compte
                </Link>
              </li>
              <li>
                <Link to="/cart" className={linkClass}>
                  Mon panier
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2
              id="footer-payment-methods-heading"
              className="font-heading text-on-surface mb-3 text-base font-semibold"
            >
              Paiement sécurisé
            </h2>
            {shopInfo.paymentMethods.length > 0 ? (
              <ul
                role="list"
                aria-labelledby="footer-payment-methods-heading"
                className="flex flex-wrap items-center gap-2"
              >
                {shopInfo.paymentMethods.map((method) => (
                  <li key={method} className="max-w-full">
                    <PaymentMethodIcon method={method} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-on-surface-secondary text-sm">
                Paiement chiffré et sécurisé par Shopify Checkout.
              </p>
            )}
          </div>
        </div>

        <div className="border-border text-on-surface-secondary mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {shopInfo.name}. Tous droits réservés.</p>
          <p>Propulsé par Shopify Hydrogen &amp; Oxygen</p>
        </div>
      </div>
    </footer>
  );
}
