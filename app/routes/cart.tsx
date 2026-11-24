import { ShopPayButton } from "@shopify/hydrogen/react";
import { useEffect } from "react";
import { Link } from "react-router";

import { publishCartViewed } from "~/components/AnalyticsTrackers";
import { CartLineItem } from "~/components/CartDrawer";
import { useCart } from "~/lib/cart";
import { formatPrice } from "~/lib/money";
import { formatPageTitle, getShopNameFromRootMatch } from "~/lib/storefront-shop";

import type { Route } from "./+types/cart";

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: formatPageTitle("Panier", getShopNameFromRootMatch(matches[0])) }];
}

export default function CartRoute() {
  const cart = useCart((state) => state.data);
  const loading = useCart((state) => state.loading);
  const lines = cart.lines.nodes;

  useEffect(() => {
    publishCartViewed(cart);
  }, [cart]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto w-full flex-1 py-8 md:py-12"
    >
      <h1 id="cart-page-title" tabIndex={-1} className="type-display text-on-surface mb-6 md:mb-8">
        Votre panier
      </h1>
      {loading ? <p className="text-on-surface-secondary">Chargement du panier…</p> : null}
      {!loading && lines.length === 0 ? (
        <div className="bg-surface-elevated border-border rounded-3xl border p-8 text-center">
          <p className="font-heading text-on-surface text-lg font-semibold">
            Votre panier est vide.
          </p>
          <p className="text-on-surface-secondary mt-2 text-sm">
            Vous n&apos;avez pas encore ajouté de squishy à votre panier.
          </p>
          <Link
            to="/collections"
            className="rounded-button button-primary squish-press mt-6 inline-flex h-12 items-center justify-center px-6 text-sm font-semibold no-underline"
          >
            Découvrir les squishies
          </Link>
        </div>
      ) : null}
      {lines.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <ul role="list" className="divide-border divide-y">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} emptyCartFocusId="cart-page-title" />
            ))}
          </ul>
          <aside
            className="border-border bg-surface-elevated h-fit rounded-3xl border p-5 shadow-sm"
            aria-label="Récapitulatif du panier"
          >
            <div className="flex items-center justify-between">
              <span className="text-on-surface text-sm font-semibold">Total estimé</span>
              <span className="text-on-surface tabular-nums text-lg font-bold">
                {formatPrice(cart.cost.totalAmount)}
              </span>
            </div>
            <p className="text-on-surface-secondary mt-2 text-xs">
              Taxes et frais de livraison calculés au passage en caisse.
            </p>
            {cart.checkoutUrl ? (
              <div className="mt-5 grid gap-3">
                <a
                  href={cart.checkoutUrl}
                  className="rounded-button button-primary squish-press focus-visible:outline-accent inline-flex h-12 w-full items-center justify-center gap-2 px-4 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Passer commande
                </a>
                <ShopPayButton width="100%" borderRadius="9999px" />
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </main>
  );
}
