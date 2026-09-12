"use client";
import { ArrowIcon, PinIcon } from "@/components/common/Icons";
import { Show, Venue } from "@/types/show";

export default function VenueCard({venue,shows=[]}:{venue:Venue;shows?:Show[]}){
  const preview=shows.filter(s=>!s.status?.includes("완료")&&!s.status?.includes("종료")).slice(0,2);
  const searchVenue=()=>{window.dispatchEvent(new CustomEvent("showday:search",{detail:{query:venue.name}}));document.getElementById("show-search")?.scrollIntoView({behavior:"smooth",block:"start"})};
  return <article className="group w-[82vw] max-w-[320px] shrink-0 border-b border-line pb-4 sm:w-[286px]">
    <button type="button" onClick={searchVenue} className="block w-full text-left">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-raised"><img src={venue.imageUrl||"/venue-default.svg"} alt={`${venue.name} 이미지`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"/><div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent"/><div className="absolute bottom-3 left-4 right-4 text-white"><p className="flex items-center gap-1 text-[9px] font-semibold tracking-[.12em] text-white/75"><PinIcon className="h-3 w-3"/>{venue.region||"공연장"}</p><h3 className="mt-1 text-xl font-black">{venue.name}</h3></div></div>
      <div className="pt-4"><p className="text-[10px] font-semibold tracking-[.08em] text-gold">{preview.length?`현재·예정 ${preview.length}건 미리보기`:venue.tag}</p>{preview.length?<div className="mt-2 divide-y divide-line">{preview.map(show=><div key={show.id} className="py-2 first:pt-0"><p className="line-clamp-1 text-sm font-bold text-paper">{show.title}</p><p className="mt-1 text-xs text-muted">{show.dateLabel}</p></div>)}</div>:<p className="mt-2 text-sm text-muted">현재 확인된 공연 일정이 없습니다.</p>}<span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-paper group-hover:text-gold">공연 일정 보기 <ArrowIcon className="h-3.5 w-3.5"/></span></div>
    </button>
  </article>
}
