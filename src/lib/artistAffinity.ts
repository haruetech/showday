import { Artist, RecommendationProfile } from "@/types/show";

/**
 * 연령대는 "취향의 시작값"으로만 쓴다 — 목록을 걸러내지 않고 순서만 바꾼다.
 * 20~30대는 K-POP·밴드·페스티벌, 40~50대는 발라드·뮤지컬·가요,
 * 50+는 트로트·가요·클래식·국악·연극을 우선 노출하되, 나머지도 그대로 다 보인다.
 */
const AGE_GENRE_PRIORITY: Record<RecommendationProfile["ageBand"], string[]> = {
  "20대": ["K-POP", "밴드", "페스티벌"],
  "30대": ["K-POP", "밴드", "발라드"],
  "40대": ["발라드", "뮤지컬", "가요"],
  "50대": ["트로트", "가요", "뮤지컬"],
  "60대 이상": ["트로트", "가요", "클래식", "국악", "연극"],
};

/** 프로필의 ageBand 기준으로 아티스트 목록 순서만 재정렬한다(제외 없음). */
export function sortArtistsByAgeBand(
  artistList: Artist[],
  ageBand?: RecommendationProfile["ageBand"]
): Artist[] {
  if (!ageBand) return artistList;
  const priority = AGE_GENRE_PRIORITY[ageBand] ?? [];
  return [...artistList].sort((a, b) => {
    const aRank = priority.indexOf(a.genre);
    const bRank = priority.indexOf(b.genre);
    const aScore = aRank === -1 ? priority.length : aRank;
    const bScore = bRank === -1 ? priority.length : bRank;
    return aScore - bScore;
  });
}
