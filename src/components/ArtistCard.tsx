"use client";

import { Artist } from "@/types/show";
import { signInWithKakao, isAuthConfigured } from "@/lib/auth";

export default function ArtistCard({
  artist,
  mode,
  isFollowing,
  onToggleFollow,
}: {
  artist: Artist;
  mode: "guest" | "member";
  isFollowing?: boolean;
  onToggleFollow?: (artistId: string) => void;
}) {
  const searchArtist = () => {
    window.dispatchEvent(
      new CustomEvent("showday:search", { detail: { query: artist.name, mode: "artist" } })
    );
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
    <div className="relative flex w-48 shrink-0 flex-col items-center gap-3 border border-line bg-surface p-5 text-center transition-all hover:-translate-y-0.5 hover:border-gold">
      <button
        type="button"
        onClick={handleHeartClick}
        aria-label={isFollowing ? `${artist.name} 관심 아티스트 해제` : `${artist.name} 관심 아티스트로 저장`}
        aria-pressed={isFollowing}
        className={`absolute right-3 top-3 text-lg transition-colors ${
          isFollowing ? "text-gold" : "text-muted hover:text-gold"
        }`}
      >
        {isFollowing ? "♥" : "♡"}
      </button>

      <button
        type="button"
        onClick={searchArtist}
        className="flex w-full flex-col items-center gap-3 focus:outline-none focus:ring-2 focus:ring-gold/60"
        aria-label={`${artist.name} 공연 검색`}
      >
        <div className="h-16 w-16 rounded-full" style={{ background: `linear-gradient(135deg, ${artist.posterFrom}, ${artist.posterTo})` }} />
        <h3 className="font-display font-bold text-base text-paper">{artist.name}</h3>
        <p className="text-xs text-muted">{artist.genre}</p>
        <p className="text-xs text-gold">공연 찾아보기 →</p>
      </button>
    </div>
  );
}
