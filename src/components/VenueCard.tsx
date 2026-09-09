"use client";
import { Show, Venue } from "@/types/show";

export default function VenueCard({ venue, shows = [] }: { venue: Venue; shows?: Show[] }) {
  const current = shows.filter((s)=>s.status?.includes("공연중") || s.status?.includes("중"));
  const preview = (current.length ? current : shows).slice(0,2);
  const searchVenue = () => {
    window.dispatchEvent(new CustomEvent("showday:search", { detail: { query: venue.name } }));
    document.getElementById("show-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <article className="w-72 shrink-0 overflow-hidden rounded-xl border border-line bg-surface transition-all hover:-translate-y-1 hover:border-gold hover:shadow-lg">
      <button type="button" onClick={searchVenue} className="block w-full text-left">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-raised">
          <img src={venue.imageUrl || "/venue-default.svg"} alt={`${venue.name} 이미지`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[10px] font-bold tracking-[.12em] text-white/70">{venue.region}</p>
            <h3 className="mt-1 text-xl font-black">{venue.name}</h3>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs font-bold text-gold">{venue.tag}</p>
          {preview.length > 0 ? (
            <div className="mt-3 space-y-2">
              {preview.map((show)=><div key={show.id} className="border-t border-line pt-2 first:border-t-0 first:pt-0"><p className="line-clamp-1 text-sm font-bold text-paper">{show.title}</p><p className="mt-1 text-xs text-muted">{show.dateLabel}{show.status ? ` · ${show.status}` : ""}</p></div>)}
              <p className="pt-1 text-xs font-bold text-gold">현재·예정 공연 보기 →</p>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-line p-3 text-xs text-muted">현재 확인된 공연 일정이 없습니다.</div>
          )}
        </div>
      </button>
    </article>
  );
}
