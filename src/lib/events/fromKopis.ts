import type { EventSourceResult, ShowdayEvent } from "./eventTypes";
import { makeEventId } from "./normalizeEvent";
import { fetchPerformanceList } from "@/lib/kopis";
import type { Show } from "@/types/show";
import { geocodeMany } from "@/lib/external/kakaoGeocode";

// SHOWDAY MAP / 통합검색에 KOPIS 공연을 합류시키는 어댑터.
// KOPIS 목록 API는 좌표를 주지 않으므로, 공연장명 기준으로 카카오 로컬검색을
// 통해 위경도를 붙여줍니다(공연장명은 반복되므로 중복 제거 후 지오코딩).

const WINDOW_DAYS = 90; // 오늘부터 90일치 예정/진행 공연을 지도·검색 대상으로 삼음

function toKopisDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function toIsoDate(yyyymmdd?: string): string | null {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function venueQueries(show: Show): (string | undefined)[] {
  return [
    show.region ? `${show.venue} ${show.region}` : undefined,
    show.venue,
  ];
}

export async function fetchKopisEvents(
  options: { rows?: number } = {}
): Promise<EventSourceResult> {
  const rows = options.rows ?? 200;
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + WINDOW_DAYS);

  let shows: Show[] = [];
  try {
    shows = await fetchPerformanceList({
      stdate: toKopisDate(today),
      eddate: toKopisDate(end),
      rows,
    });
  } catch (error) {
    return {
      source: "KOPIS",
      configured: true,
      events: [],
      error: error instanceof Error ? error.message : "KOPIS 조회 오류",
    };
  }

  if (shows.length === 0) {
    return { source: "KOPIS", configured: Boolean(process.env.KOPIS_API_KEY), events: [] };
  }

  // 같은 공연장이 여러 공연에 반복 등장하므로, 공연장명 기준으로만 지오코딩해서 호출을 아낀다.
  const uniqueVenues = Array.from(new Map(shows.map((s) => [s.venue || "", s])).values());
  const geocoded = await geocodeMany(uniqueVenues, venueQueries);
  const coordsByVenue = new Map(
    uniqueVenues.map((s) => [s.venue || "", geocoded.get(s) ?? null])
  );

  const events: ShowdayEvent[] = shows.map((show) => {
    const point = coordsByVenue.get(show.venue || "") ?? null;
    return {
      id: makeEventId("KOPIS", show.id, show.title, toIsoDate(show.startDate)),
      source: "KOPIS",
      sourceId: show.id,
      title: show.title,
      category: "공연",
      subcategory: show.genre || undefined,
      venue: show.venue || undefined,
      startDate: toIsoDate(show.startDate),
      endDate: toIsoDate(show.endDate),
      dateText: show.dateLabel,
      priceText: show.priceLabel,
      priceValue: show.priceValue || null,
      isFree: show.priceValue === 0 && /무료/.test(show.priceLabel || ""),
      ageText: show.ageLabel,
      status: show.status,
      bookingUrl: show.bookingUrl,
      imageUrl: show.posterUrl,
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
    };
  });

  return { source: "KOPIS", configured: true, events };
}
