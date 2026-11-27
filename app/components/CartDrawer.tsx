import { ShopPayButton } from "@shopify/hydrogen/react";
import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "react-router";

import { useCart, useCartForm } from "~/lib/cart";
import { closeCartDrawer, configureOpenCartAction, CART_DRAWER_ID } from "~/lib/cart-drawer";
import { shopifyImageUrl, srcSetFor } from "~/lib/image";
import { formatPrice } from "~/lib/money";

import { publishCartViewed } from "./AnalyticsTrackers";

function CartErrorBanner() {
  const errors = useCart((state) => state.errors);
  const [dismissedAt, setDismissedAt] = useState(0);
  const messages = useMemo(() => {
    const lines = [...errors.lines.values()].flatMap((group) => group.userErrors);
    return [...errors.network, ...errors.cart.userErrors, ...lines].map((error) => error.message);
  }, [errors]);

  if (messages.length === 0 || errors.lastUpdatedAt <= dismissedAt) return null;

  return (
    <div className="border-border bg-surface-secondary mx-4 mb-2 rounded-2xl border p-3 text-sm" role="alert">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          {messages.map((message) => (
            <p key={message} className="text-critical">
              {message}
            </p>
          ))}
        </div>
        <button
          type="button"
          className="button-ghost focus-visible:outline-accent rounded-full px-2.5 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setDismissedAt(errors.lastUpdatedAt)}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function hasPendingCost(pending: {
  cost?: boolean;
  discountCodes: Set<string>;
  lines: Set<string>;
}): boolean {
  return pending.cost ?? (pending.lines.size > 0 || pending.discountCodes.size > 0);
}

function useCartStatusMessage(): string {
  const pending = useCart((state) => state.pending);
  const revalidating = useCart((state) => "revalidating" in state && state.revalidating === true);
  const networkErrors = useCart((state) => state.errors.network);
  const isPending = hasPendingCost(pending) || revalidating;
  const [sawPending, setSawPending] = useState(false);

  useEffect(() => {
    if (isPending) setSawPending(true);
  }, [isPending]);

  if (isPending) return "Mise à jour du panier en cours";
  if (sawPending && networkErrors.length === 0) return "Panier mis à jour";
  return "";
}

type CartLineView = {
  id: string;
  quantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  attributes?: Array<{ key: string; value: string | null }>;
  merchandise?: {
    title?: string | null;
    selectedOptions?: Array<{ name: string; value: string }> | null;
    image?: { url: string; altText?: string | null } | null;
    product?: { title?: string | null; handle?: string | null } | null;
  } | null;
};

