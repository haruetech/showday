# SHOWDAY — 개인 공연비서

시니어·가족 공연에 초점을 맞춰, "공연을 검색하는 곳"이 아니라
"나에게 맞는 공연을 발견하고, 공연 가는 하루 전체를 준비하는 곳"을 지향합니다.

## 시작하기
```bash
npm install
cp .env.example .env.local   # KOPIS 서비스키 / Supabase 키 입력
npm run dev
```

## 구조
- `src/app/page.tsx` — SHOWDAY HOME 메인 (비로그인/로그인 두 화면)
- `src/app/onboarding/page.tsx` — 카카오 로그인 직후 "추천 설정" 온보딩 (연령대·지역·동반자·요일·거리·장르를 칩으로 선택)
- `src/app/arena/page.tsx` — **ARENA NOW는 별도 저장소(`arena-now`)로 완전히 분리되어 `arena.showday.kr`에서 서비스됩니다.** 이 경로는 안내 페이지 없이 `redirect()`로 곧바로 `arena.showday.kr`로 넘깁니다. 디자인 스펙은 `docs/arena-now-vision.md`에 보존되어 있고, 실제 구현은 `arena-now` 저장소를 참고하세요.
- `src/lib/recommend.ts` — 조건 조합형 추천 엔진. "50대=트로트" 같은 단일 속성이 아니라 연령대·지역·동반자·요일·거리·장르를 함께 점수화
- `src/lib/profile.ts` — 추천 프로필 저장. **로그인 상태면 Supabase `profiles` 테이블을 우선 사용하고, 비로그인/미설정 시에만 localStorage로 폴백**합니다
- `src/app/api/kopis/route.ts` — KOPIS 오픈API 프록시. `KOPIS_API_KEY`가 없으면 `src/lib/dummy-data.ts`로 자동 폴백
- `src/lib/kopis.ts` — KOPIS XML 응답 파싱 (박스오피스 / 공연목록)
- `src/lib/supabase/` — 브라우저용/서버용 Supabase 클라이언트 (SSR 패턴)
- `src/lib/auth.ts` — 카카오 로그인/로그아웃 헬퍼 (로그인 성공 시 온보딩으로 이동)
- `src/app/auth/callback/route.ts` — 카카오 로그인 후 세션 교환 콜백
- `src/components/` — Header(로그인 상태), Hero(선택형 AI 검색), ShowCard(동적 추천 이유 표시), VenueCard, ArtistCard, ArenaNowBanner(준비중 톤), ParentsFiftyPlusSection(시니어), AroundSection, AlertsPanel

공연장 데이터(`venues`)는 서울아레나에 종속되지 않은 공통 구조입니다 — 서울아레나·고척스카이돔·KSPO DOME·세종문화회관 등을 동등하게 다루고, 서울아레나 제휴가 구체화되면 그때 `/arena`만 별도로 확장합니다.


## SHOWDAY 폴더 구조 및 공연 직접등록 운영 기준

SHOWDAY 프로젝트는 기능별 위치를 명확하게 나누어 관리합니다.  
새 기능을 추가할 때는 기존 파일을 한꺼번에 이동하기보다, 현재 동작 중인 경로를 유지하면서 필요한 기능만 별도 폴더로 추가하는 것을 원칙으로 합니다.

### 주요 페이지 위치

```text
showday
├─ src
│  ├─ app
│  │  ├─ page.tsx                 ← SHOWDAY 메인
│  │  ├─ performances
│  │  │  └─ page.tsx             ← 공연 목록
│  │  ├─ performance
│  │  │  └─ [id]
│  │  │     └─ page.tsx          ← 공연 상세
│  │  ├─ register
│  │  │  └─ page.tsx             ← 기획사·주최사 공연 직접등록
│  │  ├─ admin
│  │  │  └─ page.tsx             ← SHOWDAY 관리자
│  │  └─ api
│  │     └─ performances         ← 공연 등록·조회 API
│  │
│  ├─ components
│  │  ├─ Header.tsx
│  │  ├─ Footer.tsx
│  │  ├─ PerformanceCard.tsx
│  │  └─ RegisterForm.tsx        ← 공연 등록 폼
│  │
│  └─ lib
│     ├─ supabase.ts
│     └─ kopis.ts
│
├─ public
│  ├─ images
│  ├─ posters
│  └─ icons
│
└─ package.json
```

> 실제 프로젝트에서 파일명이 다를 수 있으므로, 기존 파일을 무작정 이동하거나 삭제하지 않습니다.  
> 먼저 VS Code에서 `Ctrl + Shift + F`로 화면에 보이는 문구를 검색해 실제 사용 파일을 확인한 뒤 정리합니다.

