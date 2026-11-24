import { Link } from "react-router";

export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Annonce"
      className="bg-on-surface text-surface px-3 py-2 text-center"
    >
      <div className="max-w-page mx-auto flex items-center justify-center">
        <Link
          to="/products/calendrier-avent-mystery-dumpling"
          className="focus-visible:outline-accent inline-flex max-w-full min-w-0 items-center gap-2 rounded-full text-xs font-medium text-surface no-underline hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm"
        >
          <span
            className="inline-block size-2 shrink-0 rounded-full bg-pastel-mint"
            aria-hidden="true"
          />
          <span className="truncate sm:hidden">
            Édition Noël · Calendrier de l&apos;Avent (24 surprises) →
          </span>
          <span className="hidden truncate sm:inline">
            Édition Noël · Calendrier de l&apos;Avent Mystery Dumpling (24 surprises) →
          </span>
        </Link>
      </div>
    </div>
  );
}
