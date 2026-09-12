# SHOWDAY — 개인 공연비서

SHOWDAY는 단순한 공연 목록 사이트가 아니라, 사용자가 **나에게 맞는 공연을 발견하고 공연 가는 하루 전체를 준비하도록 돕는 공연 탐색·추천 서비스**를 지향합니다.

현재 프로젝트는 **Next.js 16 + React 19 + Supabase + KOPIS + Kakao**를 중심으로 구성되어 있으며, 일반 사용자 영역과 관리자 영역, 기획사·주최사 공개 공연등록 영역을 분리해 운영합니다.

---

## 1. 서비스 구조 한눈에 보기

```text
SHOWDAY
│
├─ 일반 사용자
│  ├─ /                         SHOWDAY 메인
│  ├─ /show/[id]               공연 상세
│  ├─ /my-area                 내 주변 공연
│  ├─ /onboarding              추천 설정
│  ├─ /privacy                 개인정보처리방침
│  ├─ /terms                   이용약관
│  └─ /arena                   ARENA NOW로 리다이렉트
│
├─ 기획사·주최사
│  └─ /register                로그인 없이 공연 직접등록
│
├─ 관리자
│  ├─ /admin                   운영 현황판
│  ├─ /admin/shows             공연 등록·검수·수정
│  ├─ /admin/popup             공연 광고 팝업
│  ├─ /admin/notices           홍보·공지 팝업
│  ├─ /admin/channel           카카오톡 채널 설정
│  ├─ /admin/business          사업자 정보
│  └─ /admin/clicks            예매 클릭 통계
│
├─ 외부 데이터/API
│  ├─ KOPIS                    공연 목록·상세
│  ├─ 서울시 문화행사 API       지역 행사
│  ├─ Google News RSS          공연 소식
│  ├─ Kakao                    로그인·이동시간
│  └─ Supabase                 Auth / DB / Storage
│
└─ 별도 서비스
   └─ ARENA NOW                arena.showday.kr
```

---

## 2. 기술 스택

| 구분 | 사용 기술 |
|---|---|
| Framework | Next.js `16.3.4` |
| UI | React `19.2.8` |
| Language | TypeScript |
| CSS | Tailwind CSS 4 |
| Database/Auth/Storage | Supabase |
| 공연 데이터 | KOPIS |
| XML 파싱 | fast-xml-parser |
| 로그인 | Kakao OAuth via Supabase Auth |
| 이동시간 | Kakao REST API |
| 배포 | Vercel 기준 |

`package.json`의 현재 스크립트:

```bash
npm run dev
npm run build
npm run start
```

---

## 3. 시작하기

```bash
npm install
npm run dev
```

로컬 기본 주소:

```text
http://localhost:3000
```

> `.env.local`은 GitHub에 올리지 않습니다. 실제 배포값은 Vercel Environment Variables에 설정합니다.

---

## 4. 전체 폴더 구조

현재 프로젝트 실제 구조를 기준으로 정리했습니다.

