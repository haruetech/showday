# SHOWDAY — 개인 공연비서

SHOWDAY는 단순 공연 목록 사이트가 아니라 **사용자가 자신에게 맞는 공연을 발견하고, 관심 공연을 저장하고, 공연 가는 하루를 준비할 수 있도록 돕는 공연 플랫폼**입니다.

이 README는 개발 문서이자 **"무엇을 수정하려면 어느 파일을 찾아가야 하는지"를 알려주는 프로젝트 지도**입니다.

---

## 1. 빠른 시작

```bash
npm install
cp .env.example .env.local
npm run dev
```

배포는 Vercel을 기준으로 합니다. `.env.local`은 GitHub에 올리지 않고 Vercel Environment Variables에 실제 값을 입력합니다.

---

## 2. 서비스 URL 구조

| URL | 역할 | 로그인 |
|---|---|---|
| `/` | SHOWDAY 메인 | 불필요 |
| `/show/[id]` | 공연 상세 | 불필요 |
| `/my-area` | 내 주변 공연 | 불필요 |
| `/onboarding` | 추천 설정 | 카카오 로그인 후 |
| `/register` | 기획사·주최사 공연 직접등록 | **불필요** |
| `/admin` | 관리자 대시보드 | **관리자 필요** |
| `/admin/shows` | 공연 등록·검수·수정 | 관리자 필요 |
| `/admin/notices` | 공지사항 관리 | 관리자 필요 |
| `/admin/popup` | 팝업 관리 | 관리자 필요 |
| `/admin/channel` | 카카오채널 관리 | 관리자 필요 |
| `/admin/clicks` | 클릭 데이터 | 관리자 필요 |
| `/admin/business` | 사업 관련 관리 | 관리자 필요 |
| `/arena` | ARENA NOW로 이동 | 불필요 |

### 가장 중요한 운영 원칙

```text
/admin
→ SHOWDAY 운영자 전용

/register
→ 외부 기획사·주최사 공개 등록용
```

외부 업체에게 `/admin` 계정이나 주소를 등록용으로 제공하지 않습니다.

---

## 3. 전체 프로젝트 구조

