import type { EventSourceResult, ShowdayEvent } from "@/lib/events/eventTypes";
import { asArray, buildUrl, fetchXml, publicDataKey } from "./common";
import { cleanText, firstNumber, firstText, inferCategory, inferFree, makeEventId, normalizeDateText } from "@/lib/events/normalizeEvent";

function findRows(node: unknown): Record<string, unknown>[] {
  if (!node || typeof node !== "object") return [];
  const obj = node as Record<string, unknown>;
  for (const key of ["perforList", "item", "items", "row", "result"]) {
    const candidate = obj[key];
    if (candidate && typeof candidate === "object") {
      if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
      const nested = asArray((candidate as Record<string, unknown>).item as Record<string, unknown> | Record<string, unknown>[] | undefined);
      if (nested.length) return nested;
    }
  }
  for (const value of Object.values(obj)) {
    const rows = findRows(value);
    if (rows.length) return rows;
  }
  return [];
}

export async function fetchCulturePortalEvents(options: { startDate?: string; endDate?: string; rows?: number } = {}): Promise<EventSourceResult> {
  const key = publicDataKey("CULTURE_PORTAL_API_KEY");
  if (!key) return { source: "CULTURE_PORTAL", configured: false, events: [] };
  const startDate = options.startDate || new Date().toISOString().slice(0,10);
  const endDate = options.endDate || (() => { const d = new Date(); d.setDate(d.getDate()+60); return d.toISOString().slice(0,10); })();
  const base = process.env.CULTURE_PORTAL_PERIOD_URL || "https://apis.data.go.kr/B553457/nopenapi/rest/publicperformancedisplays/period";
  const url = buildUrl(base, { serviceKey: key, from: startDate.replace(/-/g,""), to: endDate.replace(/-/g,""), cPage: 1, rows: Math.min(options.rows || 100, 100) });
  try {
    const xml = await fetchXml(url, 1800);
    const rows = findRows(xml);
    const events: ShowdayEvent[] = rows.map((row, index) => {
      const sourceId = firstText(row,["seq","id","perforInfoId","performanceId"]) || String(index);
      const title = firstText(row,["title","name","perforName","prfnm","subject"]) || "제목 미정";
      const start = normalizeDateText(firstText(row,["startDate","start_date","periodStart","from","startDt"]));
      const end = normalizeDateText(firstText(row,["endDate","end_date","periodEnd","to","endDt"]));
      const venue = firstText(row,["place","placeName","facility","venue","area"]);
      const priceText = firstText(row,["price","useFee","charge","fee"]);
      const realm = firstText(row,["realmName","realm","genre","category"]);
      const regionText = firstText(row,["area","areaName","sido","region"]);
      const lat = firstNumber(row,["gpsY","latitude","lat"]), lng = firstNumber(row,["gpsX","longitude","lng","lot"]);
      return {
        id: makeEventId("CULTURE_PORTAL",sourceId,title,start), source:"CULTURE_PORTAL", sourceId,title,
        category: inferCategory(`${realm} ${title}`), subcategory: realm, region: regionText.split(" ")[0], district: regionText.split(" ")[1],
        venue,startDate:start,endDate:end,dateText:[start,end].filter(Boolean).join(" ~ "),priceText,isFree:inferFree(priceText),
        target:firstText(row,["target","useTarget","age"]), officialUrl:firstText(row,["url","link","homepage"]),
        imageUrl:firstText(row,["thumbnail","image","imgUrl","mainImg"]), organizer:firstText(row,["host","organizer","agency"]),
        lat,lng,raw:row,
      };
    });
    return { source:"CULTURE_PORTAL", configured:true, events };
  } catch (error) {
    return { source:"CULTURE_PORTAL", configured:true, events:[], error:error instanceof Error ? error.message : "문화정보 API 오류" };
  }
}
