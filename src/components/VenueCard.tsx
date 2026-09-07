import { Venue } from "@/types/show";

export default function VenueCard({ venue }: { venue: Venue }) {
  return (
    <div className="flex w-56 shrink-0 flex-col gap-2 border border-line bg-surface p-4 transition-colors hover:border-gold">
      <p className="text-xs text-muted">{venue.region}</p>
      <h3 className="font-display text-lg text-paper">{venue.name}</h3>
      <p className="text-xs text-gold">{venue.tag}</p>
      <p className="mt-auto text-xs text-muted">
        {venue.showCount > 0 ? `공연 ${venue.showCount}건 진행 중` : "확정 공연 준비 중"}
      </p>
    </div>
  );
}