```text
showday-main/
│
├─ src/
│  ├─ app/                          # Next.js App Router — URL과 직접 연결
│  │  ├─ page.tsx                  # SHOWDAY 메인
│  │  ├─ layout.tsx                # 전체 공통 레이아웃
│  │  ├─ globals.css               # 전역 CSS
│  │  │
│  │  ├─ show/[id]/page.tsx        # 공연 상세
│  │  ├─ my-area/page.tsx          # 내 주변 공연
│  │  ├─ onboarding/page.tsx       # 추천 설정
│  │  ├─ privacy/page.tsx          # 개인정보처리방침
│  │  ├─ terms/page.tsx            # 이용약관
│  │  ├─ arena/page.tsx            # ARENA NOW redirect
│  │  │
│  │  ├─ register/                 # ★ 업체 직접등록
│  │  │  └─ page.tsx
│  │  │
│  │  ├─ auth/
│  │  │  └─ callback/route.ts      # 카카오 로그인 callback
│  │  │
│  │  ├─ admin/                    # ★ 관리자 영역
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ AdminLoginForm.tsx
│  │  │  ├─ AdminNav.tsx
│  │  │  ├─ shows/page.tsx
│  │  │  ├─ notices/page.tsx
│  │  │  ├─ popup/page.tsx
│  │  │  ├─ channel/page.tsx
│  │  │  ├─ clicks/page.tsx
│  │  │  └─ business/page.tsx
│  │  │
│  │  └─ api/                      # 서버 API
│  │     ├─ register/              # ★ 공개 공연등록 API
│  │     │  ├─ route.ts
│  │     │  └─ upload/route.ts
│  │     ├─ admin/
│  │     │  ├─ login/route.ts
│  │     │  ├─ overview/route.ts
│  │     │  ├─ shows/route.ts
│  │     │  ├─ shows/[id]/route.ts
│  │     │  ├─ upload/route.ts
│  │     │  ├─ notices/route.ts
│  │     │  ├─ notices/[id]/route.ts
│  │     │  ├─ popup/route.ts
│  │     │  └─ clicks/route.ts
│  │     ├─ kopis/route.ts
│  │     ├─ manual-shows/route.ts
│  │     ├─ manual-shows/featured/route.ts
│  │     ├─ notices/active/route.ts
│  │     ├─ news/route.ts
│  │     ├─ seoul-events/route.ts
│  │     ├─ settings/route.ts
│  │     ├─ travel-times/route.ts
│  │     └─ go/route.ts
│  │
│  ├─ components/                  # 화면 부품 — 기능별 폴더로 정리
│  │  ├─ common/
│  │  │  └─ Icons.tsx
│  │  ├─ layout/
│  │  │  ├─ Header.tsx
│  │  │  └─ Footer.tsx
│  │  ├─ home/
│  │  │  ├─ Hero.tsx
│  │  │  ├─ ShowdayNow.tsx
│  │  │  ├─ ShowdayTrends.tsx
│  │  │  ├─ AlertsPanel.tsx
│  │  │  ├─ ArenaNowBanner.tsx
│  │  │  ├─ AroundSection.tsx
│  │  │  ├─ DiscoverSection.tsx
│  │  │  ├─ MyAreaSection.tsx
│  │  │  └─ ParentsFiftyPlusSection.tsx
│  │  ├─ show/
│  │  │  ├─ ShowCard.tsx
│  │  │  └─ SectionRow.tsx
│  │  ├─ artist/
│  │  │  └─ ArtistCard.tsx
│  │  ├─ venue/
│  │  │  └─ VenueCard.tsx
│  │  ├─ navigation/
│  │  │  ├─ ResponsiveDock.tsx
│  │  │  └─ SectionQuickNav.tsx
│  │  ├─ promotion/
│  │  │  ├─ ShowAdPopup.tsx
│  │  │  └─ FloatingProductPromo.tsx
│  │  └─ kakao/
│  │     ├─ KakaoSdk.tsx
│  │     ├─ KakaoChannelButton.tsx
│  │     └─ KakaoChannelQr.tsx
│  │
│  ├─ lib/                         # 데이터·인증·추천 로직
│  │  ├─ adminAuth.ts
│  │  ├─ affiliateLinks.ts
│  │  ├─ artistAffinity.ts
│  │  ├─ auth.ts
│  │  ├─ dummy-data.ts
│  │  ├─ favorites.ts
│  │  ├─ kopis.ts
│  │  ├─ profile.ts
│  │  ├─ recommend.ts
│  │  └─ supabase/
│  │     ├─ admin.ts
│  │     ├─ client.ts
│  │     └─ server.ts
│  │
│  └─ types/
│     └─ show.ts
│
├─ public/                         # 정적 이미지·SVG
├─ supabase/
│  └─ migrations/                 # DB 변경 SQL
├─ docs/
│  └─ arena-now-vision.md
├─ AGENTS.md
├─ CLAUDE.md
├─ package.json
├─ next.config.ts
├─ tsconfig.json
└─ README.md
```

> **주의:** `src/app` 아래 폴더는 URL과 직접 연결됩니다. 보기 좋게 만들려고 임의로 이동하면 라우트가 바뀔 수 있습니다.

---

## 4. 무엇을 수정할 때 어디를 보면 되는가

