import { XMLParser } from "fast-xml-parser";
import { Show } from "@/types/show";

/**
 * KOPIS(공연예술통합전산망) 오픈API 연동.
 *
 * 서비스키 발급: https://www.data.go.kr 에서 "공연예술통합전산망" 검색 → 활용신청
 * 발급받은 키를 .env.local 의 KOPIS_API_KEY 에 넣으면 자동으로 실 데이터 사용.
 * 키가 없으면 아래 함수들은 null/빈 배열을 반환하고, 호출부(app/api/kopis/route.ts)가
 * dummy-data.ts 로 자동 폴백합니다.
 *
 * 중요: 목록 API(boxoffice, pblprfr)는 포스터 이미지(poster)는 주지만
 * 가격/관람등급/공연시간/예매 링크는 주지 않습니다. 이 정보들은 공연 상세
 * API(pblprfr/{mt20id})를 한 번 더 호출해야 나옵니다. 그래서 목록만 그대로
 * 매핑하면 이미지도 가격도 항상 비어 보이는 게 정상입니다 — 아래에서
 * 상위 N개만 상세 호출로 보강합니다(전체를 다 부르면 호출 수가 너무 많아짐).
 */

const KOPIS_BASE = "https://www.kopis.or.kr/openApi/restful";
// 상세 호출로 보강할 최대 개수 (호출량/응답속도 균형용)
const DETAIL_ENRICH_LIMIT = 20;
// 상세 API 동시 호출 개수 제한
const DETAIL_CONCURRENCY = 5;

function hasServiceKey() {
  return Boolean(process.env.KOPIS_API_KEY);
}

const parser = new XMLParser({ ignoreAttributes: false });

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function formatDate(yyyymmdd: string) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  return `${m}.${d}`;
}

// KOPIS 포스터는 http로 내려오는 경우가 많아, https 페이지에서 깨지지 않도록 보정
function normalizePosterUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed.startsWith("http://") ? trimmed.replace("http://", "https://") : trimmed;
}

// "전석 99,000원" / "R석 120,000원 S석 90,000원" 같은 안내문에서 최저가만 추출
function parsePrice(pcseguidance?: string): { priceLabel: string; priceValue: number } {
  if (!pcseguidance || !pcseguidance.trim()) {
    return { priceLabel: "가격 정보 없음", priceValue: 0 };
  }
  const matches = [...pcseguidance.matchAll(/([\d,]{4,})\s*원/g)].map((m) =>
    Number(m[1].replace(/,/g, ""))
  );
  if (matches.length === 0) {
    // 숫자를 못 찾으면("전석 무료", "미정" 등) 원문 그대로 보여줌
    return { priceLabel: pcseguidance.trim(), priceValue: 0 };
  }
  const min = Math.min(...matches);
  return { priceLabel: `${min.toLocaleString()}원~`, priceValue: min };
}

async function limitedMap<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export interface PerformanceDetail {
  id: string;
  title: string;
  genre: string;
  venue: string;
  period: string;
  timeGuide: string;
  cast: string;
  crew: string;
  producer: string;
  synopsis: string;
  posterUrl?: string;
  priceLabel: string;
  priceValue: number;
  priceGuide: string;
  ageLabel: string;
  runningTime: string;
  status: string;
  bookingUrl?: string;
}

/**
 * 공연 상세 조회 — pblprfr/{mt20id}
 * 가격(pcseguidance) / 관람등급(prfage) / 공연시간(prfruntime) / 예매처 링크(relates.relate) 확보
 */
