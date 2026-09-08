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
    <div className="group flex w-64 shrink-0 flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors hover:border-gold">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-ink/70"
        style={{
          background: `linear-gradient(135deg, ${show.posterFrom}, ${show.posterTo})`,
        }}
      >
        {show.posterUrl && (
          <img
            src={show.posterUrl}
            alt={`${show.title} 포스터`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain"
            // KOPIS 포스터 URL이 깨져 있는 경우, 그라디언트 배경만 남기고 이미지는 숨김
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2 py-0.5 text-xs text-paper backdrop-blur-sm">
          {show.genre}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display font-bold text-lg leading-snug text-paper">
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

        {show.bookingUrl && (
          <a
            href={show.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center justify-center rounded-sm border border-line py-2 text-xs text-paper transition-colors hover:border-gold"
          >
            예매처에서 실시간 가격·좌석 보기 ↗
          </a>
        )}
      </div>
    </div>
  );
}
