export type ShowTag =
  | "데이트"
  | "가족"
  | "부모님"
  | "50+"
  | "주말"
  | "평일"
  | "야간"
  | "티켓오픈임박";

export interface Show {
  id: string;
  title: string;
  genre: string; // 콘서트, 뮤지컬, 연극, 클래식, 강연 등
  artist?: string;
  venue: string;
  region: string;
  district: string; // "도봉구", "종로구" 등 — 지역 조건 매칭용
  dayOfWeek: "월" | "화" | "수" | "목" | "금" | "토" | "일";
  distanceFromDobongKm: number; // 데모용: 도봉구 기준 이동거리(km)
  dateLabel: string; // "10.18(토) 19:00"
  priceLabel: string; // "88,000원~"
  priceValue: number; // 최저가 숫자값 — 가격 조건 매칭용
  ageLabel: string; // "8세 이상 관람가"
  runningTime: string; // "150분"
  tags: ShowTag[];
  reason?: string; // AI 추천 사유 (정적 예시가 필요할 때만 사용, 로그인 시엔 동적 생성)
  posterFrom: string; // 그라디언트 시작 hex (실제 포스터 없을 때 폴백)
  posterTo: string; // 그라디언트 끝 hex (실제 포스터 없을 때 폴백)
  posterUrl?: string; // KOPIS 실제 포스터 이미지 URL (있으면 그라디언트 대신 이걸 표시)
  bookingUrl?: string; // 예매처 딥링크 (KOPIS 상세 API의 relates.relate) — 실시간 가격/좌석은 여기서 확인
  status?: string; // KOPIS prfstate 원문 — "공연예정" / "공연중" / "공연완료" 등
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  upcoming: number;
  posterFrom: string;
  posterTo: string;
}

export interface Venue {
  id: string;
  name: string;
  region: string;
  showCount: number;
  tag: string;
  imageUrl?: string;
}

// 온보딩("추천 설정")에서 사용자가 고른 조건 조합
export interface RecommendationProfile {
  ageBand: "20대" | "30대" | "40대" | "50대" | "60대 이상";
  district: string; // "도봉구" 등
  companion: "혼자" | "연인과 함께" | "배우자와 함께" | "부모님과 함께" | "자녀와 함께" | "친구와 함께";
  childAge?: "0~3세" | "4~7세" | "8~10세" | "11~13세" | "해당 없음";
  preferredDay: "평일" | "토요일" | "일요일";
  maxDistanceKm: number;
  genres: string[]; // ["콘서트", "강연", ...]
}
