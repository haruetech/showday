import Link from "next/link";
import { Show } from "@/types/show";

export default function ShowCard({
  show,
  reason,
}: {
  show: Show;
  reason?: string;
}) {
  const displayReason = reason ?? show.reason;

  return (
    <article className="group flex w-64 shrink-0 flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors hover:border-gold">
      <Link href={`/show/${encodeURIComponent(show.id)}`} className="block">
        <div
          className="relative aspect-[3/4] w-full overflow-hidden bg-ink/70"
          style={{ background: `linear-gradient(135deg, ${show.posterFrom}, ${show.posterTo})` }}
        >
          {show.posterUrl && (
            <img
              src={show.posterUrl}
              alt={`${show.title} 포스터`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
            />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2 py-0.5 text-xs text-paper backdrop-blur-sm">
            {show.genre}
          </span>
          {show.status && (
            <span className="absolute right-3 top-3 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-ink">
              {show.status}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/show/${encodeURIComponent(show.id)}`}>
          <h3 className="font-display line-clamp-2 text-lg font-bold leading-snug text-paper group-hover:text-gold">
            {show.title}
          </h3>
        </Link>
        <p className="text-sm text-muted">{show.venue} · {show.dateLabel}</p>
        <p className="text-xs text-muted">
          {show.priceLabel} · {show.ageLabel}{show.runningTime ? ` · ${show.runningTime}` : ""}
        </p>

        {show.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {show.tags.map((tag) => (
              <span key={tag} className="rounded-sm border border-line px-1.5 py-0.5 text-[11px] text-muted">{tag}</span>
            ))}
          </div>
        )}

        {displayReason && <div className="perforated my-1" aria-hidden />}
        {displayReason && <p className="text-xs leading-relaxed text-gold">{displayReason}</p>}

        <Link
          href={`/show/${encodeURIComponent(show.id)}`}
          className="mt-auto inline-flex items-center justify-center rounded-sm border border-line py-2.5 text-xs font-bold text-paper transition-colors hover:border-gold hover:text-gold"
        >
          SHOWDAY에서 상세보기 →
        </Link>
      </div>
    </article>
  );
}
