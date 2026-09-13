import type { EventSourceResult, ShowdayEvent } from "@/lib/events/eventTypes";
import { fetchJson } from "./common";
import { firstText, inferFree, makeEventId, normalizeDateText } from "@/lib/events/normalizeEvent";

function rowsFrom(json: any): Record<string, unknown>[] {
  const candidates = [
    json?.response?.body?.items?.item,
    json?.body?.items?.item,
    json?.items?.item,
    json?.items,
    json?.data,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (c && typeof c === "object") return [c];
  }
  return [];
}

function cleanServiceKey(value: string) {
  let key = value.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  // 인증키에는 공백/줄바꿈이 없어야 합니다.
  key = key.replace(/\s+/g, "");
  return key;
}

function decodeOnce(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function requestYouthJson(base: string, rawKey: string, rows: number) {
  const cleaned = cleanServiceKey(rawKey);
  const decoded = decodeOnce(cleaned);

  // 공공데이터포털 인증키 전달 형식 차이를 안전하게 흡수합니다.
  // 1) 디코딩 키를 정확히 한 번 URL 인코딩
  // 2) 이미 인코딩된 키는 원문 그대로
  const keyCandidates = Array.from(
    new Set([
      encodeURIComponent(decoded),
      cleaned,
    ])
  );

  let lastError: unknown = null;

  for (const serviceKey of keyCandidates) {
    const url =
      `${base}?serviceKey=${serviceKey}` +
      `&pageNo=1` +
      `&numOfRows=${Math.min(rows, 100)}` +
      `&type=json`;

    try {
      return await fetchJson<any>(url, 900);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("청소년 프로그램 API 호출 실패");
}

function ynLabel(row: Record<string, unknown>) {
  const labels: string[] = [];

  if (firstText(row, ["elmntrYn", "ageElmntrYn"]) === "Y") labels.push("초등학생");
  if (firstText(row, ["mddlYn", "ageMddlYn"]) === "Y") labels.push("중학생");
  if (firstText(row, ["highYn", "ageHighYn"]) === "Y") labels.push("고등학생");
  if (firstText(row, ["cllgYn", "ageCllgYn"]) === "Y") labels.push("대학생");
  if (firstText(row, ["gnrlYn", "ageGnrlYn"]) === "Y") labels.push("일반");

  return labels.join(" · ");
}

export async function fetchYouthPrograms(
  options: { rows?: number } = {}
): Promise<EventSourceResult> {
  // 현재는 Vercel의 공공데이터포털 공통키를 사용합니다.
  const key = process.env.DATA_GO_KR_SERVICE_KEY || "";

  if (!key) {
    return { source: "YOUTH_PROGRAM", configured: false, events: [] };
  }

  const base =
    process.env.YOUTH_PROGRAM_API_URL ||
    "https://apis.data.go.kr/1383000/yhis/YouthProgramSearchService/getYouthProgramSearchList";

  try {
    const json = await requestYouthJson(base, key, options.rows || 100);
    const rows = rowsFrom(json);

    const events: ShowdayEvent[] = rows.map((row, index) => {
      const sourceId =
        firstText(row, ["sn1Cn", "certSn", "fcltySn"]) || String(index);

      const title =
        firstText(row, ["actvNm"]) || "청소년 활동 프로그램";

      const venue = firstText(row, ["actvPlcNm"]);
      const organizer = firstText(row, ["instNm", "fcltGrpClubNm"]);

      const applyStartDate = normalizeDateText(
        firstText(row, ["rcrtBgngYmd"])
      );
      const applyEndDate = normalizeDateText(
        firstText(row, ["rcrtEndYmd"])
      );

      const startDate = normalizeDateText(
        firstText(row, ["prgrmBgngYmd", "actvBgngYmd"])
      );
      const endDate = normalizeDateText(
        firstText(row, ["prgrmEndYmd", "actvEndYmd"])
      );

      const priceText = firstText(row, ["prgrmPctpCst"]);
      const family = firstText(row, ["famRcrtYn"]);
      const status = firstText(row, ["ddlnYn"]);

      const dateText = [startDate, endDate]
        .filter(Boolean)
        .join(" ~ ");

      return {
        id: makeEventId(
          "YOUTH_PROGRAM",
          sourceId,
          title,
          startDate || applyStartDate
        ),
        source: "YOUTH_PROGRAM",
        sourceId,
        title,
        category: "체험·교육",
        subcategory: firstText(row, ["prgrmSeCd"]),
        venue: venue || organizer,
        address: venue,
        startDate,
        endDate,
        applyStartDate,
        applyEndDate,
        dateText,
        priceText,
        isFree:
          priceText === "0" ? true : inferFree(priceText),
        target: ynLabel(row),
        familyAllowed: family
          ? /y|yes|가능|1/i.test(family)
          : null,
        status,
        organizer,
        raw: row,
      };
    });

    return {
      source: "YOUTH_PROGRAM",
      configured: true,
      events,
    };
  } catch (error) {
    return {
      source: "YOUTH_PROGRAM",
      configured: true,
      events: [],
      error:
        error instanceof Error
          ? error.message
          : "청소년 프로그램 API 오류",
    };
  }
}
