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

function totalCountFrom(json: any): number {
  const candidates = [
    json?.response?.body?.totalCount,
    json?.body?.totalCount,
    json?.totalCount,
  ];

  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

function cleanServiceKey(value: string) {
  let key = value.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  return key.replace(/\s+/g, "");
}

function decodeOnce(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function requestYouthPage(
  base: string,
  rawKey: string,
  pageNo: number,
  rows: number
) {
  const cleaned = cleanServiceKey(rawKey);
  const decoded = decodeOnce(cleaned);

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
      `&pageNo=${pageNo}` +
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

function compactDate(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function todayKst() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";

  return `${year}${month}${day}`;
}

function rawDate(row: Record<string, unknown>, keys: string[]) {
  return compactDate(firstText(row, keys));
}

/**
 * SHOWDAY 노출 기준
 * - 이미 종료된 과거 프로그램은 제외
 * - 실제 프로그램/활동 일정이 오늘 이후면 노출
 * - 실제 일정이 없더라도 모집 종료일이 오늘 이후면 노출
 * - 날짜 정보가 전혀 없으면 노출하지 않음
 *
 * certEndYmd는 '인증 유효기간'이므로 행사 진행일로 사용하지 않습니다.
 */
function isCurrentOrFuture(row: Record<string, unknown>, today: string) {
  const programStart = rawDate(row, ["prgrmBgngYmd", "actvBgngYmd"]);
  const programEnd = rawDate(row, ["prgrmEndYmd", "actvEndYmd"]);
  const recruitStart = rawDate(row, ["rcrtBgngYmd"]);
  const recruitEnd = rawDate(row, ["rcrtEndYmd"]);

  if (programEnd) return programEnd >= today;
  if (programStart) return programStart >= today;
  if (recruitEnd) return recruitEnd >= today;
  if (recruitStart) return recruitStart >= today;

  return false;
}

function sortDate(row: Record<string, unknown>) {
  return (
    rawDate(row, ["prgrmBgngYmd", "actvBgngYmd", "rcrtBgngYmd"]) ||
    "99999999"
  );
}

export async function fetchYouthPrograms(
  options: { rows?: number } = {}
): Promise<EventSourceResult> {
  const key = process.env.DATA_GO_KR_SERVICE_KEY || "";

  if (!key) {
    return { source: "YOUTH_PROGRAM", configured: false, events: [] };
  }

  const base =
    process.env.YOUTH_PROGRAM_API_URL ||
    "https://apis.data.go.kr/1383000/yhis/YouthProgramSearchService/getYouthProgramSearchList";

  try {
    /*
     * API 기본 정렬에서 오래된 데이터가 앞쪽에 나오는 경우가 있어
     * 전체 건수를 먼저 확인한 뒤 가장 최근 페이지부터 최대 3페이지를 조회합니다.
     */
    const probe = await requestYouthPage(base, key, 1, 1);
    const totalCount = totalCountFrom(probe);

    const pageSize = 100;
    const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
    const pageNumbers = Array.from(
      new Set([lastPage, lastPage - 1, lastPage - 2].filter((p) => p >= 1))
    );

    const pageResults = await Promise.all(
      pageNumbers.map((pageNo) => requestYouthPage(base, key, pageNo, pageSize))
    );

    const today = todayKst();

    const rows = pageResults
      .flatMap(rowsFrom)
      .filter((row) => isCurrentOrFuture(row, today))
      .sort((a, b) => sortDate(a).localeCompare(sortDate(b)));

    const requestedRows = Math.max(1, Math.min(options.rows || 20, 100));

    const events: ShowdayEvent[] = rows
      .slice(0, requestedRows)
      .map((row, index) => {
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
        const deadline = firstText(row, ["ddlnYn"]);

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
          isFree: priceText === "0" ? true : inferFree(priceText),
          target: ynLabel(row),
          familyAllowed: family
            ? /y|yes|가능|1/i.test(family)
            : null,
          status: deadline === "Y" ? "마감" : "모집·진행",
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
