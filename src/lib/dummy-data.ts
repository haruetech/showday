import { Show, Artist, Venue } from "@/types/show";

// KOPIS 연동 전, UI 확인용 샘플 데이터.
// 실제 연동 시 src/lib/kopis.ts의 fetchBoxOffice / fetchPerformanceList 결과가
// 동일한 Show 형태로 매핑되어 이 자리를 대체합니다.
// district/dayOfWeek/distanceFromDobongKm은 조건 조합 추천(lib/recommend.ts) 매칭용 필드입니다.

export const todayShows: Show[] = [
  {
    id: "PF001",
    title: "이문세 THEATRE 콘서트",
    genre: "콘서트",
    artist: "이문세",
    venue: "세종문화회관 대극장",
    region: "서울",
    district: "종로구",
    dayOfWeek: "토",
    distanceFromDobongKm: 13,
    dateLabel: "9.20(토) 19:00",
    priceLabel: "99,000원~",
    priceValue: 99000,
    ageLabel: "전체 관람가",
    runningTime: "120분",
    tags: ["주말", "부모님", "50+"],
    posterFrom: "#5b3a2e",
    posterTo: "#e8a33d",
  },
  {
    id: "PF002",
    title: "웃는 남자",
    genre: "뮤지컬",
    venue: "블루스퀘어 신한카드홀",
    region: "서울",
    district: "용산구",
    dayOfWeek: "일",
    distanceFromDobongKm: 14,
    dateLabel: "9.21(일) 18:00",
    priceLabel: "70,000원~",
    priceValue: 70000,
    ageLabel: "8세 이상",
    runningTime: "160분",
    tags: ["주말", "데이트", "가족"],
    posterFrom: "#2c2440",
    posterTo: "#b85c4a",
  },
  {
    id: "PF003",
    title: "박진영 콘서트 〈J〉",
    genre: "콘서트",
    artist: "박진영",
    venue: "KSPO DOME",
    region: "서울",
    district: "송파구",
    dayOfWeek: "토",
    distanceFromDobongKm: 26,
    dateLabel: "10.4(토) 19:00",
    priceLabel: "132,000원~",
    priceValue: 132000,
    ageLabel: "만 8세 이상",
    runningTime: "150분",
    tags: ["티켓오픈임박", "주말"],
    posterFrom: "#1c1f3a",
    posterTo: "#e8a33d",
  },
];

export const popularShows: Show[] = [
  {
    id: "PF010",
    title: "고척 아레나 투어 — 임영웅",
    genre: "콘서트",
    artist: "임영웅",
    venue: "고척스카이돔",
    region: "서울",
    district: "구로구",
    dayOfWeek: "토",
    distanceFromDobongKm: 21,
    dateLabel: "11.1(토) 18:00",
    priceLabel: "154,000원~",
    priceValue: 154000,
    ageLabel: "전체 관람가",
    runningTime: "180분",
    tags: ["주말", "가족", "50+"],
    posterFrom: "#3a1f1c",
    posterTo: "#e8a33d",
  },
  {
    id: "PF011",
    title: "오페라의 유령",
    genre: "뮤지컬",
    venue: "예술의전당 오페라극장",
    region: "서울",
    district: "서초구",
    dayOfWeek: "수",
    distanceFromDobongKm: 23,
    dateLabel: "매주 화~일",
    priceLabel: "60,000원~",
    priceValue: 60000,
    ageLabel: "8세 이상",
    runningTime: "150분",
    tags: ["평일", "데이트"],
    posterFrom: "#221a33",
    posterTo: "#5b3a2e",
  },
  {
    id: "PF012",
    title: "클래식 오케스트라의 밤",
    genre: "클래식",
    venue: "롯데콘서트홀",
    region: "서울",
    district: "송파구",
    dayOfWeek: "일",
    distanceFromDobongKm: 26,
    dateLabel: "9.28(일) 17:00",
    priceLabel: "45,000원~",
    priceValue: 45000,
    ageLabel: "전체 관람가",
    runningTime: "110분",
    tags: ["주말", "부모님"],
    posterFrom: "#1f2a3a",
    posterTo: "#9b94a8",
  },
  {
    id: "PF013",
    title: "인스파이어 아레나 EDM 나이트",
    genre: "페스티벌",
    venue: "인스파이어 아레나",
    region: "인천",
    district: "연수구",
    dayOfWeek: "토",
    distanceFromDobongKm: 42,
    dateLabel: "10.11(토) 20:00",
    priceLabel: "88,000원~",
    priceValue: 88000,
    ageLabel: "18세 이상",
    runningTime: "240분",
    tags: ["야간", "주말"],
    posterFrom: "#2b1a3a",
    posterTo: "#b85c4a",
  },
  {
    id: "PF014",
    title: "도봉 인문학 콘서트 — 마음을 읽는 시간",
    genre: "강연",
    venue: "세종문화회관 대극장",
    region: "서울",
    district: "종로구",
    dayOfWeek: "토",
    distanceFromDobongKm: 13,
    dateLabel: "9.27(토) 15:00",
    priceLabel: "30,000원~",
    priceValue: 30000,
    ageLabel: "전체 관람가",
    runningTime: "90분",
    tags: ["주말", "50+", "부모님"],
    posterFrom: "#3a2c1c",
    posterTo: "#b85c4a",
  },
];

