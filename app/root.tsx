import { handleShopifyRedirects, handleShopifyRoutes } from "@shopify/hydrogen";
import { ShopifyScripts } from "@shopify/hydrogen/react";
import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useRouteLoaderData,
} from "react-router";

import { CartAnalyticsTracker, PageViewedTracker } from "~/components/AnalyticsTrackers";
import { AnnouncementBar } from "~/components/AnnouncementBar";
import { CartDrawer } from "~/components/CartDrawer";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { MobileIntroVideo } from "~/components/MobileIntroVideo";
import { SearchDrawer } from "~/components/SearchDrawer";
import { CartProvider } from "~/lib/cart";
import { cartHandlers } from "~/lib/cart-handlers";
import { createRequestCustomerAccount, customerAccountContext } from "~/lib/customer-account";
import { envContext } from "~/lib/env";
import { predictiveSearchHandlers } from "~/lib/predictive-search-handlers";
import { loadRootLayout } from "~/lib/root-layout";
import { routeTemplates } from "~/lib/route-templates";
import { createEphemeralSessionManager } from "~/lib/session";
import { analyticsConsent, resolveShopIdentity, storefrontConfig } from "~/lib/shop";
import {
  createRequestStorefrontClient,
  storefrontClientContext,
  storefrontRequestContext,
} from "~/lib/storefront";

import type { Route } from "./+types/root";

import appStylesHref from "./app.css?url";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://cdn.shopify.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  },
  { rel: "stylesheet", href: appStylesHref },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export const middleware: Route.MiddlewareFunction[] = [
  async ({ context, request }, next) => {
    const env = context.get(envContext);
    const storefrontClient = createRequestStorefrontClient(
      request,
      env,
      context.cache,
      context.waitUntil,
    );
    const requestContext = storefrontClient.requestContext;
    const customerAccount = await createRequestCustomerAccount(request, env, requestContext);
    const sessionManager =
      customerAccount?.customerAccount.sessionManager ?? createEphemeralSessionManager(request);

    const shopifyRoute = handleShopifyRoutes({
      request,
      requestContext,
      sessionManager,
      storefrontClient,
      routeTemplates,
      handlers: customerAccount
        ? [cartHandlers, predictiveSearchHandlers, customerAccount.handlers]
        : [cartHandlers, predictiveSearchHandlers],
    });

    if (shopifyRoute) return shopifyRoute;

    context.set(storefrontClientContext, storefrontClient);
    context.set(storefrontRequestContext, requestContext);
    context.set(customerAccountContext, customerAccount?.customerAccount ?? null);

    const response = await next();
    const sessionHeaders = new Headers((await sessionManager.commit?.()) ?? undefined);
    for (const [name, value] of sessionHeaders) response.headers.append(name, value);
    if (response.status === 404) {
      const redirect = await handleShopifyRedirects({
        request,
        storefrontClient,
        routeTemplates,
      });

      if (redirect) return redirect;
    }

    requestContext.applyResponseHeaders(response.headers);
    return response;
  },
];

export async function loader({ context, request }: Route.LoaderArgs) {
  const env = context.get(envContext);
  const storefrontClient = context.get(storefrontClientContext);
  const [cartResult, layout] = await Promise.all([
    cartHandlers.get({ storefrontClient, request }),
    loadRootLayout(storefrontClient),
  ]);

  return {
    cartData: cartResult.data,
    shopInfo: layout.shopInfo,
    shopIdentity: resolveShopIdentity(env, layout.shopId),
    currency: layout.currency,
  };
}

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  // Absent when the root loader failed (error page only).
  const rootData = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FFFDF9" />
        {rootData ? (
          <ShopifyScripts
            i18n={{ ...storefrontConfig.i18n, currency: rootData.currency }}
            shop={rootData.shopIdentity.scriptShop}
            analytics={{ channel: rootData.shopIdentity.analyticsShop.channel }}
            shopifyAnalytics={rootData.shopIdentity.shopifyAnalytics}
            consent={analyticsConsent}
            navigate={navigate}
            routes={routeTemplates}
          />
        ) : null}
        <Meta />
        <Links />
      </head>
      <body className="bg-surface text-on-surface font-body flex min-h-svh flex-col antialiased selection:bg-pastel-rose selection:text-on-surface">
        <a
          href="#main-content"
          className="focus-visible:bg-interactive focus-visible:text-interactive-text sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-full focus-visible:px-4 focus-visible:py-2"
        >
          Aller au contenu principal
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <CartProvider initialData={loaderData.cartData}>
      <MobileIntroVideo />
      <PageViewedTracker />
      <CartAnalyticsTracker />
      <AnnouncementBar />
      <Header shopInfo={loaderData.shopInfo} />
      <Outlet />
      <Footer shopInfo={loaderData.shopInfo} />
      <CartDrawer />
      <SearchDrawer />
    </CartProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oups !";
  let details = "Une erreur inattendue est survenue.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Page introuvable" : "Erreur";
    details =
      error.status === 404
        ? "Le squishy que vous cherchez semble introuvable."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto flex w-full flex-1 flex-col items-start justify-center py-16"
    >
      <span className="bg-pastel-rose text-primary mb-3 inline-flex rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
        Squishies
      </span>
      <h1 className="type-display text-on-surface">{message}</h1>
      <p className="text-on-surface-secondary mt-3 max-w-md">{details}</p>
      <a
        href="/"
        className="rounded-button button-primary squish-press mt-6 inline-flex h-11 items-center justify-center px-6 text-sm font-semibold no-underline"
      >
        Retour à l&apos;accueil
      </a>
      {stack ? (
        <pre className="border-border mt-6 w-full overflow-x-auto rounded-2xl border bg-surface-elevated p-4 text-xs">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}
