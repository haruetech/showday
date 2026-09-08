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

const KOPIS_BASE = "http://www.kopis.or.kr/openApi/restful";
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

interface DetailInfo {
  priceLabel: string;
  priceValue: number;
  ageLabel: string;
  runningTime: string;
  bookingUrl?: string;
}

/**
 * 공연 상세 조회 — pblprfr/{mt20id}
 * 가격(pcseguidance) / 관람등급(prfage) / 공연시간(prfruntime) / 예매처 링크(relates.relate) 확보
 */
async function fetchPerformanceDetail(mt20id: string): Promise<DetailInfo | null> {
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
      priceLabel,
      priceValue,
      ageLabel: row.prfage?.trim() || "관람등급 정보 없음",
      runningTime: row.prfruntime?.trim() || "",
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
      posterFrom: "#2c2440",
      posterTo: "#e8a33d",
      posterUrl: normalizePosterUrl(row.poster),
    })
  );

  return enrichWithDetails(shows);
}

/**
 * 공연 목록 검색 — pblprfr (공연목록)
 * shprfnmfct: 공연명, prfstate: 공연상태(01:공연예정,02:공연중,03:공연완료)
 */
export async function fetchPerformanceList(params: {
  stdate: string;
  eddate: string;
  shprfnm?: string;
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
      posterFrom: "#2c2440",
      posterTo: "#e8a33d",
      posterUrl: normalizePosterUrl(row.poster),
    })
  );

  return enrichWithDetails(shows);
}