export function CartSquishyBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF6FA] to-[#FFE7F2]"
    >
      {/* Soft pastel watercolor glows */}
      <span className="absolute -top-12 -left-10 size-44 rounded-full bg-[#FFE0EE]/55 blur-2xl" />
      <span className="absolute top-1/3 -right-12 size-44 rounded-full bg-[#DFF5EA]/55 blur-2xl" />
      <span className="absolute bottom-16 -left-10 size-40 rounded-full bg-[#EDE0FF]/55 blur-2xl" />

      {/* Cute glossy kawaii Squishy Mochi-Cat peeking from the bottom */}
      <svg
        viewBox="0 0 360 260"
        fill="none"
        className="absolute inset-x-0 bottom-0 h-auto w-full opacity-90"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <radialGradient id="sqBody" cx="38%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#FFF7FB" />
            <stop offset="55%" stopColor="#FFD3E6" />
            <stop offset="100%" stopColor="#FFADC9" />
          </radialGradient>
          <radialGradient id="sqCloud" cx="50%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFEBF4" />
          </radialGradient>
          <radialGradient id="sqHeart" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FF88B4" />
            <stop offset="100%" stopColor="#E84A7F" />
          </radialGradient>
          <radialGradient id="sqBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF7AA8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FF7AA8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floating pastel sparkles & sprinkles */}
        <path
          d="M52 72 L55 81 L64 84 L55 87 L52 96 L49 87 L40 84 L49 81 Z"
          fill="#FF9DC5"
          opacity="0.75"
        />
        <path
          d="M306 58 L309 67 L318 70 L309 73 L306 82 L303 73 L294 70 L303 67 Z"
          fill="#FFD166"
          opacity="0.85"
        />
        <path
          d="M276 112 L278 117 L283 119 L278 121 L276 126 L274 121 L269 119 L274 117 Z"
          fill="#96CCFF"
          opacity="0.8"
        />
        <circle cx="88" cy="120" r="4.5" fill="#B5E896" opacity="0.75" />
        <circle cx="322" cy="128" r="4" fill="#D5B8FF" opacity="0.8" />
        <rect
          x="104"
          y="64"
          width="11"
          height="4.5"
          rx="2.25"
          transform="rotate(-24 104 64)"
          fill="#96CCFF"
          opacity="0.75"
        />
        <rect
          x="244"
          y="50"
          width="11"
          height="4.5"
          rx="2.25"
          transform="rotate(22 244 50)"
          fill="#FF9DC5"
          opacity="0.75"
        />

        {/* Back pastel cloud puffs */}
        <ellipse cx="64" cy="236" rx="76" ry="44" fill="#FFF2F8" />
        <ellipse cx="304" cy="238" rx="82" ry="46" fill="#EDF9F2" />

        {/* Cute chubby Squishy Mochi-Cat */}
        <g transform="translate(180 176)">
          {/* Soft drop shadow on cloud */}
          <ellipse cx="0" cy="54" rx="74" ry="14" fill="#E84A7F" opacity="0.12" />

          {/* Left ear */}
          <path
            d="M-56 -32 C-66 -70 -38 -82 -18 -54 Z"
            fill="url(#sqBody)"
            stroke="#F497BC"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M-49 -38 C-55 -60 -39 -66 -26 -50 Z" fill="#FF9BC2" opacity="0.7" />

          {/* Right ear */}
          <path
            d="M56 -32 C66 -70 38 -82 18 -54 Z"
            fill="url(#sqBody)"
            stroke="#F497BC"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M49 -38 C55 -60 39 -66 26 -50 Z" fill="#FF9BC2" opacity="0.7" />

          {/* Plump mochi squishy body */}
          <path
            d="M-76 12 C-78 -34 -46 -60 0 -60 C46 -60 78 -34 76 12 C74 44 46 56 0 56 C-46 56 -74 44 -76 12 Z"
            fill="url(#sqBody)"
            stroke="#F497BC"
            strokeWidth="2.5"
          />

          {/* Glossy jelly specular highlights */}
          <ellipse
            cx="-28"
            cy="-36"
            rx="22"
            ry="10"
            transform="rotate(-16 -28 -36)"
            fill="#FFFFFF"
            opacity="0.72"
          />
          <circle cx="-50" cy="-22" r="4.5" fill="#FFFFFF" opacity="0.75" />

          {/* Rosy cheeks */}
          <ellipse cx="-38" cy="4" rx="15" ry="10" fill="url(#sqBlush)" />
          <ellipse cx="38" cy="4" rx="15" ry="10" fill="url(#sqBlush)" />

          {/* Big sparkling kawaii eyes */}
          <circle cx="-26" cy="-8" r="9.5" fill="#2A1D36" />
          <circle cx="-29" cy="-11.5" r="3.4" fill="#FFFFFF" />
          <circle cx="-22.5" cy="-5" r="1.7" fill="#FFFFFF" />

          <circle cx="26" cy="-8" r="9.5" fill="#2A1D36" />
          <circle cx="23" cy="-11.5" r="3.4" fill="#FFFFFF" />
          <circle cx="29.5" cy="-5" r="1.7" fill="#FFFFFF" />

          {/* Tiny happy cat smile */}
          <path
            d="M-9 2 Q-4.5 8 0 3 Q4.5 8 9 2"
            stroke="#2A1D36"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Tiny glossy raspberry heart held between chubby paws */}
          <path
            d="M0 37 C0 37 -14 27.5 -14 19.5 C-14 15.2 -10.6 12 -6.5 12 C-3.6 12 -1.2 13.5 0 15.6 C1.2 13.5 3.6 12 6.5 12 C10.6 12 14 15.2 14 19.5 C14 27.5 0 37 0 37 Z"
            fill="url(#sqHeart)"
          />
          <ellipse
            cx="-5"
            cy="17.5"
            rx="3.2"
            ry="1.8"
            transform="rotate(-25 -5 17.5)"
            fill="#FFFFFF"
            opacity="0.65"
          />

          {/* Chubby little squishy paws */}
          <ellipse
            cx="-22"
            cy="28"
            rx="13"
            ry="9.5"
            transform="rotate(18 -22 28)"
            fill="#FFE6F1"
            stroke="#F497BC"
            strokeWidth="2.2"
          />
          <ellipse
            cx="22"
            cy="28"
            rx="13"
            ry="9.5"
            transform="rotate(-18 22 28)"
            fill="#FFE6F1"
            stroke="#F497BC"
            strokeWidth="2.2"
          />
        </g>

        {/* Foreground fluffy pastel clouds framing the bottom edge */}
        <path
          d="M-10 260 L-10 226 Q26 206 66 222 Q108 202 156 226 Q204 206 250 224 Q298 204 370 228 L370 260 Z"
          fill="url(#sqCloud)"
        />
      </svg>
    </div>
  );
}

