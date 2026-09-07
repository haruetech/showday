import { Artist } from "@/types/show";

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div className="flex w-48 shrink-0 flex-col items-center gap-3 border border-line bg-surface p-5 text-center transition-colors hover:border-gold">
      <div
        className="h-16 w-16 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${artist.posterFrom}, ${artist.posterTo})`,
        }}
      />
      <h3 className="font-display text-base text-paper">{artist.name}</h3>
      <p className="text-xs text-muted">{artist.genre}</p>
      <p className="text-xs text-gold">예정 공연 {artist.upcoming}건</p>
    </div>
  );
}
