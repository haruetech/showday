import type { EventSourceResult, ShowdayEvent } from "@/lib/events/eventTypes";
import { buildUrl, fetchJson, publicDataKey } from "./common";
import { firstText, inferFree, makeEventId, normalizeDateText } from "@/lib/events/normalizeEvent";

export async function fetchForestEducation(options: { rows?: number } = {}): Promise<EventSourceResult> {
  const key = publicDataKey("FOREST_EDU_API_KEY");
  const base = process.env.FOREST_EDU_API_URL;
  if (!key || !base) return { source:"FOREST_EDU", configured:false, events:[] };
  const url = buildUrl(base,{ serviceKey:key,pageNo:1,numOfRows:Math.min(options.rows || 100,100),type:"json" });
  try {
    const json = await fetchJson<any>(url,1800);
    const candidate = json?.response?.body?.items?.item ?? json?.body?.items?.item ?? json?.items?.item ?? json?.items ?? [];
    const rows: Record<string,unknown>[] = Array.isArray(candidate) ? candidate : candidate ? [candidate] : [];
    const events: ShowdayEvent[] = rows.map((row,index) => {
      const sourceId = firstText(row,["id","sn","programId","prgmId","eduId"]) || String(index);
      const title = firstText(row,["programName","prgmNm","eduNm","title","name"]) || "산림교육 프로그램";
      const startDate = normalizeDateText(firstText(row,["startDate","bgngYmd","operStartDate","eduStartDate"]));
      const endDate = normalizeDateText(firstText(row,["endDate","endYmd","operEndDate","eduEndDate"]));
      const priceText = firstText(row,["fee","price","useFee","participationFee"]);
      return {
        id:makeEventId("FOREST_EDU",sourceId,title,startDate),source:"FOREST_EDU",sourceId,title,category:"체험·교육",subcategory:"산림교육",
        region:firstText(row,["sido","region","ctpvNm"]),district:firstText(row,["sigungu","district","sggNm"]),venue:firstText(row,["facilityName","placeName","venue","fcltyNm"]),
        address:firstText(row,["address","addr","roadAddr"]),startDate,endDate,dateText:[startDate,endDate].filter(Boolean).join(" ~ "),priceText,isFree:inferFree(priceText),
        target:firstText(row,["target","targetAge","useTarget"]),bookingUrl:firstText(row,["reservationUrl","applyUrl","bookingUrl"]),officialUrl:firstText(row,["homepage","url","link"]),raw:row,
      };
    });
    return { source:"FOREST_EDU",configured:true,events };
  } catch(error) {
    return { source:"FOREST_EDU",configured:true,events:[],error:error instanceof Error ? error.message : "산림교육 API 오류" };
  }
}
