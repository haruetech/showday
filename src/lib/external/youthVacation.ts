import type { EventSourceResult, ShowdayEvent } from "@/lib/events/eventTypes";
import {
  firstText,
  inferFree,
  makeEventId,
  normalizeDateText,
} from "@/lib/events/normalizeEvent";

const SOURCE = "YOUTH_PROGRAM" as const;

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

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function tagValue(xml: string, tag: string) {
  const match = xml.match(
    new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i")
  );
  return match ? decodeXml(match[1]) : "";
}

function parseItems(xml: string): Record<string, unknown>[] {
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  return itemMatches.map((itemXml) => ({
    key1: tagValue(itemXml, "key1"),
    organNm: tagValue(itemXml, "organNm"),
    pgmNm: tagValue(itemXml, "pgmNm"),
    price: tagValue(itemXml, "price"),
    target: tagValue(itemXml, "target"),
    sdate: tagValue(itemXml, "sdate"),
    edate: tagValue(itemXml, "edate"),
    certiYn: tagValue(itemXml, "certiYn"),
  }));
}

function parseTotalCount(xml: string) {
  const n = Number(tagValue(xml, "totalCount"));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function compactDate(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function todayKstCompact() {
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

function isCurrentOrFuture(row: Record<string, unknown>, today: string) {
  const start = compactDate(firstText(row, ["sdate"]));
  const end = compactDate(firstText(row, ["edate"]));

  if (end) return end >= today;
  if (start) return start >= today;

  return false;
}

function eventSortDate(row: Record<string, unknown>) {
  return (
    compactDate(firstText(row, ["sdate"])) ||
    compactDate(firstText(row, ["edate"])) ||
    "99999999"
  );
}

async function requestXml(
  base: string,
  rawKey: string,
  pageNo: number,
  numOfRows: number
) {
  const cleaned = cleanServiceKey(rawKey);
  const decoded = decodeOnce(cleaned);

  const keyCandidates = Array.from(
    new Set([encodeURIComponent(decoded), cleaned])
  );

  let lastError: unknown = null;

  for (const serviceKey of keyCandidates) {
    const url =
      `${base}?serviceKey=${serviceKey}` +
      `&pageNo=${pageNo}` +
      `&numOfRows=${numOfRows}`;

    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(9000),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
      }

      const resultCode = tagValue(text, "resultCode");
      const resultMsg = tagValue(text, "resultMsg");

      if (resultCode && !["00", "0"].includes(resultCode)) {
        throw new Error(
          `${resultMsg || "OPEN API ERROR"} (code ${resultCode})`
        );
      }

      return text;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("청소년 방학 프로그램 API 호출 실패");
}

export async function fetchYouthVacationPrograms(
  options: { rows?: number } = {}
): Promise<EventSourceResult> {
  const key = process.env.YOUTH_VACATION_API_KEY || "";

  if (!key) {
    return {
      source: SOURCE,
      configured: false,
      events: [],
    };
  }

  const base =
    process.env.YOUTH_VACATION_API_URL ||
    "https://apis.data.go.kr/1383000/YouthActivInfoVacationSrvc/getVacationProgrmList";

  try {
    const requestedRows = Math.max(1, Math.min(options.rows || 20, 100));
    const pageSize = 100;

    /*
     * 이 API는 프로그램 시작·종료일을 응답하므로
     * 최신 데이터가 있을 가능성이 높은 마지막 페이지부터 확인합니다.
     * 날짜가 지난 프로그램은 SHOWDAY에서 제외합니다.
     */
    const firstXml = await requestXml(base, key, 1, 1);
    const totalCount = parseTotalCount(firstXml);
    const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));

    const pageNumbers = Array.from(
      new Set(
        [lastPage, lastPage - 1, lastPage - 2, 1].filter((page) => page >= 1)
      )
    );

    const xmlPages = await Promise.all(
      pageNumbers.map((pageNo) =>
        requestXml(base, key, pageNo, pageSize)
      )
    );

    const today = todayKstCompact();

    const rawRows = xmlPages
      .flatMap(parseItems)
      .filter((row) => isCurrentOrFuture(row, today))
      .sort((a, b) => eventSortDate(a).localeCompare(eventSortDate(b)));

    const seen = new Set<string>();

    const rows = rawRows.filter((row) => {
      const key1 = firstText(row, ["key1"]);
      const title = firstText(row, ["pgmNm"]);
      const start = compactDate(firstText(row, ["sdate"]));
      const unique = `${key1}|${title}|${start}`;

      if (seen.has(unique)) return false;
      seen.add(unique);
      return true;
    });

    const events: ShowdayEvent[] = rows
      .slice(0, requestedRows)
      .map((row, index) => {
        const sourceId =
          firstText(row, ["key1"]) ||
          `vacation-${index + 1}`;

        const title =
          firstText(row, ["pgmNm"]) ||
          "청소년 방학 프로그램";

        const organizer = firstText(row, ["organNm"]);
        const startDate = normalizeDateText(firstText(row, ["sdate"]));
        const endDate = normalizeDateText(firstText(row, ["edate"]));
        const priceText = firstText(row, ["price"]);
        const target = firstText(row, ["target"]);
        const certified = firstText(row, ["certiYn"]);

        return {
          id: makeEventId(
            SOURCE,
            `VACATION-${sourceId}`,
            title,
            startDate
          ),
          source: SOURCE,
          sourceId: `VACATION-${sourceId}`,
          title,
          category: "체험·교육",
          subcategory: "청소년 방학 프로그램",
          venue: organizer,
          address: "",
          startDate,
          endDate,
          applyStartDate: null,
          applyEndDate: null,
          dateText: [startDate, endDate].filter(Boolean).join(" ~ "),
          priceText,
          isFree: inferFree(priceText),
          target,
          familyAllowed: null,
          status: certified === "Y" ? "인증 프로그램" : "진행·예정",
          organizer,
          raw: row,
        };
      });

    return {
      source: SOURCE,
      configured: true,
      events,
    };
  } catch (error) {
    return {
      source: SOURCE,
      configured: true,
      events: [],
      error:
        error instanceof Error
          ? error.message
          : "청소년 방학 프로그램 API 오류",
    };
  }
}
