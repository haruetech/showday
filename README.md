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