### 공연 직접등록 운영 구조

기획사·주최사가 SHOWDAY 관리자 페이지에 들어오는 방식이 아니라, 공개 등록 페이지를 별도로 둡니다.

```text
기획사·주최사
    ↓
showday.kr/register
    ↓
공연정보 + 포스터 직접 입력
    ↓
Supabase 저장
status = pending
    ↓
showday.kr/admin
관리자 검수
    ↓
승인 approved / 반려 rejected
    ↓
승인된 공연만 SHOWDAY 공개
```

### 페이지 역할

- `showday.kr` — 일반 관객용 SHOWDAY 서비스
- `showday.kr/register` — 기획사·주최사 공개 공연등록 페이지, 로그인 없이 등록 가능
- `showday.kr/admin` — SHOWDAY 관리자 전용, 로그인 후 검수·승인·수정·반려
- 업체 등록 내용은 즉시 공개하지 않고 반드시 `pending` 상태로 저장
- 관리자가 승인한 공연만 실제 SHOWDAY 공연 목록과 상세페이지에 노출

### 공연 등록 기본 항목

업체 등록 화면은 복잡하게 만들지 않고 아래 항목을 중심으로 구성합니다.

- 공연명
- 포스터 이미지 직접 업로드
- 공연 장르
- 공연일 / 공연시간
- 공연장
- 출연 아티스트
- 티켓 가격
- 예매 URL
- 공연 소개
- 주최·주관사
- 담당자명
- 담당자 연락처
- 담당자 이메일
- 무료공연 / 축제 / 행사 여부
- 개인정보 수집·이용 동의

등록 완료 문구 예시:

> 공연 등록 신청이 완료되었습니다.  
> SHOWDAY 검수 후 공연정보에 반영됩니다.

### 공연 상태값 권장안

```text
pending   → 검수대기
approved  → 승인 / 공개
rejected  → 반려
ended     → 공연종료
```

업체가 `/register`에서 등록하면 기본값은 항상 `pending`으로 저장합니다.  
관리자가 `/admin`에서 승인했을 때만 `approved`로 변경하고 SHOWDAY에 공개합니다.

### 공개 등록 보안 원칙

로그인 없이 등록할 수 있게 하되 다음 원칙을 유지합니다.

- 업체가 등록한 공연은 자동 공개하지 않음
- 관리자 승인 필수
- 포스터 파일 형식·크기 제한
- 동일 IP의 반복 제출 제한
- 봇·스팸 방지 기능 적용
- 담당자 연락처와 이메일은 일반 사용자 화면에 노출하지 않음

### 현재 작업 시 주의사항

SHOWDAY 프로젝트가 여러 차례 전체 업로드·수정된 상태라면 파일 위치가 혼재할 수 있습니다.  
따라서 폴더를 한 번에 대규모로 이동하지 말고 다음 순서로 정리합니다.

1. `src/app/page.tsx` — 현재 메인 확인
2. `/admin` 화면을 만드는 실제 파일 확인
3. 공연 목록·상세 관련 파일 확인
4. 중복·미사용 파일 확인
5. `src/app/register/page.tsx` 신규 추가
6. `/register` → Supabase `pending` 저장 연결
7. `/admin` → 검수대기 목록 연결
8. 승인 시 SHOWDAY 실제 공연 데이터로 노출

특히 기존 `import` 경로가 연결되어 있으므로 사용 여부를 확인하지 않은 파일을 이동·삭제하지 않습니다.


## 카카오 로그인 설정
Supabase Auth의 소셜 로그인(Kakao Provider)을 사용합니다. 앱 코드에는 카카오 키를
넣지 않고, Supabase 대시보드에서 연결합니다.

1. **카카오 개발자 콘솔** (developers.kakao.com) → 애플리케이션 생성
   → 카카오 로그인 활성화 → REST API 키 발급
   → Redirect URI 등록: `https://<프로젝트>.supabase.co/auth/v1/callback`
2. **Supabase 대시보드** → Authentication → Providers → Kakao 활성화
   → 위에서 발급받은 REST API 키(Client ID) / Client Secret 입력
3. **Supabase 대시보드** → Authentication → URL Configuration
   → Site URL과 Redirect URLs에 `{배포주소}/auth/callback` 추가
   (로컬 테스트 시 `http://localhost:3000/auth/callback`도 함께 등록)
