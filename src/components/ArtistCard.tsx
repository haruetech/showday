"use client";

import { Artist } from "@/types/show";

export default function ArtistCard({ artist }: { artist: Artist }) {
  const searchArtist = () => {
    window.dispatchEvent(new CustomEvent("showday:search", { detail: { query: artist.name } }));
    document.getElementById("show-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={searchArtist}
      className="flex w-48 shrink-0 flex-col items-center gap-3 border border-line bg-surface p-5 text-center transition-all hover:-translate-y-0.5 hover:border-gold focus:outline-none focus:ring-2 focus:ring-gold/60"
      aria-label={`${artist.name} 공연 검색`}
    >
      <div className="h-16 w-16 rounded-full" style={{ background: `linear-gradient(135deg, ${artist.posterFrom}, ${artist.posterTo})` }} />
      <h3 className="font-display text-base text-paper">{artist.name}</h3>
      <p className="text-xs text-muted">{artist.genre}</p>
      <p className="text-xs text-gold">공연 찾아보기 →</p>
    </button>
  );
}