| 수정하려는 내용 | 가장 먼저 볼 파일 |
|---|---|
| 메인 전체 구성 | `src/app/page.tsx` |
| 메인 Hero 검색 | `src/components/home/Hero.tsx` |
| 메인 공연 카드 | `src/components/show/ShowCard.tsx` |
| 섹션 제목·더보기 | `src/components/show/SectionRow.tsx` |
| 오늘/추천 공연 | `src/components/home/ShowdayNow.tsx` |
| 트렌드/인기 영역 | `src/components/home/ShowdayTrends.tsx` |
| 아티스트 카드 | `src/components/artist/ArtistCard.tsx` |
| 공연장 카드 | `src/components/venue/VenueCard.tsx` |
| 상단 Header | `src/components/layout/Header.tsx` |
| 하단 Footer | `src/components/layout/Footer.tsx` |
| 모바일 하단 메뉴 | `src/components/navigation/ResponsiveDock.tsx` |
| 우측/섹션 네비게이션 | `src/components/navigation/SectionQuickNav.tsx` |
| 메인 팝업 | `src/components/promotion/ShowAdPopup.tsx` |
| 상품 플로팅 프로모션 | `src/components/promotion/FloatingProductPromo.tsx` |
| 공연 상세 | `src/app/show/[id]/page.tsx` |
| 업체 공연 직접등록 화면 | `src/app/register/page.tsx` |
| 업체 등록 저장 API | `src/app/api/register/route.ts` |
| 업체 포스터 업로드 | `src/app/api/register/upload/route.ts` |
| 관리자 메인 | `src/app/admin/page.tsx` |
| 관리자 공연관리 | `src/app/admin/shows/page.tsx` |
| 관리자 공연 API | `src/app/api/admin/shows/route.ts` |
| 관리자 개별 공연 수정/삭제 | `src/app/api/admin/shows/[id]/route.ts` |
| 관리자 포스터 업로드 | `src/app/api/admin/upload/route.ts` |
| 공지사항 | `src/app/admin/notices/page.tsx` |
| 팝업 설정 | `src/app/admin/popup/page.tsx` |
| KOPIS API | `src/app/api/kopis/route.ts` |
| KOPIS XML 파싱 | `src/lib/kopis.ts` |
| 추천 로직 | `src/lib/recommend.ts` |
| 사용자 프로필 | `src/lib/profile.ts` |
| 카카오 로그인 | `src/lib/auth.ts` |
| Supabase 브라우저 클라이언트 | `src/lib/supabase/client.ts` |
| Supabase 서버 클라이언트 | `src/lib/supabase/server.ts` |
| Supabase 관리자 클라이언트 | `src/lib/supabase/admin.ts` |

---

## 5. 업체 공연 직접등록 — `/register`

### 목적

Google Form을 거치지 않고 **기획사·주최사가 SHOWDAY에 공연을 직접 입력**할 수 있도록 합니다.

회원가입은 요구하지 않습니다. 그러나 제출 즉시 공개되지는 않습니다.

### 데이터 흐름

```text
기획사·주최사
      │
      ▼
showday.kr/register
      │
      ├─ 공연정보 입력
      ├─ 공식 포스터 업로드
      ├─ 담당자 연락처·이메일
      └─ 권한/개인정보 동의
      │
      ▼
POST /api/register
      │
      ▼
Supabase manual_shows
status = "검토중"
submission_source = "public-register"
      │
      ▼
showday.kr/admin/shows
      │
      ├─ 검토
      ├─ 수정
      ├─ 승인 → 게시중
      └─ 종료/삭제
      │
      ▼
승인된 공연만 SHOWDAY 공개
```

### 업체 입력 항목

- 공연명
- 장르
- 공연장
- 지역
- 시작일 / 종료일
- 공연시간
- 관람연령
- 티켓 가격
- 러닝타임
- 예매 URL
- 포스터 이미지
- 공연 소개
- 출연 아티스트
- 기획·제작
- 기획사·주최사명
- 담당자 연락처
- 담당자 이메일
- 포스터 사용권한 확인
- 개인정보 수집·이용 동의

### 공개 폼 보안 원칙

- 등록 즉시 공개 금지
- `status = 검토중` 강제
- 포스터 JPG / PNG / WEBP만 허용
- 포스터 최대 5MB
- hidden honeypot 필드로 기본 봇 제출 차단
- 담당자 연락처·이메일은 일반 공연 화면에 노출하지 않음
- 추후 트래픽 증가 시 Cloudflare Turnstile + rate limit 추가 권장

---

## 6. 관리자 공연관리 — `/admin/shows`

`manual_shows`의 공연을 관리합니다.

### 상태값

```text
검토중 → 업체 제출 또는 관리자 등록 후 검토 대기
게시중 → SHOWDAY에 노출 가능
종료   → 공연 종료
```