export async function fetchPerformanceDetail(mt20id: string): Promise<PerformanceDetail | null> {
  if (!hasServiceKey()) return null;
  try {
    const qs = new URLSearchParams({ service: process.env.KOPIS_API_KEY! });
    const res = await fetch(`${KOPIS_BASE}/pblprfr/${mt20id}?${qs.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const json = parser.parse(xml);
    const row = json?.dbs?.db;
    if (!row) return null;

    const { priceLabel, priceValue } = parsePrice(row.pcseguidance);
    const relates = toArray(row?.relates?.relate);
    const bookingUrl: string | undefined = relates
      .map((r: Record<string, string>) => r?.relateurl)
      .find((u?: string) => !!u);

    return {
      id: String(row.mt20id || mt20id),
      title: String(row.prfnm || "공연 상세정보"),
      genre: String(row.genrenm || "공연"),
      venue: String(row.fcltynm || "공연장 정보 없음"),
      period: `${formatDate(String(row.prfpdfrom || ""))} ~ ${formatDate(String(row.prfpdto || ""))}`,
      timeGuide: String(row.dtguidance || "공연시간 정보 없음"),
      cast: String(row.prfcast || ""),
      crew: String(row.prfcrew || ""),
      producer: String(row.entrpsnm || ""),
      synopsis: String(row.sty || ""),
      posterUrl: normalizePosterUrl(row.poster),
      priceLabel,
      priceValue,
      priceGuide: String(row.pcseguidance || priceLabel),
      ageLabel: row.prfage?.trim() || "관람등급 정보 없음",
      runningTime: row.prfruntime?.trim() || "",
      status: String(row.prfstate || ""),
      bookingUrl,
    };
  } catch (err) {
    console.error(`KOPIS detail fetch failed for ${mt20id}:`, err);
    return null;
  }
}

// 목록에서 만든 Show[] 중 상위 DETAIL_ENRICH_LIMIT개만 상세 정보로 보강
async function enrichWithDetails(shows: Show[]): Promise<Show[]> {
  if (!hasServiceKey() || shows.length === 0) return shows;

  const toEnrich = shows.slice(0, DETAIL_ENRICH_LIMIT);
  const rest = shows.slice(DETAIL_ENRICH_LIMIT);

  const enriched = await limitedMap(toEnrich, DETAIL_CONCURRENCY, async (show) => {
    const detail = await fetchPerformanceDetail(show.id);
    if (!detail) return show;
    return {
      ...show,
      priceLabel: detail.priceLabel,
      priceValue: detail.priceValue,
      ageLabel: detail.ageLabel,
      runningTime: detail.runningTime || show.runningTime,
      bookingUrl: detail.bookingUrl,
      posterUrl: detail.posterUrl || show.posterUrl,
    };
  });

  return [...enriched, ...rest];
}

/**
 * 박스오피스 랭킹 (실시간 인기 공연) — boxoffice (기간별 박스오피스)
 * stdate/eddate: YYYYMMDD, ststype: 지역 코드(선택)
 */
export async function fetchBoxOffice(params: {
  stdate: string;
  eddate: string;
  area?: string;
}): Promise<Show[]> {
  if (!hasServiceKey()) return [];

  const qs = new URLSearchParams({
    service: process.env.KOPIS_API_KEY!,
    stdate: params.stdate,
    eddate: params.eddate,
    ...(params.area ? { area: params.area } : {}),
  });

  const res = await fetch(`${KOPIS_BASE}/boxoffice?${qs.toString()}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const json = parser.parse(xml);
  const rows = toArray(json?.boxofs?.boxof);

  const shows: Show[] = rows.map(
    (row: Record<string, string>): Show => ({
      id: row.mt20id,
      title: row.prfnm,
      genre: row.genrenm,
      venue: row.prfplcnm,
      region: params.area ?? "전국",
      district: "", // KOPIS 응답엔 구 단위 정보가 없어 비워둠 — Supabase 연동 시 공연장 DB에서 채움
      dayOfWeek: "토",
      distanceFromDobongKm: 999,
      dateLabel: `${formatDate(row.prfpdfrom)} ~ ${formatDate(row.prfpdto)}`,
      priceLabel: "가격 정보 없음",
      priceValue: 0,
      ageLabel: "관람등급 정보 없음",
      runningTime: "",
      tags: [],
      posterFrom: "#f3c9a0",
      posterTo: "#d2691e",
      posterUrl: normalizePosterUrl(row.poster),
      status: row.prfstate?.trim() || undefined,
    })
  );

  return enrichWithDetails(shows);
}

/**
 * 아티스트/키워드로 "공연 중 + 예정 공연"을 폭넓게 찾는다.
 * KOPIS pblprfr는 한 번 호출에 최대 31일 범위만 조회되므로, 오늘부터
 * 이어지는 31일짜리 창을 여러 번 호출해서 이어붙인다(총 약 6개월).
 * 이미 충분한 결과(rows)를 모았으면 더 부르지 않고 조기 종료한다.
 */
export async function fetchArtistShows(query: string, rows = 30): Promise<Show[]> {
  if (!hasServiceKey() || !query.trim()) return [];

  const WINDOW_DAYS = 31;
  const MAX_WINDOWS = 6; // 약 6개월치
  const seen = new Map<string, Show>();
  const cursor = new Date();

  for (let i = 0; i < MAX_WINDOWS && seen.size < rows; i++) {
    const start = new Date(cursor);
    start.setDate(start.getDate() + i * WINDOW_DAYS);
    const end = new Date(start);
    end.setDate(end.getDate() + WINDOW_DAYS - 1);

    const windowShows = await fetchPerformanceList({
      stdate: toKopisDate(start),
      eddate: toKopisDate(end),
      shprfnm: query,
      rows: 50,
    });

    for (const show of windowShows) {
      const ended = show.status?.includes("완료") || show.status?.includes("종료");
      if (!ended && !seen.has(show.id)) seen.set(show.id, show);
    }

    // 이번 창에서 하나도 안 나왔고, 이미 한 번이라도 결과를 모았다면
    // 뒤로 갈수록 더 안 나올 가능성이 높아 호출을 아낀다.
    if (windowShows.length === 0 && seen.size > 0 && i >= 1) break;
  }

  return Array.from(seen.values())
    .sort((a, b) => a.dateLabel.localeCompare(b.dateLabel))
    .slice(0, rows);
}

function toKopisDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * 공연 목록 검색 — pblprfr (공연목록)
 * shprfnmfct: 공연명, prfstate: 공연상태(01:공연예정,02:공연중,03:공연완료)
 */
export async function fetchPerformanceList(params: {
  stdate: string;
  eddate: string;
  shprfnm?: string;
  shprfnmfct?: string; // 공연시설/공연장명 검색
  signgucode?: string; // 지역 코드
  rows?: number;
}): Promise<Show[]> {
  if (!hasServiceKey()) return [];

  const qs = new URLSearchParams({
    service: process.env.KOPIS_API_KEY!,
    stdate: params.stdate,
    eddate: params.eddate,
    cpage: "1",
    rows: String(params.rows ?? 20),
    ...(params.shprfnm ? { shprfnm: params.shprfnm } : {}),
    ...(params.shprfnmfct ? { shprfnmfct: params.shprfnmfct } : {}),
    ...(params.signgucode ? { signgucode: params.signgucode } : {}),
  });

  const res = await fetch(`${KOPIS_BASE}/pblprfr?${qs.toString()}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const json = parser.parse(xml);
  const rows = toArray(json?.dbs?.db);

  const shows: Show[] = rows.map(
    (row: Record<string, string>): Show => ({
      id: row.mt20id,
      title: row.prfnm,
      genre: row.genrenm,
      venue: row.fcltynm,
      region: "",
      district: "",
      dayOfWeek: "토",
      distanceFromDobongKm: 999,
      dateLabel: `${formatDate(row.prfpdfrom)} ~ ${formatDate(row.prfpdto)}`,
      priceLabel: "가격 정보 없음",
      priceValue: 0,
      ageLabel: "관람등급 정보 없음",
      runningTime: "",
      tags: [],
      posterFrom: "#f3c9a0",
      posterTo: "#d2691e",
      posterUrl: normalizePosterUrl(row.poster),
      status: row.prfstate?.trim() || undefined,
    })
  );

  return enrichWithDetails(shows);
}