```text
showday/
│
├─ docs/
│  └─ arena-now-vision.md
│
├─ public/
│  ├─ showday-hero-audience.png
│  ├─ healing-bg.svg
│  ├─ venue-default.svg
│  └─ venues/
│     ├─ arts-center.svg
│     ├─ inspire.svg
│     ├─ kspo.svg
│     ├─ seoul-arena.svg
│     ├─ 고척.svg
│     └─ 세종.svg
│
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  ├─ onboarding/page.tsx
│  │  ├─ my-area/page.tsx
│  │  ├─ show/[id]/page.tsx
│  │  ├─ register/page.tsx
│  │  ├─ arena/page.tsx
│  │  ├─ privacy/page.tsx
│  │  ├─ terms/page.tsx
│  │  ├─ auth/callback/route.ts
│  │  │
│  │  ├─ admin/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ AdminLoginForm.tsx
│  │  │  ├─ AdminNav.tsx
│  │  │  ├─ shows/page.tsx
│  │  │  ├─ popup/page.tsx
│  │  │  ├─ notices/page.tsx
│  │  │  ├─ channel/page.tsx
│  │  │  ├─ business/page.tsx
│  │  │  └─ clicks/page.tsx
│  │  │
│  │  └─ api/
│  │     ├─ kopis/route.ts
│  │     ├─ manual-shows/route.ts
│  │     ├─ manual-shows/featured/route.ts
│  │     ├─ register/route.ts
│  │     ├─ news/route.ts
│  │     ├─ notices/active/route.ts
│  │     ├─ seoul-events/route.ts
│  │     ├─ settings/route.ts
│  │     ├─ travel-times/route.ts
│  │     ├─ go/route.ts
│  │     └─ admin/
│  │        ├─ login/route.ts
│  │        ├─ overview/route.ts
│  │        ├─ shows/route.ts
│  │        ├─ shows/[id]/route.ts
│  │        ├─ upload/route.ts
│  │        ├─ popup/route.ts
│  │        ├─ notices/route.ts
│  │        ├─ notices/[id]/route.ts
│  │        └─ clicks/route.ts
│  │
│  ├─ components/
│  │  ├─ Header.tsx
│  │  ├─ Footer.tsx
│  │  ├─ Hero.tsx
│  │  ├─ ShowCard.tsx
│  │  ├─ ArtistCard.tsx
│  │  ├─ VenueCard.tsx
│  │  ├─ SectionRow.tsx
│  │  ├─ SectionQuickNav.tsx
│  │  ├─ ResponsiveDock.tsx
│  │  ├─ ShowdayNow.tsx
│  │  ├─ ShowdayTrends.tsx
│  │  ├─ ShowAdPopup.tsx
│  │  ├─ FloatingProductPromo.tsx
│  │  ├─ MyAreaSection.tsx
│  │  ├─ AroundSection.tsx
│  │  ├─ ParentsFiftyPlusSection.tsx
│  │  ├─ AlertsPanel.tsx
│  │  ├─ ArenaNowBanner.tsx
│  │  ├─ KakaoChannelButton.tsx
│  │  ├─ KakaoSdk.tsx
│  │  └─ Icons.tsx
│  │
│  ├─ lib/
│  │  ├─ auth.ts
│  │  ├─ adminAuth.ts
│  │  ├─ profile.ts
│  │  ├─ recommend.ts
│  │  ├─ favorites.ts
│  │  ├─ kopis.ts
│  │  ├─ dummy-data.ts
│  │  ├─ affiliateLinks.ts
│  │  ├─ artistAffinity.ts
│  │  └─ supabase/
│  │     ├─ client.ts
│  │     ├─ server.ts
│  │     └─ admin.ts
│  │
│  └─ types/
│     └─ show.ts
│
├─ supabase/
│  └─ migrations/
│     ├─ 0001_init.sql
│     ├─ 0002_profile_child_age.sql
│     ├─ 0003_admin_tables.sql
│     ├─ 0004_manual_shows_details.sql
│     ├─ 0005_manual_shows_featured.sql
│     ├─ 0006_site_settings.sql
│     ├─ 0007_poster_upload.sql
│     ├─ 0008_site_notices.sql
│     └─ 0009_public_show_submissions.sql
│
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ postcss.config.mjs
├─ AGENTS.md
├─ CLAUDE.md
└─ README.md
```

---

## 5. “어디를 수정해야 하나?” 빠른 찾기표

이 표를 먼저 확인하면 파일 찾는 시간을 줄일 수 있습니다.

| 수정하려는 내용 | 우선 확인 파일 |
|---|---|
| 메인 화면 전체 | `src/app/page.tsx` |
| 상단 메뉴/로그인 | `src/components/Header.tsx` |
| 메인 Hero / 검색 | `src/components/Hero.tsx` |
| 공연 카드 디자인 | `src/components/ShowCard.tsx` |
| 공연 상세 | `src/app/show/[id]/page.tsx` |
| 내 주변 공연 | `src/app/my-area/page.tsx`, `src/components/MyAreaSection.tsx` |
| 추천 설정 | `src/app/onboarding/page.tsx` |
| 추천 로직 | `src/lib/recommend.ts` |
| 사용자 프로필 | `src/lib/profile.ts` |
| 찜/관심 저장 | `src/lib/favorites.ts` |
| KOPIS 데이터 | `src/app/api/kopis/route.ts`, `src/lib/kopis.ts` |
| 업체 공연 직접등록 UI | `src/app/register/page.tsx` |
| 업체 공연 직접등록 API | `src/app/api/register/route.ts` |
| 관리자 전체 레이아웃 | `src/app/admin/layout.tsx` |
| 관리자 왼쪽 메뉴 | `src/app/admin/AdminNav.tsx` |
| 관리자 로그인 | `src/app/admin/AdminLoginForm.tsx`, `src/app/api/admin/login/route.ts` |
| 공연 등록·검수 | `src/app/admin/shows/page.tsx` |
| 공연 관리 API | `src/app/api/admin/shows/route.ts`, `src/app/api/admin/shows/[id]/route.ts` |
| 관리자 포스터 업로드 | `src/app/api/admin/upload/route.ts` |
| 메인 공연 팝업 | `src/components/ShowAdPopup.tsx` |
| 공연 팝업 관리자 | `src/app/admin/popup/page.tsx` |
| 공지/홍보 팝업 | `src/app/admin/notices/page.tsx` |
| 공지 노출 API | `src/app/api/notices/active/route.ts` |
| 카카오 채널 | `src/app/admin/channel/page.tsx`, `src/components/KakaoChannelButton.tsx` |
| 사업자 정보 | `src/app/admin/business/page.tsx`, `src/components/Footer.tsx` |
| 예매 클릭 통계 | `src/app/admin/clicks/page.tsx`, `src/app/api/go/route.ts` |
| ARENA NOW 연결 | `src/app/arena/page.tsx` |
| 개인정보처리방침 | `src/app/privacy/page.tsx` |
| 이용약관 | `src/app/terms/page.tsx` |

