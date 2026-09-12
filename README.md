# SHOWDAY ADMIN

SHOWDAY 공연 등록·승인·게시 관리 기능의 적용 및 운영 안내입니다.

## 포함된 주요 기능

- 외부 기획사·주최사 `/register` 공연 등록
- 외부 등록 공연 검토 및 승인·게시
- 보완요청 및 반려
- SHOWDAY 본사 공연 직접 등록
- 공연기간 관리
- 공연 회차별 날짜·시간 관리
- 좌석등급별 티켓 가격 관리
- 공연명·공연장·기획사 검색
- 상태별 필터
- 외부등록 / 본사등록 필터
- 최근등록순 / 공연일 임박순 / 검토대기 우선 정렬
- 외부 등록건 검토대기 시간 표시
- 승인 전 검수 체크리스트
- 관리자 처리 이력용 DB 구조
- `start_date`, `end_date` TypeScript 타입 오류 수정

## 폴더 구조

```text
src/
  app/
    admin/
      AdminNav.tsx
      shows/
        page.tsx
    api/
      admin/
        shows/
          route.ts
          [id]/
            route.ts

supabase/
  migrations/
    0011_admin_operations.sql
```

## GitHub 적용 방법

기존 SHOWDAY 프로젝트를 삭제하지 않습니다.

이 패키지의 `src`와 `supabase` 폴더를 기존 GitHub 저장소의 동일한 경로에 업로드하여 변경된 파일만 덮어씁니다.

GitHub에 반영한 뒤 Vercel의 새 배포가 `Ready`인지 확인합니다.

## Supabase 적용

`supabase/migrations/0011_admin_operations.sql`을 아직 실행하지 않았다면 Supabase SQL Editor에서 한 번 실행합니다.

이미 실행했다면 다시 실행할 필요가 없습니다.

## 운영 흐름

외부 기획사·주최사:

`/register 등록 → 검토중 → 내용 확인·수정 → 승인·게시 / 보완요청 / 반려`

SHOWDAY 본사:

`ADMIN 직접 등록 → 등록·게시 공연 관리`

## 승인 전 권장 검수

- 포스터
- 일정·회차
- 공연장
- 좌석·가격
- 예매링크
- 주최·기획사
- 이미지·콘텐츠 사용권 확인

## 배포 오류 확인

Vercel에서 배포 실패 시 가장 최근 Deployment의 TypeScript 오류를 확인합니다.

이번 패키지에는 기존 오류였던 다음 필드의 타입 정의가 반영되어 있습니다.

```ts
start_date?: string;
end_date?: string;
```

## 다음 개발 권장 기능

현재 등록→검수→승인→게시 흐름이 안정화된 뒤 아래 기능을 추가하는 것을 권장합니다.

- 중복 공연 자동 탐지
- 실제 SHOWDAY 사용자 화면 미리보기
- 공연 종료 자동 처리
- 공연별 상세조회·예매클릭·찜·알림·공유 통계
- # SHOWDAY ADMIN 운영기능 추가 패키지

이번 버전은 현재 `공연 승인·등록` 구조 위에 실제 운영에 필요한 기능을 추가합니다.

## 이번에 추가한 기능
1. `보완요청` 상태 추가
2. 공연명·공연장·기획사 검색
3. 상태 필터: 검토중 / 보완요청 / 게시중 / 종료 / 반려
4. 등록경로 필터: 외부 / 본사
5. 정렬: 최근등록순 / 공연일 임박순 / 검토대기 우선
6. 외부 요청의 검토대기 시간 표시
7. 승인 전 7개 검수 체크리스트
   - 포스터
   - 일정·회차
   - 공연장
   - 좌석·가격
   - 예매링크
   - 주최·기획사
   - 저작권
8. 관리 이력용 `show_admin_logs` 테이블 기반 추가

## 적용 순서
1. Supabase SQL Editor에서 `supabase/migrations/0011_admin_operations.sql` 실행
2. ZIP의 `src` 폴더를 SHOWDAY 저장소 루트에 덮어쓰기
3. Commit → Push
4. Vercel 배포 성공 확인

## 다음 단계로 남겨둔 기능
- 중복 공연 자동탐지
- 실제 사용자 화면 미리보기
- 공연 종료 자동처리
- 공연별 노출/상세조회/예매클릭/찜/알림/공유 통계

위 네 기능은 데이터 연결 범위가 더 넓어 현재 등록·승인 흐름을 먼저 안정화한 뒤 붙이는 것이 안전합니다.

# SHOWDAY ADMIN 운영기능 추가 패키지

이번 버전은 현재 `공연 승인·등록` 구조 위에 실제 운영에 필요한 기능을 추가합니다.

