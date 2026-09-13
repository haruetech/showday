import type { EventSourceResult, ShowdayEvent } from "@/lib/events/eventTypes";
import { buildUrl, fetchJson, publicDataKey } from "./common";
import { cleanText, inferCategory, inferFree, makeEventId, normalizeDateText } from "@/lib/events/normalizeEvent";

type TourItem = Record<string, unknown>;

export async function fetchTourFestivalEvents(options: { startDate?: string; areaCode?: string; rows?: number } = {}): Promise<EventSourceResult> {
  const key = publicDataKey("TOUR_API_SERVICE_KEY");
  if (!key) return { source: "TOUR_API", configured: false, events: [] };
  const today = (options.startDate || new Date().toISOString().slice(0,10)).replace(/-/g, "");
  const base = process.env.TOUR_API_FESTIVAL_URL || "https://apis.data.go.kr/B551011/KorService2/searchFestival2";
  const url = buildUrl(base, {
    serviceKey: key,
    MobileOS: "ETC",
    MobileApp: "SHOWDAY",
    _type: "json",
    numOfRows: Math.min(options.rows || 100, 100),
    pageNo: 1,
    arrange: "A",
    eventStartDate: today,
    areaCode: options.areaCode,
  });
  try {
    const json = await fetchJson<any>(url, 1800);
    const items: TourItem[] = json?.response?.body?.items?.item || [];
    const events: ShowdayEvent[] = (Array.isArray(items) ? items : [items]).filter(Boolean).map((row) => {
      const sourceId = cleanText(row.contentid);
      const title = cleanText(row.title) || "제목 미정";
      const startDate = normalizeDateText(row.eventstartdate);
      const endDate = normalizeDateText(row.eventenddate);
      const priceText = cleanText(row.usetimefestival || row.usefee);
      return {
        id: makeEventId("TOUR_API", sourceId, title, startDate), source: "TOUR_API", sourceId, title,
        category: inferCategory(`축제 행사 ${title}`), subcategory: "축제/공연/행사",
        region: cleanText(row.addr1).split(" ")[0], district: cleanText(row.addr1).split(" ")[1],
        venue: cleanText(row.addr1), address: cleanText(row.addr1), startDate, endDate,
        dateText: [startDate,endDate].filter(Boolean).join(" ~ "), priceText, isFree: inferFree(priceText),
        imageUrl: cleanText(row.firstimage || row.firstimage2), lat: Number(row.mapy) || null, lng: Number(row.mapx) || null,
        officialUrl: sourceId ? `https://korean.visitkorea.or.kr/detail/fes_detail.do?cotid=${encodeURIComponent(sourceId)}` : "",
        raw: row,
      };
    });
    return { source: "TOUR_API", configured: true, events };
  } catch (error) {
    return { source: "TOUR_API", configured: true, events: [], error: error instanceof Error ? error.message : "TourAPI 오류" };
  }
}
