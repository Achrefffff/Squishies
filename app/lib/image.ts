export type ShopifyImageOptions = {
  width?: number;
  height?: number;
  crop?: "center" | "top" | "bottom" | "left" | "right";
};

const SHOPIFY_CDN_HOSTS = ["cdn.shopify.com", "mock.shop"];

function isShopifyImageHost(hostname: string) {
  return SHOPIFY_CDN_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

/**
 * Rewrites Shopify CDN / mock.shop URLs with width/height/crop sizing params
 * while preserving existing query parameters. Third-party URLs pass through unchanged.
 */
export function shopifyImageUrl(url: string, options: ShopifyImageOptions = {}): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (!isShopifyImageHost(parsed.hostname)) return url;

  if (options.width) parsed.searchParams.set("width", String(options.width));
  if (options.height) parsed.searchParams.set("height", String(options.height));
  if (options.crop) parsed.searchParams.set("crop", options.crop);

  return parsed.toString();
}

/** Builds a width-descriptor srcSet (e.g. `240w, 360w, 480w, 720w`) for responsive cards & galleries. */
export function shopifyImageSrcSet(url: string, widths: readonly number[]): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  if (!isShopifyImageHost(parsed.hostname)) return undefined;

  return widths
    .map((width) => `${shopifyImageUrl(url, { width })} ${width}w`)
    .join(", ");
}

/** Builds a 1x/2x density srcSet for fixed-size thumbnails (cart lines, predictive search). */
export function srcSetFor(url: string, options: ShopifyImageOptions): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  if (!isShopifyImageHost(parsed.hostname)) return undefined;

  const oneX = shopifyImageUrl(url, options);
  const twoX = shopifyImageUrl(url, {
    ...options,
    width: options.width ? options.width * 2 : undefined,
    height: options.height ? options.height * 2 : undefined,
  });

  return `${oneX} 1x, ${twoX} 2x`;
}
