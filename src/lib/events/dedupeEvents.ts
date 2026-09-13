import type { ShowdayEvent } from "./eventTypes";

const SOURCE_PRIORITY: Record<ShowdayEvent["source"], number> = {
  KOPIS: 100,
  SEOUL_RESERVATION: 95,
  SEOUL_CULTURE: 90,
  CULTURE_PORTAL: 80,
  TOUR_API: 75,
  YOUTH_PROGRAM: 70,
  FOREST_EDU: 65,
  MCST_EXHIBITION: 60,
};

function normalizeKeyText(value?: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[\s·ㆍ,.'"()\[\]{}:;!?/\\_-]+/g, "")
    .replace(/제\d+회|\d+회/g, "");
}

function day(value?: string | null) {
  return value?.slice(0, 10) || "";
}

function dedupeKey(event: ShowdayEvent) {
  return [normalizeKeyText(event.title), day(event.startDate), normalizeKeyText(event.venue || event.address)].join("|");
}

function richness(event: ShowdayEvent) {
  const fields = [event.bookingUrl,event.officialUrl,event.imageUrl,event.venue,event.address,event.priceText,event.target,event.description,event.lat,event.lng];
  return fields.filter(Boolean).length;
}

export function dedupeEvents(events: ShowdayEvent[]): ShowdayEvent[] {
  const map = new Map<string, ShowdayEvent>();
  for (const event of events) {
    const key = dedupeKey(event);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, event);
      continue;
    }
    const existingScore = SOURCE_PRIORITY[existing.source] * 10 + richness(existing);
    const incomingScore = SOURCE_PRIORITY[event.source] * 10 + richness(event);
    const primary = incomingScore > existingScore ? event : existing;
    const secondary = primary === event ? existing : event;
    map.set(key, {
      ...secondary,
      ...primary,
      bookingUrl: primary.bookingUrl || secondary.bookingUrl,
      officialUrl: primary.officialUrl || secondary.officialUrl,
      imageUrl: primary.imageUrl || secondary.imageUrl,
      description: primary.description || secondary.description,
      priceText: primary.priceText || secondary.priceText,
      target: primary.target || secondary.target,
      lat: primary.lat ?? secondary.lat,
      lng: primary.lng ?? secondary.lng,
    });
  }
  return [...map.values()];
}