### 등록 출처

```text
submission_source = admin
→ 관리자가 직접 등록

submission_source = public-register
→ 기획사·주최사가 /register에서 직접 등록
```

관리자 목록에는 업체 직접등록 건에 **"업체 직접등록" 배지**가 표시되며 담당자 연락처와 이메일도 검수용으로 확인할 수 있습니다.

---

## 7. Supabase 데이터 구조

### 핵심 테이블

#### `profiles`
사용자 추천 프로필

- age_band
- district
- companion
- preferred_day
- max_distance_km
- genres
- child_age

#### `artist_follows`
관심 아티스트

#### `manual_shows`
관리자 및 업체 직접등록 공연

주요 필드:

```text
id
title
genre
venue
region
period
price_label
booking_url
poster_url
agency_name
agency_contact
agency_email
status
show_time
age_label
synopsis
cast_info
crew
producer
running_time
is_featured
poster_rights_confirmed
submission_source
privacy_consent_at
created_at
updated_at
```

#### `site_notices`
공지/홍보 팝업

#### `site_settings`
사이트 설정

#### `booking_clicks`
예매 클릭 기록

### Storage

```text
bucket: posters

관리자 업로드
→ manual-shows/...

업체 직접등록
→ public-register/YYYY-MM-DD/...
```

---

## 8. Supabase Migration 순서

```text
0001_init.sql
→ profiles / artist_follows

0002_profile_child_age.sql
→ child_age

0003_admin_tables.sql
→ manual_shows / booking_clicks

0004_manual_shows_details.sql
→ 공연 상세 필드

0005_manual_shows_featured.sql
→ is_featured

0006_site_settings.sql
→ site_settings

0007_poster_upload.sql
→ posters Storage / poster_rights_confirmed

0008_site_notices.sql
→ site_notices

0009_public_show_submissions.sql
→ agency_email
→ submission_source
→ privacy_consent_at
```

### 중요

`/register`를 실제 배포하기 전에 **Supabase SQL Editor에서 `0009_public_show_submissions.sql`을 적용**해야 합니다.

---

## 9. KOPIS 구조

```text
src/app/api/kopis/route.ts
       │
       ▼
KOPIS Open API
       │ XML
       ▼
src/lib/kopis.ts
       │
       ▼
SHOWDAY 화면용 데이터
```

KOPIS 서비스키가 없는 개발 환경은 더미데이터로 폴백하는 기존 구조를 유지합니다.

---

## 10. 카카오 로그인

Supabase Auth Kakao Provider를 사용합니다.

```text
사용자
 ↓
카카오 로그인
 ↓
Supabase Auth
 ↓
/auth/callback
 ↓
/onboarding
 ↓
추천 프로필 저장
```

필요 환경변수:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

관리자 기능 및 공개 공연 등록 서버 API에는 Service Role Key가 필요합니다.

```text
SUPABASE_SERVICE_ROLE_KEY
```

관리자 로그인 관련 환경변수는 현재 프로젝트 설정에 맞춰 유지합니다.

---

## 11. 환경변수 관리 원칙

### 로컬

`.env.local`

### 운영

Vercel → Project → Settings → Environment Variables

### 절대 GitHub에 올리면 안 되는 값

- Supabase Service Role Key
- 관리자 비밀번호/Secret
- 비공개 API Key

`.env.local`은 Git에 커밋하지 않습니다.

---

## 12. 컴포넌트 폴더 정리 원칙

기존에는 `src/components`에 20개 이상 파일이 한곳에 있었지만 현재는 기능별로 정리했습니다.

```text
components/
├─ common       # 아이콘 등 공통
├─ layout       # Header/Footer
├─ home         # 메인 전용 섹션
├─ show         # 공연 카드/행
├─ artist       # 아티스트
├─ venue        # 공연장
├─ navigation   # 메뉴/네비
├─ promotion    # 팝업/프로모션
└─ kakao        # 카카오 관련 UI
```

### 새 컴포넌트를 만들 때

- 메인에서만 사용 → `home/`
- 여러 화면 공통 → `common/`
- Header/Footer → `layout/`
- 팝업/광고 → `promotion/`
- 공연 카드 관련 → `show/`

