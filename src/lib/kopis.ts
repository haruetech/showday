import { XMLParser } from "fast-xml-parser";
import { Show } from "@/types/show";

/**
 * KOPIS(공연예술통합전산망) 오픈API 연동.
 *
 * 서비스키 발급: https://www.data.go.kr 에서 "공연예술통합전산망" 검색 → 활용신청
 * 발급받은 키를 .env.local 의 KOPIS_API_KEY 에 넣으면 자동으로 실 데이터 사용.
 * 키가 없으면 아래 함수들은 null/빈 배열을 반환하고, 호출부(app/api/kopis/route.ts)가
 * dummy-data.ts 로 자동 폴백합니다.
 */

const KOPIS_BASE = "http://www.kopis.or.kr/openApi/restful";

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

/**
 * 박스오피스 랭킹 (실시간 인기 공연) — pblprfr (기간별 박스오피스)
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

  return rows.map(
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
    })
  );
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

  return rows.map(
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
    })
  );
}