export const allShows: Show[] = [...todayShows, ...popularShows];

export const venues: Venue[] = [
  { id: "V001", name: "서울아레나", region: "서울 도봉", showCount: 0, tag: "K-POP 전문 아레나", imageUrl: "/venues/seoul-arena.svg" },
  { id: "V002", name: "KSPO DOME", region: "서울 송파", showCount: 8, tag: "대형 콘서트", imageUrl: "/venues/kspo.svg" },
  { id: "V003", name: "고척스카이돔", region: "서울 구로", showCount: 5, tag: "대형 돔 공연", imageUrl: "/venues/고척.svg" },
  { id: "V004", name: "인스파이어 아레나", region: "인천", showCount: 6, tag: "복합 리조트", imageUrl: "/venues/inspire.svg" },
  { id: "V005", name: "세종문화회관", region: "서울 종로", showCount: 15, tag: "클래식·뮤지컬·전통", imageUrl: "/venues/세종.svg" },
  { id: "V006", name: "예술의전당", region: "서울 서초", showCount: 20, tag: "오페라·발레·클래식", imageUrl: "/venues/arts-center.svg" },
];

export const artists: Artist[] = [
  { id: "A001", name: "임영웅", genre: "트로트", upcoming: 2, posterFrom: "#3a1f1c", posterTo: "#e8a33d" },
  { id: "A002", name: "이문세", genre: "가요", upcoming: 1, posterFrom: "#5b3a2e", posterTo: "#e8a33d" },
  { id: "A003", name: "박진영", genre: "가요", upcoming: 1, posterFrom: "#1c1f3a", posterTo: "#e8a33d" },
  { id: "A004", name: "아이유", genre: "발라드", upcoming: 1, posterFrom: "#2a1c3a", posterTo: "#d2691e" },
  { id: "A005", name: "DAY6", genre: "밴드", upcoming: 1, posterFrom: "#1c2f3a", posterTo: "#d2691e" },
  { id: "A006", name: "세븐틴", genre: "K-POP", upcoming: 1, posterFrom: "#3a1c2f", posterTo: "#d2691e" },
  { id: "A007", name: "조용필", genre: "가요", upcoming: 1, posterFrom: "#3a2a1c", posterTo: "#dd8a52" },
  { id: "A008", name: "박효신", genre: "발라드", upcoming: 1, posterFrom: "#1c3a2f", posterTo: "#d2691e" },
  { id: "A009", name: "뮤지컬 배우", genre: "뮤지컬", upcoming: 1, posterFrom: "#2f1c3a", posterTo: "#dd8a52" },
];

export const myAlerts = [
  { id: "AL1", label: "서울에서 이문세 공연 나오면 알려줘", status: "활성" },
  { id: "AL2", label: "50대 부부가 볼 만한 토요일 공연이 나오면 알려줘", status: "활성" },
  { id: "AL3", label: "도봉구에서 15km 이내 · 10만원 이하만 알려줘", status: "활성" },
];

export const aiSearchExamples: string[] = [
  "이번 주말 데이트 공연",
  "좋아하는 아티스트 공연",
  "부모님과 볼 공연",
  "내 주변 공연",
  "10만원 이하",
  "50+ 추천",
];

export const parentsPrograms = [
  { id: "P1", duration: "2시간 코스", flow: "카페 → 강연" },
  { id: "P2", duration: "3시간 코스", flow: "문화 프로그램 → 식사 → 산책" },
];

export const fiftyPlusPicks = [
  "강연", "공연", "명상", "AI 배우기", "취미", "건강", "문화",
];

// 온보딩(추천 설정) 선택지
export const onboardingOptions = {
  ageBands: ["20대", "30대", "40대", "50대", "60대 이상"] as const,
  districts: ["도봉구", "종로구", "구로구", "송파구", "서초구", "기타 지역"],
  companions: ["혼자", "배우자와 함께", "부모님과 함께", "자녀와 함께", "친구와 함께"] as const,
  days: ["평일", "토요일", "일요일"] as const,
  distances: [
    { label: "30분 이내", km: 8 },
    { label: "1시간 이내", km: 20 },
    { label: "거리 상관없음", km: 999 },
  ],
  genres: ["콘서트", "뮤지컬", "클래식", "강연", "페스티벌"],
};