export function CartLineItem({
  line,
  emptyCartFocusId,
}: {
  line: CartLineView;
  emptyCartFocusId: string;
}) {
  const { formProps, register } = useCartForm();
  const pendingLines = useCart((state) => state.pending.lines);
  const lineError = useCart((state) => state.errors.lines.get(line.id));
  const merchandise = line.merchandise;
  const product = merchandise?.product;
  const pending = pendingLines.has(line.id);
  const optionText = merchandise?.selectedOptions
    ?.filter((option) => option.value !== "Default Title")
    .map((option: { name: string; value: string }) => option.value)
    .join(" / ");
  const errorId = `cart-line-error-${line.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  const moveFocusBeforeRemoval = (event: SubmitEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (!form.contains(document.activeElement)) return;
    const intent = event.nativeEvent.submitter?.getAttribute("value");
    const quantity = new FormData(form).get("quantity");
    const removesLine =
      intent === "remove" ||
      (intent === "decrease" && line.quantity <= 1) ||
      (intent === "set" && Number(quantity) <= 0);
    if (!removesLine) return;

    const item = form.closest("li");
    const neighbour = item?.nextElementSibling ?? item?.previousElementSibling;
    const selector = intent === "set" ? 'input[name="quantity"]' : `button[value="${intent}"]`;
    const target =
      neighbour?.querySelector<HTMLElement>(selector) ?? document.getElementById(emptyCartFocusId);
    target?.focus();
  };

  return (
    <li
      className={`bg-surface-elevated/90 border-border/80 flex gap-3.5 rounded-2xl border p-3 shadow-2xs backdrop-blur-[2px] transition-opacity ${pending ? "opacity-60" : ""}`}
      data-testid="cart-line"
      {...(pending ? { "aria-busy": "true" } : {})}
    >
      <div className="bg-surface-secondary size-20 shrink-0 overflow-hidden rounded-2xl">
        {merchandise?.image ? (
          <img
            src={shopifyImageUrl(merchandise.image.url, { width: 160 })}
            srcSet={srcSetFor(merchandise.image.url, { width: 160 })}
            width={80}
            height={80}
            alt={merchandise.image.altText ?? product?.title ?? merchandise.title ?? ""}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-on-surface text-sm font-semibold leading-snug">
          {product?.handle ? (
            <Link
              to={`/products/${product.handle}`}
              className="text-on-surface no-underline hover:text-primary"
              onClick={() => closeCartDrawer()}
            >
              {product.title ?? merchandise?.title ?? "Produit"}
            </Link>
          ) : (
            (product?.title ?? merchandise?.title ?? "Produit")
          )}
        </p>
        {optionText ? <p className="text-on-surface-secondary mt-1 text-xs">{optionText}</p> : null}
        {line.attributes
          ?.filter((attr) => !attr.key.startsWith("_") && attr.value != null)
          .map((attr) => (
            <p key={attr.key} className="text-on-surface-secondary mt-1 text-xs italic">
              {attr.key} : {attr.value}
            </p>
          ))}
        <p className={`text-on-surface tabular-nums mt-1.5 text-sm font-bold ${pending ? "opacity-50" : ""}`}>
          {formatPrice(line.cost.totalAmount)}
        </p>
        <form
          {...formProps({ beforeSubmit: moveFocusBeforeRemoval })}
          className="mt-2.5 flex items-center gap-2"
        >
          <button {...register("set")} />
          <input type="hidden" {...register("lineId", { value: line.id })} />
          <div className="quantity-selector-outlined bg-surface-elevated inline-flex items-center rounded-full">
            <button
              type="submit"
              {...register("decrease")}
              className="text-on-surface-secondary hover:text-on-surface inline-flex size-11 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-[color,transform] motion-safe:active:scale-[0.90]"
              aria-label={`Diminuer la quantité pour ${product?.title ?? merchandise?.title ?? "l'article"}`}
            >
              <img src="/icons/icon-minus.svg" alt="" className="size-4" aria-hidden="true" />
            </button>
            <input
              {...register("quantity", { value: line.quantity, interactive: true })}
              className={`number-reset text-on-surface tabular-nums h-11 w-10 rounded-none border-0 bg-transparent p-0 text-center text-base font-semibold sm:text-sm ${pending ? "opacity-50" : ""}`}
              aria-label="Quantité"
              aria-describedby={lineError?.userErrors.length ? errorId : undefined}
              aria-invalid={lineError?.userErrors.length ? true : undefined}
            />
            <button
              type="submit"
              {...register("increase")}
              className="text-on-surface-secondary hover:text-on-surface inline-flex size-11 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-[color,transform] motion-safe:active:scale-[0.90]"
              aria-label={`Augmenter la quantité pour ${product?.title ?? merchandise?.title ?? "l'article"}`}
            >
              <img src="/icons/icon-plus.svg" alt="" className="size-4" aria-hidden="true" />
            </button>
          </div>
          <button
            type="submit"
            {...register("remove")}
            className="text-on-surface-secondary hover:text-critical inline-flex size-11 items-center justify-center rounded-full motion-safe:transition-[color,transform] motion-safe:active:scale-[0.90]"
            aria-label={`Supprimer ${product?.title ?? merchandise?.title ?? "l'article"}`}
          >
            <img src="/icons/icon-trash.svg" alt="" className="size-5" aria-hidden="true" />
          </button>
        </form>
        {lineError?.userErrors.length ? (
          <p id={errorId} className="text-critical mt-2 text-sm" role="alert">
            {lineError.userErrors[0]?.message}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function CartLines() {
  const loading = useCart((state) => state.loading);
  const lines = useCart((state) => state.data.lines.nodes);

  if (loading) {
    return <p className="text-on-surface-secondary type-body-sm">Chargement du panier…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-start px-4 pt-12 text-center">
        <div className="bg-surface-elevated/90 border-border/80 rounded-3xl border px-6 py-7 shadow-sm backdrop-blur-xs">
          <div className="bg-pastel-rose mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
            <img src="/icons/icon-cart.svg" alt="" className="size-6 opacity-80" aria-hidden="true" />
          </div>
          <p className="font-heading text-on-surface text-lg font-semibold">
            Votre panier est vide
          </p>
          <p className="text-on-surface-secondary mt-1.5 max-w-xs text-sm">
            Explorez nos squishies craquants, pailletés et coffrets cadeaux pour commencer.
          </p>
          <Link
            to="/collections"
            onClick={() => closeCartDrawer()}
            className="rounded-button button-primary squish-press mt-5 inline-flex h-11 items-center justify-center px-6 text-sm font-semibold no-underline"
          >
            Découvrir les squishies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul role="list" className="flex flex-col gap-3 pb-36">
      {lines.map((line) => (
        <CartLineItem key={line.id} line={line} emptyCartFocusId="cart-drawer-title" />
      ))}
    </ul>
  );
}

function CartFooter() {
  const cart = useCart((state) => state.data);
  const pending = useCart((state) => state.pending);
  const revalidating = useCart((state) => "revalidating" in state && state.revalidating === true);
  const hasLines = cart.lines.nodes.length > 0;
  const isPending = hasPendingCost(pending) || revalidating;

  if (!hasLines) return null;

  return (
    <div className="border-border bg-surface-elevated pb-safe shrink-0 border-t px-4 pt-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between" aria-busy={isPending}>
          <span className="text-on-surface text-sm font-semibold">
            Total estimé
            {isPending ? <span aria-hidden="true"> (mise à jour…)</span> : null}
          </span>
          <span
            className={`text-on-surface tabular-nums text-lg font-bold ${isPending ? "text-on-surface-secondary" : ""}`}
          >
            {formatPrice(cart.cost.totalAmount)}
          </span>
        </div>
        <p className="text-on-surface-secondary text-xs">
          Taxes et frais de livraison calculés au passage en caisse.
        </p>
        {cart.checkoutUrl ? (
          <div className="flex flex-col gap-2.5 pt-1">
            <a
              href={cart.checkoutUrl}
              className="rounded-button button-primary squish-press focus-visible:outline-accent inline-flex h-12 w-full items-center justify-center gap-2 px-4 text-sm font-semibold no-underline shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Passer commande
            </a>
            <ShopPayButton width="100%" borderRadius="9999px" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CartDrawer() {
  const totalQuantity = useCart((state) => state.data.totalQuantity);
  const cart = useCart((state) => state.data);
  const statusMessage = useCartStatusMessage();

  useEffect(() => {
    configureOpenCartAction();
    const dialog = document.getElementById(CART_DRAWER_ID);
    if (!(dialog instanceof HTMLDialogElement)) return;
    const handleToggle = () => {
      if (dialog.open) publishCartViewed(cart);
    };
    dialog.addEventListener("toggle", handleToggle);
    return () => dialog.removeEventListener("toggle", handleToggle);
  }, [cart]);

  return (
    <>
      <span
        role="status"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        data-cart-status
      >
        {statusMessage}
      </span>
      <dialog
        id={CART_DRAWER_ID}
        className="drawer-right bg-surface text-on-surface"
        aria-labelledby="cart-drawer-title"
        data-testid="cart-drawer"
        closedby="any"
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="border-border bg-surface/95 flex h-14 shrink-0 items-center border-b ps-4 pe-2">
            <div className="flex flex-1 items-center gap-2">
              <h2
                id="cart-drawer-title"
                tabIndex={-1}
                className="font-heading text-on-surface text-lg font-semibold"
              >
                Votre panier
              </h2>
              <span className="cart-count-badge bg-pastel-rose text-primary tabular-nums font-bold">
                {totalQuantity}
              </span>
            </div>
            <button
              type="button"
              commandfor={CART_DRAWER_ID}
              command="close"
              className="button-icon squish-press focus-visible:outline-accent inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-pastel-rose/55 hover:bg-pastel-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Fermer le panier"
              onClick={() => closeCartDrawer()}
            >
              <img src="/icons/icon-x.svg" alt="" className="size-5" aria-hidden="true" />
            </button>
          </div>
          <CartErrorBanner />
          <div className="relative flex-1 overflow-hidden">
            <CartSquishyBackdrop />
            <div className="relative z-10 h-full overflow-y-auto p-4">
              <CartLines />
            </div>
          </div>
          <CartFooter />
        </div>
      </dialog>
    </>
  );
}