## 이번에 추가한 기능
1. `보완요청` 상태 추가
2. 공연명·공연장·기획사 검색
3. 상태 필터: 검토중 / 보완요청 / 게시중 / 종료 / 반려
4. 등록경로 필터: 외부 / 본사
5. 정렬: 최근등록순 / 공연일 임박순 / 검토대기 우선
6. 외부 요청의 검토대기 시간 표시
7. 승인 전 7개 검수 체크리스트
   - 포스터
   - 일정·회차
   - 공연장
   - 좌석·가격
   - 예매링크
   - 주최·기획사
   - 저작권
8. 관리 이력용 `show_admin_logs` 테이블 기반 추가

## 적용 순서
1. Supabase SQL Editor에서 `supabase/migrations/0011_admin_operations.sql` 실행
2. ZIP의 `src` 폴더를 SHOWDAY 저장소 루트에 덮어쓰기
3. Commit → Push
4. Vercel 배포 성공 확인

## 다음 단계로 남겨둔 기능
- 중복 공연 자동탐지
- 실제 사용자 화면 미리보기
- 공연 종료 자동처리
- 공연별 노출/상세조회/예매클릭/찜/알림/공유 통계

위 네 기능은 데이터 연결 범위가 더 넓어 현재 등록·승인 흐름을 먼저 안정화한 뒤 붙이는 것이 안전합니다.

# SHOWDAY 관리자 구조 수정

이 패키지는 기존 회차·좌석가격 업데이트 이후 관리자 화면을 운영 흐름에 맞게 분리합니다.

## 변경점
- `/admin/shows` 제목: 공연 승인·등록
- 외부 `/register` 등록건:
  - `submission_source = public-register`
  - 기본 `status = 검토중`
  - 관리자에서 `승인·게시 / 반려 / 내용 확인·수정`
- SHOWDAY 본사 관리자 직접등록:
  - `+ 본사 공연 직접 등록`
  - 기본 `submission_source = admin`
  - 저장 즉시 `status = 게시중`
- 목록을 `외부 공연 등록 요청` / `등록·게시 공연`으로 분리
- 관리자 메뉴 문구를 `공연 승인·등록`으로 변경

## 덮어쓰기 파일
- `src/app/admin/AdminNav.tsx`
- `src/app/admin/shows/page.tsx`
- `src/app/api/admin/shows/route.ts`
- `src/app/api/admin/shows/[id]/route.ts`

## 적용
이 폴더의 `src`를 SHOWDAY 저장소 루트에 그대로 덮어쓴 뒤 Commit/Push 하세요.
기존 `0010_show_schedules_ticket_prices.sql`은 이미 실행했다면 다시 실행할 필요 없습니다.

# SHOWDAY 구조 정리 변경사항 — 2026-09-12

## 정리한 내용
- `src/components`를 common/layout/home/show/artist/venue/navigation/promotion/kakao로 분류했습니다.
- 이동된 컴포넌트의 `@/components/...` import 경로를 모두 새 위치에 맞춰 수정했습니다.
- 프로젝트 루트에 중복되어 있던 `KakaoChannelButton.tsx`는 실제 사용되는 `src/components/kakao/KakaoChannelButton.tsx`만 남겼습니다.
- 공개 공연등록 `/register`를 추가했습니다.
- 공개 등록 저장 API `/api/register`를 추가했습니다.
- 공개 포스터 업로드 API `/api/register/upload`를 추가했습니다.
- `0009_public_show_submissions.sql`을 추가했습니다.
- `/admin/shows`에서 외부 업체 등록 건을 구분할 수 있도록 `업체 직접등록` 표시와 담당자 연락 정보를 추가했습니다.
- README를 실제 프로젝트 파일 위치를 찾기 위한 개발 지도 형태로 전면 개편했습니다.

## 배포 전에 반드시 할 것
1. Supabase SQL Editor에서 `supabase/migrations/0009_public_show_submissions.sql` 실행
2. Vercel에 `SUPABASE_SERVICE_ROLE_KEY` 등 기존 환경변수가 정상인지 확인
3. `/register`에서 테스트 공연 1건 등록
4. 포스터 업로드 확인
5. `/admin/shows`에서 `업체 직접등록` 배지와 검토중 상태 확인
6. 상태를 `게시중`으로 바꾼 뒤 실제 공개 데이터 반영 확인
7. 로컬 또는 Vercel Preview에서 `npm run build` 최종 확인

## 구조 정리 원칙
`src/app`은 URL 라우트이므로 위치를 임의로 변경하지 않았습니다. 정리가 필요한 UI 컴포넌트만 기능별 하위 폴더로 이동했습니다.