---

## 6. 사용자 페이지 상세

### `/`

파일:

```text
src/app/page.tsx
```

SHOWDAY 메인 화면입니다. 여러 컴포넌트를 조합하여 공연 탐색·추천 화면을 구성합니다.

메인 UI를 수정할 때는 먼저 `page.tsx`에서 어떤 컴포넌트를 불러오는지 확인한 뒤, 실제 화면 요소가 들어 있는 `src/components/` 파일을 수정합니다.

### `/show/[id]`

파일:

```text
src/app/show/[id]/page.tsx
```

공연 상세 화면입니다. KOPIS 공연과 관리자 등록 공연을 상세 데이터로 보여주는 중심 페이지입니다.

### `/my-area`

파일:

```text
src/app/my-area/page.tsx
```

내 주변 공연·행사 관련 화면입니다.

### `/onboarding`

파일:

```text
src/app/onboarding/page.tsx
```

카카오 로그인 이후 사용자의 추천 프로필을 설정하는 화면입니다.

현재 추천 프로필 타입은 다음 요소를 포함합니다.

- 연령대
- 지역
- 동행자
- 자녀 연령
- 선호 요일
- 최대 이동거리
- 선호 장르

### `/arena`

파일:

```text
src/app/arena/page.tsx
```

SHOWDAY 내부 ARENA NOW 구현 페이지가 아니라 별도 서비스 `arena.showday.kr`로 연결하는 경로입니다.

ARENA NOW 관련 상세 기획은:

```text
docs/arena-now-vision.md
```

에서 관리합니다.

---

## 7. 업체 공연 직접등록

### URL

```text
https://showday.kr/register
```

### 화면 파일

```text
src/app/register/page.tsx
```

이 페이지는 **기획사·주최사가 관리자 계정 없이 공연정보를 직접 제출하는 공개 페이지**입니다.

### 현재 입력 항목

#### 공연 기본정보

- 공연명 *
- 장르
- 공연장 *
- 지역
- 공연 시작일 *
- 공연 종료일
- 공연시간
- 관람연령

#### 포스터·예매정보

- 포스터 이미지
- 가격 안내
- 예매 링크
- 러닝타임
- 포스터 이미지 사용 권한 확인 *

#### 공연 소개

- 공연 소개
- 출연
- 기획·제작

#### 담당자 정보

- 기획사·주최사명 *
- 담당자 연락처 *
- 담당자 이메일
- 개인정보 수집·이용 동의 *

담당자 연락처와 이메일은 일반 사용자 화면에 공개하지 않는 운영용 정보입니다.

### 제출 흐름

```text
기획사·주최사
      ↓
showday.kr/register
      ↓
공연정보 입력
      ↓
POST /api/register
      ↓
Supabase manual_shows
      ↓
status = '검토중'
submission_source = 'public-register'
      ↓
/admin/shows
      ↓
관리자 검수
      ↓
게시중 승인
      ↓
SHOWDAY 공개 노출
```

### 공개 등록 API

```text
src/app/api/register/route.ts
```

서버에서 다음 조건을 다시 검사합니다.

- 공연명
- 공연장
- 공연기간
- 기획사·주최사명
- 담당자 연락처
- 포스터 권한 동의
- 개인정보 수집·이용 동의

공개 폼에서 넘어온 `status` 값을 신뢰하지 않고 서버가 강제로:

```text
검토중
```

으로 저장합니다.

또한:

```text
submission_source = public-register
```

를 저장해 관리자 직접등록과 구분합니다.

### 스팸 방지

공개 폼에 숨김 `website` 필드를 두는 간단한 honeypot 방식이 적용되어 있습니다. 일반 사용자는 이 필드를 채우지 않습니다.

---

## 8. 중요: 공개 등록 포스터 업로드 경로 확인 필요

현재 `src/app/register/page.tsx`는 포스터 업로드 시 다음 주소를 호출합니다.

```text
POST /api/register/upload
```

