"use client";

import { Artist, Show } from "@/types/show";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";

export default function ArtistCard({
  artist,
  shows = [],
  mode,
  isFollowing,
  onToggleFollow,
}: {
  artist: Artist;
  shows?: Show[];
  mode: "guest" | "member";
  isFollowing?: boolean;
  onToggleFollow?: (artistId: string) => void;
}) {
  const nextShow = shows[0];
  const searchArtist = () => {
    window.dispatchEvent(new CustomEvent("showday:search", { detail: { query: artist.name, mode: "artist" } }));
    document.getElementById("show-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode !== "member") {
      if (isAuthConfigured) signInWithKakao();
      else alert("관심 아티스트로 저장하려면 카카오 로그인이 필요합니다.");
      return;
    }
    onToggleFollow?.(artist.id);
  };

  return (
    <article className="relative w-64 shrink-0 overflow-hidden rounded-xl border border-line bg-surface transition-all hover:-translate-y-1 hover:border-gold hover:shadow-lg">
      <button type="button" onClick={handleHeartClick} aria-label={`${artist.name} 관심 저장`} className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl shadow ${isFollowing ? "text-gold" : "text-muted"}`}>
        {isFollowing ? "♥" : "♡"}
      </button>
      <button type="button" onClick={searchArtist} className="block w-full text-left">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-raised" style={{ background: `linear-gradient(135deg, ${artist.posterFrom}, ${artist.posterTo})` }}>
          {nextShow?.posterUrl ? (
            <img src={nextShow.posterUrl} alt={`${artist.name} 공연 이미지`} className="h-full w-full object-cover" onError={(e)=>{e.currentTarget.style.display='none'}} />
          ) : (
            <div className="flex h-full items-end p-5"><span className="font-display text-4xl font-black text-white/80">{artist.name.slice(0,1)}</span></div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[10px] font-bold tracking-[.12em] text-white/75">ARTIST</p>
            <h3 className="mt-1 text-xl font-black">{artist.name}</h3>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted">{artist.genre}</p>
          {nextShow ? (
            <div className="mt-3 rounded-lg bg-ink/60 p-3">
              <p className="text-[10px] font-bold text-gold">NEXT SHOW</p>
              <p className="mt-1 line-clamp-2 text-sm font-bold text-paper">{nextShow.title}</p>
              <p className="mt-1 text-xs text-muted">{nextShow.dateLabel} · {nextShow.venue}</p>
              <p className="mt-2 text-xs font-bold text-gold">공연 내용 바로보기 →</p>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-line p-3">
              <p className="text-xs text-muted">현재 확인된 예정 공연이 없습니다.</p>
              <p className="mt-2 text-xs font-bold text-gold">공연 알림 받기 →</p>
            </div>
          )}
        </div>
      </button>
    </article>
  );
}