---

## 13. 파일을 찾기 어려울 때

파일명으로 추측하지 말고 VS Code에서 **`Ctrl + Shift + F`**를 사용합니다.

예:

```text
화면에 "공연 등록 요청"이 보인다
→ Ctrl + Shift + F
→ "공연 등록 요청" 검색
→ 실제 사용 파일 확인
```

검색하기 좋은 단어:

- 화면에 보이는 제목
- 버튼 문구
- API 주소 (`/api/...`)
- 상태값 (`검토중`, `게시중`)

---

## 14. 수정 시 절대 주의할 것

### 1. `src/app`을 마음대로 이동하지 않기

Next.js App Router에서는 폴더가 URL입니다.

```text
src/app/register/page.tsx
→ /register
```

폴더를 옮기면 URL도 바뀝니다.

### 2. 컴포넌트 파일 이동 시 import도 함께 변경

```tsx
// 이전
import Header from "@/components/Header";

// 현재
import Header from "@/components/layout/Header";
```

### 3. DB 컬럼 추가 후 Migration 적용

코드만 바꾸고 Supabase SQL을 적용하지 않으면 운영에서 오류가 납니다.

### 4. 업체 등록을 자동 승인하지 않기

공개 `/register`의 제출은 항상 `검토중`이어야 합니다.

---

## 15. 배포 전 체크리스트

```text
□ npm run build 성공
□ .env.local GitHub 미포함
□ Supabase Migration 최신 적용
□ /register 정상 접속
□ 포스터 업로드 테스트
□ 업체 등록 후 /admin/shows에 표시되는지 확인
□ 업체 직접등록 배지 표시 확인
□ 게시중 전환 후 SHOWDAY 노출 확인
□ 모바일 메인 확인
□ 팝업/공지 정상 동작
□ 카카오 로그인 확인
```

---

## 16. 현재 개발 우선순위

### P0 — 반드시 확인

1. `0009_public_show_submissions.sql` 운영 Supabase 적용
2. `/register` 실제 제출 테스트
3. `/api/register/upload` Storage 업로드 테스트
4. `/admin/shows` 업체 직접등록 검수 테스트
5. `npm run build` 확인

### P1 — 다음 단계

1. 공개 등록 폼 Cloudflare Turnstile
2. IP/이메일 기준 제출 rate limit
3. 업체 등록 완료 이메일
4. 관리자 신규 등록 알림
5. 등록번호를 통한 수정 요청 기능

### P2 — 등록량 증가 후

1. 기획사 계정
2. 내 공연 목록
3. 공연 수정 신청
4. 조회수/관심수 리포트
5. 알림 신청 데이터 제공

---

## 17. CHANGELOG

### 2026-09-12 — 구조 정리 + 업체 직접등록

- `src/components`를 기능별 폴더로 정리
- 모든 관련 import 경로 정리
- 루트 중복 `KakaoChannelButton.tsx` 제거
- `/register` 추가
- `/api/register` 추가
- `/api/register/upload` 추가
- 업체 직접등록은 `검토중` 강제
- `submission_source = public-register` 추가
- 관리자 공연목록에 `업체 직접등록` 표시
- `0009_public_show_submissions.sql` 추가
- README를 프로젝트 지도 형태로 전면 재작성

### 기존 기능 유지

- 메인 공연 탐색
- KOPIS 연동
- 카카오 로그인
- Supabase 프로필
- 관리자 대시보드
- 공지/팝업
- 카카오 채널
- ARENA NOW 분리 구조

---

## 18. 프로젝트 방향

SHOWDAY의 핵심은 공연정보를 많이 쌓는 것만이 아닙니다.

```text
관객
→ 나에게 맞는 공연 발견

기획사·주최사
→ 공연을 직접 등록

SHOWDAY
→ 검수 + 추천 + 관심/알림 데이터 축적
```

장기적으로는 **관객과 공연 공급자를 연결하는 공연 발견·배포 플랫폼**으로 확장하는 구조를 목표로 합니다.