하지만 **현재 확인한 프로젝트 파일 구조에는 `src/app/api/register/upload/route.ts`가 없습니다.**

따라서 현재 상태 그대로라면 `/register`의 포스터 파일 업로드는 실패할 수 있습니다.

현재 존재하는 업로드 API는 관리자용:

```text
src/app/api/admin/upload/route.ts
```

입니다. 이 API는 관리자 인증을 요구하므로 공개 등록 페이지에서 그대로 사용할 수 없습니다.

즉 공개 공연등록을 실제 운영하려면 다음 파일이 별도로 필요합니다.

```text
src/app/api/register/upload/route.ts
```

권장 제한:

- JPG
- PNG
- WEBP
- 최대 5MB
- 파일명 랜덤화
- `posters` Storage bucket 사용
- 업로드 후 public URL 반환
- 실행 서버에서 입력 검증
- 향후 rate limit / Turnstile 추가 권장

**이 항목은 현재 구조에서 가장 먼저 보완해야 할 부분입니다.**

---

## 9. 관리자 영역

관리자 영역은 외부 기획사에 공개하지 않습니다.

```text
/admin
```

은 SHOWDAY 운영자 전용입니다.

### 관리자 인증

관련 파일:

```text
src/app/admin/layout.tsx
src/app/admin/AdminLoginForm.tsx
src/lib/adminAuth.ts
src/app/api/admin/login/route.ts
```

관리자 로그인 비밀번호는 환경변수:

```text
ADMIN_PASSWORD
```

를 사용합니다.

로그인 성공 시 `showday_admin` 쿠키가 설정됩니다.

> 현재 구현은 단일 관리자 비밀번호 기반입니다. 운영 규모가 커지면 Supabase Auth 기반 관리자 계정/권한 분리를 검토할 수 있습니다.

---

## 10. 관리자 메뉴 구조

`src/app/admin/AdminNav.tsx` 기준 현재 메뉴입니다.

### 운영 현황판

```text
/admin
```

- 전체 지표 요약
- 가입 프로필 수
- 수동 등록 공연 수
- 예매 클릭 수
- 최근 클릭 등

API:

```text
/api/admin/overview
```

### 공연 등록·관리

```text
/admin/shows
```

기능:

- 관리자 직접 공연등록
- 업체 등록 공연 검수
- 공연 수정
- 상태 변경
- 삭제
- 포스터 업로드
- 메인 추천 공연 설정에 사용할 데이터 관리

업체가 `/register`에서 제출한 공연은 관리자 목록에:

```text
업체 직접등록
```

표시가 붙습니다.

### 공연 팝업

```text
/admin/popup
```

등록된 공연 중 하나를 `is_featured = true`로 지정해 팝업 또는 대표 노출에 사용합니다.

API:

```text
/api/admin/popup
```

### 홍보·공지 팝업

```text
/admin/notices
```

공연 데이터와 별개로 자유 형식의 공지·이벤트·홍보 팝업을 관리합니다.

테이블:

```text
site_notices
```

### 채널 설정

```text
/admin/channel
```

카카오톡 채널 ID를 설정합니다.

### 사업자 정보

```text
/admin/business
```

Footer 등에 노출하는 다음 값을 관리합니다.

- 상호
- 대표자
- 사업자등록번호
- 통신판매업 신고번호
- 주소
- 고객지원 연락처

### 예매 클릭 통계

```text
/admin/clicks
```

SHOWDAY에서 외부 예매처로 이동한 클릭을 기록해 향후 제휴·광고·협상용 데이터로 활용할 수 있도록 구성되어 있습니다.

---

## 11. 관리자 공연 상태값

`manual_shows.status`는 현재 다음 값을 기준으로 운영합니다.

```text
검토중
게시중
종료
```

권장 의미:

| 상태 | 의미 |
|---|---|
| 검토중 | 업체가 제출했거나 관리자가 아직 확인하지 않은 상태 |
| 게시중 | 관리자 검수를 마치고 SHOWDAY 공개 가능 상태 |
| 종료 | 공연 종료 또는 비노출 상태 |

외부 업체가 제출할 때는 반드시 `검토중`으로 시작합니다.

---

## 12. Supabase 데이터 구조

### `profiles`

사용자 공연 추천 프로필.

주요 필드:

```text
id
age_band
district
companion
preferred_day
max_distance_km
genres
child_age
created_at
updated_at
```

RLS로 본인 프로필만 조회·등록·수정하도록 구성되어 있습니다.

### `artist_follows`

사용자 관심 아티스트.

```text
user_id
artist_id
created_at
```

### `manual_shows`

SHOWDAY 자체 등록 공연 및 업체 제출 공연.

