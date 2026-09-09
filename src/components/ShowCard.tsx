import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import { Show } from "@/types/show";

export default function ShowCard({ show, reason }: { show: Show; reason?: string }) {
  const displayReason = reason ?? show.reason;
  return <article className="group w-[72vw] max-w-[250px] shrink-0 border-b border-line pb-4 sm:w-[238px] lg:w-[252px]">
    <Link href={`/show/${encodeURIComponent(show.id)}`} className="block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-raised">
        {show.posterUrl ? <img src={show.posterUrl} alt={`${show.title} 포스터`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"/> : <div className="absolute inset-0" style={{background:`linear-gradient(145deg,${show.posterFrom},${show.posterTo})`}}/>}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent"/>
        {show.status && <span className="absolute left-3 top-3 bg-white/92 px-2 py-1 text-[10px] font-bold text-paper backdrop-blur">{show.status}</span>}
      </div>
      <div className="pt-4">
        <p className="text-[10px] font-semibold tracking-[.08em] text-gold">{show.genre}</p>
        <h3 className="mt-1.5 line-clamp-2 min-h-[48px] text-base font-black leading-6 text-paper transition group-hover:text-gold">{show.title}</h3>
        <p className="mt-2 line-clamp-1 text-xs text-muted">{show.venue}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span>{show.dateLabel && !show.dateLabel.includes("undefined") ? show.dateLabel : "일정 확인 중"}</span>
          <span className="text-line">·</span>
          <span>{show.priceLabel && show.priceLabel !== "가격 정보 없음" ? show.priceLabel : "가격은 상세에서 확인"}</span>
        </div>
        {displayReason && <p className="mt-3 border-l-2 border-gold/50 pl-3 text-xs leading-5 text-muted">{displayReason}</p>}
        <span className="showday-card-detail mt-3 inline-flex items-center gap-1 text-xs font-bold text-paper">공연정보 <ArrowIcon className="h-3.5 w-3.5"/></span>
      </div>
    </Link>
  </article>
}
