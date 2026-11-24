import type { CSSProperties } from "react";
import { Link } from "react-router";

import type { ProductCardData } from "~/components/ProductCard";
import { formatPrice } from "~/lib/money";

const SNOWFLAKES = [
  { left: "10%", size: 5, dur: "3.1s", delay: "0s" },
  { left: "28%", size: 4, dur: "2.7s", delay: "1.1s" },
  { left: "54%", size: 5, dur: "3.5s", delay: "0.6s" },
  { left: "76%", size: 4, dur: "2.9s", delay: "1.7s" },
  { left: "90%", size: 5, dur: "3.3s", delay: "0.3s" },
] as const;

function AdventChristmasButton({
  to,
  priceLabel,
  className,
}: {
  to: string;
  priceLabel: string;
  className: string;
}) {
  return (
    <Link
      to={to}
      className={`advent-xmas-btn rounded-button squish-press focus-visible:outline-surface inline-flex items-center justify-center gap-2 px-5 font-bold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
    >
      {/* Drifting mini snowflakes */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden="true">
        {SNOWFLAKES.map((flake) => (
          <span
            key={flake.left}
            className="xmas-flake rounded-full bg-white/90"
            style={
              {
                left: flake.left,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                "--flake-dur": flake.dur,
                "--flake-delay": flake.delay,
              } as CSSProperties
            }
          />
        ))}
      </span>

      {/* Twinkling golden Christmas star */}
      <svg
        viewBox="0 0 24 24"
        className="xmas-star relative z-10 size-4 shrink-0 text-[#FFE066]"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l2.1 6.2L20.5 10l-6.4 1.8L12 18l-2.1-6.2L3.5 10l6.4-1.8L12 2z" />
      </svg>

      <span className="relative z-10">
        Calendrier de l&apos;Avent · {priceLabel}
      </span>

      <svg
        viewBox="0 0 24 24"
        className="xmas-star relative z-10 size-3.5 shrink-0 text-[#FFE066]"
        style={{ animationDelay: "0.9s" }}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l2.1 6.2L20.5 10l-6.4 1.8L12 18l-2.1-6.2L3.5 10l6.4-1.8L12 2z" />
      </svg>
    </Link>
  );
}

export function HomeHero({
  spotlightProducts,
  totalCount,
}: {
  spotlightProducts: readonly ProductCardData[];
  totalCount: number;
}) {
  const featured = spotlightProducts[0] ?? null;
  const adventProduct =
    spotlightProducts.find((p) => p.handle.includes("calendrier")) ?? featured;

  return (
    <section
      className="max-w-page px-margin mx-auto w-full pt-3 pb-4 sm:pt-5 md:pt-6"
      aria-labelledby="hero-heading-desktop"
    >
      {/* MOBILE-ONLY HERO (< md): dedicated 9:16 vertical visual showcasing all 9 squishies */}
      <div className="md:hidden">
        <div className="border-border/60 squishies-card-shadow relative mx-auto aspect-[9/16] max-h-[78dvh] w-full max-w-md overflow-hidden rounded-[2rem] border bg-[#FFCA08]">
          <img
            src="/images/hero-mobile-squishies-sm.webp"
            srcSet="/images/hero-mobile-squishies-sm.webp 540w, /images/hero-mobile-squishies.webp 900w"
            sizes="(max-width: 480px) 92vw, 448px"
            alt="Présentoir ludique de toute la collection Squishies"
            width={540}
            height={959}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />

          {/* Top headline sitting cleanly in the sunny yellow sky above the products */}
          <div className="relative z-10 flex flex-col items-center px-4 pt-4 text-center">
            <span className="bg-surface/90 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase shadow-sm backdrop-blur-sm">
              <span className="bg-primary inline-block size-1.5 rounded-full" aria-hidden="true" />
              Nouveautés · Édition Noël
            </span>
            <h1 className="font-heading text-on-surface mt-2 text-[1.6rem] leading-[1.08] font-bold tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]">
              Des squishies trop mignons à presser !
            </h1>
          </div>

          {/* Bottom thumb-zone CTAs sitting cleanly over the lower yellow floor */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#23192D]/55 via-[#23192D]/15 to-transparent px-4 pt-10 pb-4">
            <div className="flex flex-col gap-2">
              <a
                href="#catalogue"
                className="rounded-button button-primary squish-press focus-visible:outline-surface inline-flex h-12 w-full items-center justify-center gap-2 px-5 text-sm font-bold no-underline shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span>Découvrir les {totalCount > 0 ? totalCount : ""} squishies</span>
                <span aria-hidden="true">↓</span>
              </a>
              {adventProduct ? (
                <AdventChristmasButton
                  to={`/products/${adventProduct.handle}`}
                  priceLabel={formatPrice(adventProduct.priceRange.minVariantPrice)}
                  className="h-11 w-full text-xs"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP & TABLET HERO (>= md): seamless sunny-yellow showcase with dedicated desktop hero visual */}
      <div className="border-border/60 squishies-card-shadow relative hidden overflow-hidden rounded-[2rem] border bg-gradient-to-br from-[#FFD62A] via-[#FFCA08] to-[#FFC000] md:block">
        <div className="grid items-center md:grid-cols-[0.95fr_1.25fr] lg:grid-cols-[0.88fr_1.22fr]">
          {/* Left editorial column */}
          <div className="relative z-10 flex flex-col items-start px-8 py-10 text-left lg:py-12 lg:ps-12 lg:pe-4">
            <span className="bg-surface/92 text-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold tracking-wide uppercase shadow-sm">
              <span className="bg-primary inline-block size-1.5 rounded-full" aria-hidden="true" />
              Nouveautés · Édition Noël
            </span>

            <h1
              id="hero-heading-desktop"
              className="type-display text-on-surface mt-4 max-w-md drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]"
            >
              Des squishies trop mignons à presser sans modération
            </h1>

            <p className="text-on-surface/85 mt-3.5 max-w-md text-sm leading-relaxed font-medium lg:text-base">
              Dumplings pailletés en panier vapeur, textures craquantes{" "}
              <em>crispy</em> et calendrier de l&apos;Avent 24 surprises.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#catalogue"
                className="rounded-button button-primary squish-press focus-visible:outline-surface inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-bold no-underline shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span>Découvrir les {totalCount > 0 ? totalCount : ""} squishies</span>
                <span aria-hidden="true">↓</span>
              </a>

              {adventProduct ? (
                <AdventChristmasButton
                  to={`/products/${adventProduct.handle}`}
                  priceLabel={formatPrice(adventProduct.priceRange.minVariantPrice)}
                  className="h-12 text-sm"
                />
              ) : null}
            </div>
          </div>

          {/* Right showcase visual seamlessly blended into the golden yellow canvas */}
          <div className="relative h-full min-h-[380px] lg:min-h-[450px]">
            <img
              src="/images/hero-desktop-squishies.webp"
              srcSet="/images/hero-desktop-squishies-sm.webp 840w, /images/hero-desktop-squishies.webp 1280w"
              sizes="(min-width: 1024px) 58vw, (min-width: 768px) 56vw, 1px"
              width={1280}
              height={720}
              alt="Vitrine complète des 9 squishies gourmands et colorés Squishies"
              className="h-full w-full object-cover object-center [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_100%)]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
