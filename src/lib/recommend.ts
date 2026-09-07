import { RecommendationProfile, Show } from "@/types/show";

/**
 * 조건 조합형 추천 엔진 (MVP).
 * "50대 = 트로트" 식 단일 속성 매칭이 아니라, 연령대·지역·동반자·요일·이동거리·
 * 관심장르를 함께 점수화해서 정렬하고, 실제로 일치한 조건만 이유로 보여줍니다.
 *
 * KOPIS 실 데이터 연동 후에도 Show 형태(district/dayOfWeek/distanceFromDobongKm 등)만
 * 채워주면 이 함수는 그대로 재사용됩니다.
 */

export interface ScoredShow {
  show: Show;
  score: number;
  matchedReasons: string[];
}

const companionToTag: Record<RecommendationProfile["companion"], Show["tags"][number] | null> = {
  "혼자": null,
  "배우자와 함께": "데이트",
  "부모님과 함께": "부모님",
  "자녀와 함께": "가족",
  "친구와 함께": "데이트",
};

export function scoreShow(show: Show, profile: RecommendationProfile): ScoredShow {
  let score = 0;
  const reasons: string[] = [];

  // 연령대 — 50대/60대 이상이면 "50+" 태그 가산
  if ((profile.ageBand === "50대" || profile.ageBand === "60대 이상") && show.tags.includes("50+")) {
    score += 2;
    reasons.push(profile.ageBand);
  }

  // 지역(구) 정확 일치
  if (show.district === profile.district) {
    score += 2;
    reasons.push(profile.district);
  }

  // 동반자
  const companionTag = companionToTag[profile.companion];
  if (companionTag && show.tags.includes(companionTag)) {
    score += 2;
    reasons.push(profile.companion);
  }

  // 요일
  const dayMatches =
    (profile.preferredDay === "토요일" && show.dayOfWeek === "토") ||
    (profile.preferredDay === "일요일" && show.dayOfWeek === "일") ||
    (profile.preferredDay === "평일" && !["토", "일"].includes(show.dayOfWeek));
  if (dayMatches) {
    score += 1.5;
    reasons.push(profile.preferredDay === "평일" ? "평일 공연" : profile.preferredDay);
  }

  // 이동거리 (도봉구 기준 데모 값)
  if (show.distanceFromDobongKm <= profile.maxDistanceKm) {
    score += 1.5;
    const distLabel =
      profile.maxDistanceKm <= 8 ? "이동 30분 이내" : profile.maxDistanceKm <= 20 ? "이동 1시간 이내" : null;
    if (distLabel) reasons.push(distLabel);
  }

  // 관심 장르
  if (profile.genres.includes(show.genre)) {
    score += 1;
    reasons.push(`${show.genre} 관심`);
  }

  return { show, score, matchedReasons: reasons };
}

export function recommendShows(shows: Show[], profile: RecommendationProfile, limit = 6): ScoredShow[] {
  return shows
    .map((show) => scoreShow(show, profile))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function reasonLabel(matchedReasons: string[]): string {
  if (matchedReasons.length === 0) return "";
  return matchedReasons.join(" · ");
}
