// 카카오 로컬 검색(키워드) API로 "장소명/주소" 문자열을 위경도로 변환합니다.
// src/app/api/travel-times/route.ts 에 있던 geocodeVenue 아이디어를 공용 유틸로 분리한 버전입니다.
// KOPIS 공연장처럼 좌표가 없는 데이터를 지도에 올릴 때 재사용합니다.
//
// 캐시: 같은 장소명은 좌표가 거의 바뀌지 않으므로 Next.js fetch 캐시로 30일간 재사용합니다.
// (Kakao 무료 호출량을 아끼기 위함 — 매 요청마다 좌표를 새로 조회하지 않습니다.)

export type GeoPoint = { lat: number; lng: number };

const GEOCODE_REVALIDATE_SECONDS = 60 * 60 * 24 * 30; // 30일

export function hasKakaoRestKey() {
  return Boolean(process.env.KAKAO_REST_API_KEY);
}

/**
 * 후보 검색어를 순서대로 시도해 처음 매칭되는 좌표를 반환합니다.
 * 예: ["세종문화회관 대극장, 서울", "세종문화회관"] 처럼 상세→일반 순으로 넣으면 성공률이 올라갑니다.
 */
export async function geocodeKeyword(candidates: (string | undefined | null)[]): Promise<GeoPoint | null> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return null;

  const queries = candidates.map((c) => c?.trim()).filter((c): c is string => Boolean(c));

  for (const query of queries) {
    try {
      const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
      url.searchParams.set("query", query);
      url.searchParams.set("size", "1");

      const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${key}` },
        next: { revalidate: GEOCODE_REVALIDATE_SECONDS },
      });
      if (!res.ok) continue;

      const json = await res.json();
      const doc = json?.documents?.[0];
      const lat = Number(doc?.y);
      const lng = Number(doc?.x);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    } catch {
      // 다음 후보 검색어로 계속 시도
    }
  }

  return null;
}

/**
 * 여러 장소를 동시에(제한된 동시성으로) 지오코딩합니다.
 * KOPIS 공연장처럼 같은 공연장이 여러 공연에 반복 등장하는 경우, 호출 전에
 * 장소명 기준으로 중복 제거해서 넘기면 API 호출 수를 크게 줄일 수 있습니다.
 */
export async function geocodeMany<T>(
  items: T[],
  toQueries: (item: T) => (string | undefined | null)[],
  concurrency = 5
): Promise<Map<T, GeoPoint | null>> {
  const result = new Map<T, GeoPoint | null>();
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      const item = items[idx];
      result.set(item, await geocodeKeyword(toQueries(item)));
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return result;
}
