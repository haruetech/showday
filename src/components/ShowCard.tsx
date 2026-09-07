import { Show } from "@/types/show";

export default function ShowCard({
  show,
  reason,
}: {
  show: Show;
  /** 로그인 시 추천 엔진이 계산한 동적 매칭 이유. 없으면 show.reason(정적 예시)을 사용. */
  reason?: string;
}) {
  const displayReason = reason ?? show.reason;

  return (
    <div className="group flex w-72 shrink-0 flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors hover:border-gold">
      <div
        className="relative h-40 w-full"
        style={{
          background: `linear-gradient(135deg, ${show.posterFrom}, ${show.posterTo})`,
        }}
      >
        <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2 py-0.5 text-xs text-paper backdrop-blur-sm">
          {show.genre}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg leading-snug text-paper">
          {show.title}
        </h3>
        <p className="text-sm text-muted">
          {show.venue} · {show.dateLabel}
        </p>
        <p className="text-xs text-muted">
          {show.priceLabel} · {show.ageLabel}
          {show.runningTime ? ` · ${show.runningTime}` : ""}
        </p>

        {show.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {show.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-line px-1.5 py-0.5 text-[11px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {displayReason && <div className="perforated my-1" aria-hidden />}
        {displayReason && (
          <p className="text-xs leading-relaxed text-gold">{displayReason}</p>
        )}
      </div>
    </div>
  );
}