4. `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 입력

이 값들이 없으면 헤더가 자동으로 "비로그인/로그인(데모)" 토글로 동작해서,
Supabase 연결 전에도 두 화면을 미리 볼 수 있습니다.

## 최근 정리한 것
- Hero의 AI QUICK PICK을 일반 사용자용(데이트·아티스트·내 주변·가격대)과 50+ 항목이 섞이도록 재구성 — 첫인상이 50+ 전용 서비스로 보이지 않게
- 더미 공연 중 서울아레나 소속 항목 제거 (개관 전 공연장에 확정 공연이 있는 것처럼 보이는 문제)
- 아티스트 팔로워 숫자(출처 없는 데모값) 데이터에서 제거
- MY ARTISTS를 로그인 시 "데모 관심 아티스트"로 명시 — 실제 팔로우 데이터가 아님을 표시
- 섹션 순서를 HERO → FOR YOU(로그인시) → TODAY/UPCOMING → MY ARTISTS → VENUES → 50+(전문 카테고리) → AROUND → ARENA NOW(준비중)로 재배치
- PARENTS TIME(부모 대기 코스)은 ARENA NOW 전용 기획으로 분리, SHOWDAY 메인에서는 노출하지 않음
- `supabase/migrations/0001_init.sql` 추가 — profiles/artist_follows 테이블 스키마 미리 준비 (Supabase 연결 시 `src/lib/profile.ts` 내부만 교체하면 됨)
- `/arena`와 `venues`의 서울아레나 관련 문구에서 고정 개관 일정("2027년" 등)을 제거 — 향후 변경될 수 있는 일정정보를 코드에 박아두지 않음
- **카카오 로그인 → Supabase 프로필 실제화**: `src/lib/profile.ts`가 로그인 상태면 Supabase `profiles` 테이블에 읽고 쓰도록 연결됨 (온보딩 제출, 홈의 추천 로딩, 헤더의 온보딩 유도 로직 모두 비동기로 전환). Supabase URL/키와 Kakao Provider 설정만 마치면 코드 변경 없이 바로 동작합니다

## 개발 순서
**SHOWDAY 1.0** (현재) — 카카오 로그인 → 온보딩(추천 설정) → 개인화 메인 →
공연·아티스트·공연장 DB(Mock) → 조건 조합 추천 → MY ARTIST/찜·알림 구조

**SHOWDAY 1.5** — KOPIS 실 API 연결(승인 후 `KOPIS_API_KEY`만 채우면 됨) →
Supabase 사용자 데이터(현재 localStorage인 프로필 이전) → 가족 프로필

**SHOWDAY 2.0** — 공연장별 AROUND 실제 제휴처 연결 → 수익모델 검증

**ARENA NOW** — 서울아레나 제휴·사업 검증 후 `/arena` 본격 확장
(PARENTS TIME → 지역상권 → 짐보관 → K-Food/Pickup 순, 재고·생산이 붙는
K-라이스 디저트 직접판매는 가장 마지막)


## 2026-09-08 기획 보강 — SHOWDAY NOW
- 비로그인 사용자가 `동행 / 시간 / 예산` 3가지만 고르면 즉시 3개 공연을 추천하는 10초 공연비서를 메인 Hero에 추가했습니다.
- 카카오 로그인은 첫 화면 진입 장벽으로 쓰지 않고, 관심공연 저장·알림·기기간 동기화가 필요할 때 사용하는 구조를 권장합니다.
- 서비스 포지셔닝: 공연 목록 사이트가 아니라 “오늘 무엇을 볼지 결정해주는 개인 공연비서”.

## 2026-09 SHOWDAY UX update
- Hero: keyword + date range + companion + genre + budget (1/3/5/10만원/무관) + age-band preference.
- "가까운 공연" is not claimed without location permission and venue coordinates.
- KOPIS attribution is shown only in the footer; user-facing sections use normal SHOWDAY labels.
- KOPIS poster cards use a portrait-safe `object-contain` layout to avoid cropping.
- 50+ section includes Kakao-based viewing concierge, trusted companion concept, B2B group viewing, and after-show rest recommendations.

## 2026-09-10 고객 검색·가입 중심 개편
- 메인 메시지: 내 주변 / 아이와 함께 / 데이트 / 이번 주말 중심
- 공연장·50+ LIFE 메인 섹션 제거, 검색 내 부모님 동행 조건은 유지
- 카카오 로그인은 Supabase OAuth 기존 구조 유지 (`/auth/callback` → `/onboarding`)
- 비로그인 데모 토글 제거. 환경변수 연결 시 실제 카카오 로그인 버튼 노출
- 온보딩에 동행자 우선 선택, 자녀 동행 시 아이 연령(0~3/4~7/8~10/11~13) 추가
- `supabase/migrations/0002_profile_child_age.sql` 적용 필요
- `.env.local`은 GitHub에 올리지 않음. Vercel Environment Variables에 실제 값을 설정
