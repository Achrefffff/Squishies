import { gql } from "@shopify/hydrogen/customer-account";
import { Link, useNavigation } from "react-router";

import { customerAccountContext } from "~/lib/customer-account";
import { formatPrice } from "~/lib/money";
import { formatPageTitle, getShopNameFromRootMatch } from "~/lib/storefront-shop";

import type { Route } from "./+types/account";

const ORDERS_PAGE_SIZE = 10;

const ACCOUNT_QUERY = gql(`
  query AccountPage($first: Int, $after: String, $last: Int, $before: String) {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(
        first: $first
        after: $after
        last: $last
        before: $before
        sortKey: PROCESSED_AT
        reverse: true
      ) {
        nodes {
          id
          name
          processedAt
          financialStatus
          statusPageUrl
          totalPrice {
            amount
            currencyCode
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`);

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" });

const buttonClass =
  "rounded-button squish-press focus-visible:outline-accent inline-flex h-11 items-center justify-center px-6 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: formatPageTitle("Mon compte", getShopNameFromRootMatch(matches[0])) }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const customerAccount = context.get(customerAccountContext);
  if (!customerAccount) return { status: "unavailable" } as const;

  const { client, session, sessionManager, requestContext } = customerAccount;
  const accessToken = await session.getOrRefreshAccessToken(sessionManager, requestContext);
  const searchParams = new URL(request.url).searchParams;
  if (!accessToken) {
    return { status: "signed-out", loginFailed: searchParams.get("login") === "failed" } as const;
  }

  const before = searchParams.get("before");
  const variables = before
    ? { last: ORDERS_PAGE_SIZE, before }
    : { first: ORDERS_PAGE_SIZE, after: searchParams.get("after") };

  try {
    const { data, errors } = await client.graphql(ACCOUNT_QUERY, { accessToken, variables });
    if (errors || !data.customer) {
      return {
        status: "error",
        message: errors?.[0]?.message ?? "Compte client introuvable.",
      } as const;
    }
    return { status: "signed-in", customer: data.customer } as const;
  } catch {
    return {
      status: "error",
      message: "Impossible de charger votre compte pour le moment. Réessayez plus tard.",
    } as const;
  }
}

export default function AccountRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto w-full flex-1 py-8 md:py-12"
    >
      <h1 className="type-display text-on-surface mb-6 md:mb-8">Mon compte</h1>
      {loaderData.status === "unavailable" ? <Unavailable /> : null}
      {loaderData.status === "signed-out" ? <SignIn loginFailed={loaderData.loginFailed} /> : null}
      {loaderData.status === "error" ? (
        <>
          <p role="alert" className="border-border bg-surface-secondary rounded-2xl border p-4">
            {loaderData.message}
          </p>
          <LogoutForm />
        </>
      ) : null}
      {loaderData.status === "signed-in" ? <Customer customer={loaderData.customer} /> : null}
    </main>
  );
}

function Unavailable() {
  return (
    <section
      className="border-border bg-surface-elevated rounded-3xl border p-6 sm:p-8"
      aria-labelledby="unavailable-heading"
    >
      <h2 id="unavailable-heading" className="type-heading-md text-on-surface mb-3">
        Espace client disponible en HTTPS
      </h2>
      <p className="text-on-surface-secondary max-w-xl text-sm leading-relaxed">
        La connexion au compte client nécessite HTTPS (actif automatiquement sur Oxygen, ou via{" "}
        <code>npm run dev:https</code> en local).
      </p>
    </section>
  );
}

function SignIn({ loginFailed }: { loginFailed: boolean }) {
  return (
    <section
      className="border-border bg-surface-elevated rounded-3xl border p-6 sm:p-8"
      aria-labelledby="sign-in-heading"
    >
      <h2 id="sign-in-heading" className="type-heading-md text-on-surface mb-2">
        Connexion
      </h2>
      <p className="text-on-surface-secondary mb-6 max-w-xl text-sm">
        Connectez-vous pour retrouver l&apos;historique et le suivi de vos commandes Squishies.
      </p>
      {loginFailed ? (
        <p role="alert" className="border-border bg-surface-secondary mb-6 rounded-2xl border p-4 text-sm">
          La connexion a échoué. Veuillez réessayer.
        </p>
      ) : null}
      <a href="/account/login" className={`button-primary ${buttonClass}`}>
        Se connecter
      </a>
    </section>
  );
}

function LogoutForm() {
  return (
    <form method="post" action="/account/logout" className="mt-6">
      <button type="submit" className={`button-outline cursor-pointer ${buttonClass}`}>
        Se déconnecter
      </button>
    </form>
  );
}

type Customer = Extract<Route.ComponentProps["loaderData"], { status: "signed-in" }>["customer"];

function Customer({ customer }: { customer: Customer }) {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="type-heading-md text-on-surface mb-2">
          {name || "Votre profil"}
        </h2>
        {customer.emailAddress?.emailAddress ? (
          <p className="text-on-surface-secondary text-sm">{customer.emailAddress.emailAddress}</p>
        ) : null}
        <LogoutForm />
      </section>
      <Orders orders={customer.orders} />
    </div>
  );
}

function Orders({ orders }: { orders: Customer["orders"] }) {
  const navigation = useNavigation();
  const isPaging = navigation.state === "loading" && navigation.location?.pathname === "/account";
  const { pageInfo } = orders;

  return (
    <section aria-labelledby="orders-heading">
      <h2 id="orders-heading" className="type-heading-md text-on-surface mb-4">
        Commandes
      </h2>
      {orders.nodes.length === 0 ? (
        <div className="bg-surface-elevated border-border rounded-3xl border p-6">
          <p className="text-on-surface font-semibold">Vous n&apos;avez pas encore passé de commande.</p>
          <Link to="/collections" className={`button-primary mt-5 ${buttonClass}`}>
            Découvrir les squishies
          </Link>
        </div>
      ) : (
        <ul
          role="list"
          aria-busy={isPaging}
          className={`divide-border divide-y ${isPaging ? "opacity-50" : ""}`}
        >
          {orders.nodes.map((order) => (
            <li key={order.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-4">
              <a
                href={order.statusPageUrl}
                className="text-on-surface font-semibold underline-offset-4 hover:underline"
              >
                Commande {order.name}
              </a>
              <time dateTime={order.processedAt} className="text-on-surface-secondary text-sm">
                {dateFormat.format(new Date(order.processedAt))}
              </time>
              <span className="text-on-surface-secondary text-sm">
                {formatStatus(order.financialStatus)}
              </span>
              <span className="text-on-surface tabular-nums ms-auto font-bold">
                {formatPrice(order.totalPrice)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {pageInfo.hasPreviousPage || pageInfo.hasNextPage ? (
        <nav aria-label="Pagination des commandes" className="mt-6 flex justify-between gap-4">
          {pageInfo.hasPreviousPage && pageInfo.startCursor ? (
            <Link
              to={`?before=${encodeURIComponent(pageInfo.startCursor)}`}
              preventScrollReset
              className={`button-outline ${buttonClass}`}
            >
              Plus récentes
            </Link>
          ) : (
            <span />
          )}
          {pageInfo.hasNextPage && pageInfo.endCursor ? (
            <Link
              to={`?after=${encodeURIComponent(pageInfo.endCursor)}`}
              preventScrollReset
              className={`button-outline ${buttonClass}`}
            >
              Plus anciennes
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}

function formatStatus(status: string | null | undefined) {
  if (!status) return "";
  const text = status.toLowerCase().replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
