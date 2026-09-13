import type { EventSourceResult, ShowdayEvent } from "@/lib/events/eventTypes";
import { cleanText, inferCategory, inferFree, makeEventId, normalizeDateText } from "@/lib/events/normalizeEvent";

export async function fetchSeoulReservations(options: { rows?: number } = {}): Promise<EventSourceResult> {
  const key = process.env.SEOUL_OPEN_DATA_API_KEY;
  if (!key) return { source:"SEOUL_RESERVATION", configured:false, events:[] };
  const rows = Math.min(options.rows || 300, 1000);
  const service = process.env.SEOUL_RESERVATION_SERVICE || "tvYeyakCOllect";
  const url = `http://openapi.seoul.go.kr:8088/${encodeURIComponent(key)}/json/${service}/1/${rows}/`;
  try {
    const res = await fetch(url,{ next:{ revalidate:900 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const root = json?.[service];
    const rawRows: Record<string,unknown>[] = Array.isArray(root?.row) ? root.row : [];
    const events: ShowdayEvent[] = rawRows.map((row,index) => {
      const sourceId = cleanText(row.SVCID) || String(index);
      const title = cleanText(row.SVCNM) || "서울 공공서비스";
      const startDate = normalizeDateText(row.SVCOPNBGNDT || row.SVCBEGINDT);
      const endDate = normalizeDateText(row.SVCOPNENDDT || row.SVCENDDT);
      const applyStartDate = normalizeDateText(row.RCPTBGNDT || row.RCEPTBEGDT);
      const applyEndDate = normalizeDateText(row.RCPTENDDT || row.RCEPTENDDT);
      const priceText = cleanText(row.FEEGUIDURL || row.PAYATNM || row.PAYAT);
      const sub = cleanText(row.MINCLASSNM || row.CODENM || row.MAXCLASSNM);
      const area = cleanText(row.AREANM);
      return {
        id:makeEventId("SEOUL_RESERVATION",sourceId,title,startDate),source:"SEOUL_RESERVATION" as const,sourceId,title,
        category:inferCategory(`${sub} ${title}`),subcategory:sub,region:"서울",district:area,venue:cleanText(row.PLACENM),address:cleanText(row.ADRES),
        startDate,endDate,applyStartDate,applyEndDate,dateText:[startDate,endDate].filter(Boolean).join(" ~ "),priceText,isFree:inferFree(priceText),
        target:cleanText(row.USETGTINFO),status:cleanText(row.SVCSTATNM || row.SVCSTTUS),bookingUrl:cleanText(row.SVCURL) || `https://yeyak.seoul.go.kr/web/reservation/selectReservView.do?rsv_svc_id=${encodeURIComponent(sourceId)}`,
        imageUrl:cleanText(row.IMGURL || row.IMG_PATH),description:cleanText(row.DTLCONT),lat:Number(row.Y) || null,lng:Number(row.X) || null,raw:row,
      };
    }).filter((e)=>!e.status || !/(종료|마감)/.test(e.status));
    return { source:"SEOUL_RESERVATION",configured:true,events };
  } catch(error) {
    return { source:"SEOUL_RESERVATION",configured:true,events:[],error:error instanceof Error ? error.message : "서울 공공예약 API 오류" };
  }
}
