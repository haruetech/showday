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