기본 필드:

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
status
created_at
updated_at
```

확장 필드:

```text
show_time
age_label
synopsis
cast_info
crew
producer
running_time
is_featured
poster_rights_confirmed
agency_email
submission_source
```

### `booking_clicks`

예매처 이동 클릭 로그.

```text
id
platform
show_id
target_url
created_at
```

### `site_settings`

사이트 운영 설정.

현재 허용 키:

```text
kakao_channel_id
business_name
ceo_name
business_reg_no
mail_order_no
address
support_contact
```

### `site_notices`

공지/홍보 팝업.

```text
id
title
body
image_url
link_url
link_label
is_active
start_date
end_date
created_at
updated_at
```

---

## 13. Supabase Storage

Migration `0007_poster_upload.sql`에서:

```text
posters
```

public bucket을 생성합니다.

관리자 포스터 업로드 API:

```text
POST /api/admin/upload
```

현재 제한:

- JPG
- PNG
- WEBP
- GIF
- 최대 5MB

---

## 14. Supabase Migration 순서

Supabase SQL Editor 또는 migration 도구로 아래 순서대로 적용합니다.

```text
0001_init.sql
0002_profile_child_age.sql
0003_admin_tables.sql
0004_manual_shows_details.sql
0005_manual_shows_featured.sql
0006_site_settings.sql
0007_poster_upload.sql
0008_site_notices.sql
0009_public_show_submissions.sql
```

### 각 파일 역할

| Migration | 역할 |
|---|---|
| 0001 | `profiles`, `artist_follows` |
| 0002 | 자녀 연령 `child_age` 추가 |
| 0003 | `manual_shows`, `booking_clicks` |
| 0004 | 공연 상세 필드 추가 |
| 0005 | 대표/팝업 공연 `is_featured` |
| 0006 | `site_settings` |
| 0007 | posters Storage + 포스터 권한 확인 필드 |
| 0008 | `site_notices` |
| 0009 | 업체 이메일 + 등록 출처 |

---

## 15. API 구조

### 공연 데이터

#### `GET /api/kopis`

KOPIS 공연정보 검색/상세를 처리합니다.

파일:

```text
src/app/api/kopis/route.ts
src/lib/kopis.ts
```

#### `GET /api/manual-shows`

SHOWDAY 자체 등록 공연을 일반 사용자 화면에 전달합니다.

일반 공개 응답에는 담당자 연락처나 이메일 같은 내부 운영 필드를 포함하지 않습니다.

#### `GET /api/manual-shows/featured`

대표/팝업용 공연을 가져오는 API입니다.

### 공개 업체 등록

```text
POST /api/register
```

등록 신청을 `manual_shows`에 저장합니다.

### 서울 행사

```text
GET /api/seoul-events
```

서울시 문화행사 데이터를 가져옵니다.

### 공연 뉴스

```text
GET /api/news
```

Google News RSS 기반 공연 소식을 가져옵니다.

### 이동시간

```text
POST /api/travel-times
```

Kakao REST API를 이용해 현재 위치 기준 이동시간을 계산합니다.

### 사이트 설정

```text
GET /api/settings
POST /api/settings
```

GET은 메인 사이트에서도 사용하는 공개 설정값을 읽습니다.
POST는 관리자 인증이 필요합니다.

### 예매 이동 추적

```text
GET /api/go
```

외부 예매처로 이동하기 전에 `booking_clicks`에 클릭 로그를 기록하고 302 redirect 합니다.

---

## 16. KOPIS 구조

관련 파일:

```text
src/app/api/kopis/route.ts
src/lib/kopis.ts
```

환경변수:

```text
KOPIS_API_KEY
```

KOPIS 데이터와 SHOWDAY 자체 등록 공연은 데이터 출처가 다르므로 운영 시 구분을 유지하는 것이 좋습니다.

사용자 화면에서는 출처보다 공연 탐색 경험을 우선하고, 필요한 법적/출처 표시는 Footer 또는 상세 영역에서 관리합니다.

---

## 17. 카카오 로그인

SHOWDAY 사용자 로그인은 Supabase Auth의 Kakao Provider를 사용합니다.

관련 파일:

```text
src/lib/auth.ts
src/app/auth/callback/route.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
```

설정 순서:

1. Kakao Developers 애플리케이션 생성
2. 카카오 로그인 활성화
3. REST API 키 확인
4. Supabase Authentication → Providers → Kakao 활성화
5. Kakao Redirect URI에 Supabase callback 등록
6. Supabase URL Configuration에 SHOWDAY callback 등록

배포 callback 예시:

```text
https://showday.kr/auth/callback
```

---

## 18. 추천 시스템

핵심 파일:

```text
src/lib/recommend.ts
src/lib/profile.ts
src/lib/artistAffinity.ts
src/types/show.ts
```

현재 추천은 단순히:

```text
50대 → 트로트
```

식으로 한 속성만 연결하는 방식이 아니라 여러 조건을 조합하는 방향입니다.

추천 프로필 조건:

- 연령대
- 지역
- 동행자
- 자녀 연령
- 선호 요일
- 이동거리
- 장르

---

## 19. 공연 타입

`src/types/show.ts`의 `Show` 타입은 KOPIS/추천 화면에서 사용하는 공연 객체 구조입니다.

주요 항목:

```text
id
title
genre
artist
venue
region
district
dayOfWeek
distanceFromDobongKm
dateLabel
priceLabel
priceValue
ageLabel
runningTime
tags
reason
posterUrl
bookingUrl
status
endDate
```

`manual_shows` DB 구조와 `Show` TypeScript 타입은 동일한 스키마가 아닙니다. API에서 사용자 화면용 형태로 변환하는 구조이므로 두 구조를 무리하게 하나로 합치지 않는 것이 좋습니다.

---

## 20. 환경변수

현재 소스에서 실제 참조하는 환경변수입니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

KOPIS_API_KEY=
SEOUL_OPEN_DATA_API_KEY=

NEXT_PUBLIC_KAKAO_JS_KEY=
KAKAO_REST_API_KEY=

ADMIN_PASSWORD=
```

