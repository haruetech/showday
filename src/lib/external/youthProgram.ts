import type { EventSourceResult, ShowdayEvent } from "@/lib/events/eventTypes";
import { buildUrl, fetchJson, publicDataKey } from "./common";
import { cleanText, firstText, inferFree, makeEventId, normalizeDateText } from "@/lib/events/normalizeEvent";

function rowsFrom(json: any): Record<string,unknown>[] {
  const candidates = [json?.response?.body?.items?.item, json?.body?.items?.item, json?.items?.item, json?.items, json?.data];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (c && typeof c === "object") return [c];
  }
  return [];
}

export async function fetchYouthPrograms(options: { rows?: number } = {}): Promise<EventSourceResult> {
  const key = publicDataKey("YOUTH_PROGRAM_API_KEY");
  if (!key) return { source:"YOUTH_PROGRAM", configured:false, events:[] };
  const base = process.env.YOUTH_PROGRAM_API_URL || "https://apis.data.go.kr/1383000/yhis/YouthProgramSearchService/getYouthProgramSearchList";
  const url = buildUrl(base,{ serviceKey:key,pageNo:1,numOfRows:Math.min(options.rows || 100,100),type:"json" });
  try {
    const json = await fetchJson<any>(url,900);
    const rows = rowsFrom(json);
    const events: ShowdayEvent[] = rows.map((row,index) => {
      const sourceId = firstText(row,["id","programId","progrmId","activityId","actId","sn"]) || String(index);
      const title = firstText(row,["actNm","activityNm","programNm","progrmNm","pgmNm","title","name"]) || "청소년 활동 프로그램";
      const venue = firstText(row,["actPlaceNm","activityPlaceNm","placeNm","place","venue"]);
      const applyStartDate = normalizeDateText(firstText(row,["rcritBgngYmd","recruitStartDate","rcritBgngDt","recruitBgngDate"]));
      const applyEndDate = normalizeDateText(firstText(row,["rcritEndYmd","recruitEndDate","rcritEndDt","recruitEndDate"]));
      const priceText = firstText(row,["programParticipationFee","progrmPartcptnCost","partcptnCost","fee","price"]);
      const family = firstText(row,["familyRecruitYn","familyRcritYn","familyYn"]);
      const status = firstText(row,["closeYn","deadlineYn","status","state"]);
      return {
        id:makeEventId("YOUTH_PROGRAM",sourceId,title,applyStartDate),source:"YOUTH_PROGRAM",sourceId,title,category:"체험·교육",
        subcategory:firstText(row,["programType","progrmSe","programSe","category"]),venue,address:venue,
        applyStartDate,applyEndDate,dateText:[applyStartDate,applyEndDate].filter(Boolean).join(" ~ "),priceText,isFree:inferFree(priceText),
        target:[firstText(row,["elementaryYn","middleYn","highYn","collegeYn"]),firstText(row,["ageNonSchoolYn","ageText","target"])].filter(Boolean).join(" "),
        familyAllowed: family ? /y|yes|가능|1/i.test(family) : null,status,organizer:firstText(row,["facilityGroupClubNm","facilityNm","orgNm","organizationName"]),
        officialUrl:firstText(row,["url","homepage","link"]), raw:row,
      };
    });
    return { source:"YOUTH_PROGRAM", configured:true, events };
  } catch(error) {
    return { source:"YOUTH_PROGRAM", configured:true, events:[], error:error instanceof Error ? error.message : "청소년 프로그램 API 오류" };
  }
}