### 공개 가능 여부

#### 브라우저 공개용

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_KAKAO_JS_KEY
```

#### 절대 클라이언트에 노출하면 안 되는 값

```text
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
KOPIS_API_KEY
KAKAO_REST_API_KEY
SEOUL_OPEN_DATA_API_KEY
```

> `SUPABASE_SERVICE_ROLE_KEY`는 특히 중요합니다. 브라우저 코드, GitHub 공개 저장소, HTML 소스에 절대 넣지 않습니다.

---

## 21. 관리자 보안 구조

관리자 API들은 대부분:

```text
isAdminAuthed()
```

검사를 통과해야 실행됩니다.

Supabase 관리자 DB 접근은:

```text
src/lib/supabase/admin.ts
```

의 service role client를 사용합니다.

이 방식 때문에 `manual_shows`, `booking_clicks`, `site_settings`, `site_notices`는 공개 RLS 정책 없이 서버 관리자 API를 통해 관리할 수 있습니다.

---

## 22. 공연 포스터 저작권 운영

관리자·업체 등록 공연에는:

```text
poster_rights_confirmed
```

필드가 있습니다.

업체 직접등록에서는 포스터 업로드 전에:

> 등록하는 포스터 이미지의 사용 권한을 보유하거나 SHOWDAY 게시에 필요한 사용 허락을 받았음을 확인

하도록 되어 있습니다.

운영상 이 동의값은 삭제하지 않는 것을 권장합니다.

---

## 23. 팝업 구조

SHOWDAY에는 성격이 다른 두 종류의 팝업이 있습니다.

### 1) 공연 팝업

관리자:

```text
/admin/popup
```

관련 데이터:

```text
manual_shows.is_featured
```

특정 등록 공연을 대표 팝업/추천 노출하는 목적입니다.

### 2) 홍보·공지 팝업

관리자:

```text
/admin/notices
```

관련 데이터:

```text
site_notices
```

이미지, 설명, 링크, 노출기간을 자유롭게 지정하는 공지·이벤트용입니다.

두 기능은 목적이 다르므로 하나의 테이블로 합치지 않는 편이 관리하기 쉽습니다.

---

## 24. 예매 클릭 데이터

사용자가 SHOWDAY에서 외부 예매처로 이동할 때:

```text
/api/go
```

를 거치게 하면 클릭 기록이:

```text
booking_clicks
```

에 저장됩니다.

이 데이터는 향후:

- 어떤 공연의 전환이 높은지
- 어느 예매처 클릭이 많은지
- 제휴 협상 자료
- 광고 상품 설계

등에 활용할 수 있습니다.

---

## 25. `src/components` 역할

| 파일 | 역할 |
|---|---|
| `Header.tsx` | 상단 내비게이션·로그인 |
| `Footer.tsx` | 하단 정보·사업자 정보 |
| `Hero.tsx` | 메인 검색/추천 진입 |
| `ShowCard.tsx` | 공연 카드 |
| `ArtistCard.tsx` | 아티스트 카드 |
| `VenueCard.tsx` | 공연장 카드 |
| `SectionRow.tsx` | 공통 섹션 행 |
| `SectionQuickNav.tsx` | 페이지 섹션 빠른 이동 |
| `ResponsiveDock.tsx` | 반응형 이동 메뉴 |
| `ShowdayNow.tsx` | SHOWDAY NOW 영역 |
| `ShowdayTrends.tsx` | 공연 트렌드 영역 |
| `ShowAdPopup.tsx` | 공연 광고 팝업 |
| `FloatingProductPromo.tsx` | 상품 프로모션 |
| `MyAreaSection.tsx` | 내 주변 공연 |
| `AroundSection.tsx` | 공연장 주변 정보 |
| `ParentsFiftyPlusSection.tsx` | 부모님/50+ 관련 섹션 |
| `AlertsPanel.tsx` | 공연 알림 UI |
| `ArenaNowBanner.tsx` | ARENA NOW 연결 |
| `KakaoChannelButton.tsx` | 카카오 채널 버튼 |
| `KakaoSdk.tsx` | Kakao JS SDK |
| `Icons.tsx` | 공통 아이콘 |

### 향후 정리 권장

현재 컴포넌트가 한 폴더에 모여 있어 파일 수가 늘면 찾기 어려워질 수 있습니다.

당장은 이동하지 말고, 추후 충분히 안정화된 뒤 아래처럼 기능 폴더로 정리할 수 있습니다.

```text
src/components/
├─ layout/
├─ home/
├─ show/
├─ admin/
├─ register/
└─ common/
```

**현재는 import 경로 파손 위험 때문에 기존 파일을 대규모 이동하지 않습니다.**

---

## 26. 파일 찾는 가장 빠른 방법

VS Code에서:

```text
Ctrl + Shift + F
```

을 사용합니다.

파일명을 모르더라도 화면에 보이는 문구를 검색하면 됩니다.

예:

```text
공연 등록·관리
홍보·공지 팝업
SHOWDAY NOW
보고 싶은 공연
내 주변
카카오톡 채널
```

검색 결과가 나오면 해당 파일을 먼저 열고, import 된 하위 컴포넌트를 따라가면 됩니다.

---

## 27. 수정할 때 지켜야 할 원칙

### 1. 파일을 먼저 이동하지 않는다

지금 프로젝트는 여러 파일이 서로 import 되어 있습니다.

폴더를 먼저 이동하면:

```text
Module not found
```

오류가 발생할 수 있습니다.

### 2. UI 문구 검색 → 실제 파일 확인 → 수정

파일명을 추측해서 수정하지 않습니다.

### 3. API와 화면을 같이 확인

예를 들어 `/register` 화면만 수정해도 실제 저장 필드는 `/api/register`와 `manual_shows`가 영향을 받을 수 있습니다.

### 4. DB 필드를 바꿀 때 migration 추가

기존 migration을 임의로 지우거나 덮어쓰기보다:

```text
0010_xxx.sql
0011_xxx.sql
```

처럼 새 migration을 추가합니다.

### 5. 관리자와 업체 권한을 섞지 않는다

```text
/admin       → 운영자
/register    → 외부 기획사·주최사
```

이 경계를 유지합니다.

---

## 28. 현재 우선 확인해야 할 항목

### P0 — 공개 포스터 업로드 API

`/register` 페이지가 호출하는:

```text
/api/register/upload
```

route가 현재 프로젝트 구조에 없습니다.

가장 먼저 보완해야 합니다.

### P1 — 공개 등록 스팸 방지 강화

현재 honeypot은 있지만 운영 공개 후에는 추가로 다음을 검토합니다.

- rate limit
- Cloudflare Turnstile 등 봇 방지
- IP 기반 과다 제출 제한
- 업로드 이미지 확장자/실제 MIME 검증

### P1 — 관리자 인증 고도화

현재는 단일 비밀번호 방식입니다.

운영자가 2명 이상이 되거나 외부 직원이 참여하면:

- 관리자 계정별 로그인
- 역할 권한
- 변경 로그

구조를 고려합니다.

### P2 — 업체 등록 조회/수정

현재 외부 업체는 제출 후 자기 공연을 직접 수정하는 계정 구조가 없습니다.

등록량이 늘면 다음 단계로:

```text
기획사 계정
→ 내가 등록한 공연
→ 수정 요청
→ 조회수
→ 관심수
→ 예매 클릭수
```

형태로 확장할 수 있습니다.

---

## 29. SHOWDAY와 ARENA NOW 분리 원칙

SHOWDAY:

```text
showday.kr
```

- 공연 발견
- 검색
- 추천
- 알림
- 아티스트
- 공연장
- 기획사 공연등록

ARENA NOW:

```text
arena.showday.kr
```

- 서울아레나 공연 당일 경험
- 교통
- 주차
- 짐보관
- 화장실
- 식음료
- 주변상권
- PARENTS TIME
- 현장 이슈

두 서비스의 코드를 하나로 섞지 않는 것이 원칙입니다.

---

## 30. 개발 단계

### SHOWDAY 현재

- 공연 탐색 메인
- KOPIS 연결
- 카카오 로그인
- 추천 프로필
- 관리자 공연등록
- 업체 공개 공연등록
- 팝업/공지
- 예매 클릭 추적
- 카카오 채널 설정

### 다음 우선순위

1. `/api/register/upload` 완성
2. 실제 공개 등록 전체 테스트
3. 관리자 승인 → 공개노출 검증
4. 공연 종료 자동 처리 점검
5. 관심 공연/알림 실제화
6. 사용자 행동 데이터 축적
7. 기획사 성과 리포트 구조 검토

---

## 31. 배포 전 체크리스트

```text
□ npm install 성공
□ npm run build 성공
□ Supabase migrations 0001~0009 적용
□ posters bucket 생성 확인
□ NEXT_PUBLIC_SUPABASE_URL 설정
□ NEXT_PUBLIC_SUPABASE_ANON_KEY 설정
□ SUPABASE_SERVICE_ROLE_KEY 설정
□ KOPIS_API_KEY 설정
□ ADMIN_PASSWORD 설정
□ Kakao Provider 설정
□ KAKAO_REST_API_KEY 설정
□ NEXT_PUBLIC_KAKAO_JS_KEY 설정
□ SEOUL_OPEN_DATA_API_KEY 설정
□ /auth/callback Redirect URI 확인
□ /admin 로그인 확인
□ /register 제출 확인
□ /register 포스터 업로드 확인
□ /admin/shows 검수대기 노출 확인
□ 게시중 전환 후 SHOWDAY 노출 확인
□ 종료 공연 비노출 확인
□ 공지 팝업 확인
□ 공연 팝업 확인
□ 모바일 UI 확인
□ 개인정보처리방침/이용약관 확인
```

---

## 32. CHANGELOG

### 2026-09-12

- 기획사·주최사 공개 공연등록 `/register` 추가
- 공개 공연등록 API `/api/register` 추가
- `manual_shows.submission_source` 추가
- `manual_shows.agency_email` 추가
- 업체 등록 공연을 관리자 화면에서 구분하도록 구조 정리
- README를 실제 프로젝트 구조 중심으로 전면 재정리
- 공개 등록 포스터 업로드 API 누락 상태 확인

### 2026-09-10

- 고객 검색·가입 중심 UX 개편
- 메인 메시지: 내 주변 / 아이와 함께 / 데이트 / 이번 주말 중심
- 온보딩 자녀 연령 조건 추가
- 카카오 로그인 실제 연결 중심으로 정리

### 2026-09-08

- SHOWDAY NOW 방향 보강
- 비로그인 10초 공연 추천 컨셉 정리
- 공연 목록 사이트보다 개인 공연비서 포지셔닝 강화

---

## 33. 핵심 운영 원칙

```text
1. SHOWDAY는 공연을 찾는 서비스다.
2. 업체는 /register에서 직접 공연을 제출한다.
3. /admin은 SHOWDAY 운영자만 사용한다.
4. 업체 제출 공연은 자동 공개하지 않는다.
5. 관리자가 검수 후 게시중으로 승인한다.
6. 담당자 개인정보는 사용자 화면에 공개하지 않는다.
7. KOPIS 공연과 SHOWDAY 직접등록 공연의 출처 구조를 구분한다.
8. ARENA NOW는 별도 서비스/저장소로 유지한다.
9. 환경변수와 service role key는 절대 공개하지 않는다.
10. 대규모 폴더 이동보다 기능 단위 점진적 정리를 우선한다.
```

---

## 34. 현재 가장 중요한 개발 포인트

SHOWDAY는 이미 메인·공연검색·KOPIS·관리자·공지·팝업·카카오·Supabase 구조가 상당 부분 갖춰져 있습니다.

따라서 지금은 새 기능을 계속 넓히기보다 다음 흐름을 완성하는 것이 중요합니다.

```text
기획사 공연등록
    ↓
관리자 검수
    ↓
SHOWDAY 공개
    ↓
관객 관심/클릭
    ↓
예매처 이동
    ↓
데이터 축적
    ↓
기획사·공연장 제휴 가치 확보
```

이 흐름이 안정적으로 작동하면 SHOWDAY는 단순 공연정보 사이트가 아니라 **공연기획사와 관객을 연결하고 실제 반응 데이터를 축적하는 공연 플랫폼**으로 발전할 수 있습니다.
