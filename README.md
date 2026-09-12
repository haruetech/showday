# SHOWDAY 회차·좌석가격 업데이트

이 폴더는 GitHub 저장소 루트에 그대로 덮어쓰기 위한 업데이트 패키지입니다.

## 포함 파일

- `src/app/register/page.tsx`
  - 업체 직접 등록 화면
  - 공연기간
  - 날짜+시간 방식 회차 추가/삭제
  - 좌석등급별 가격 추가/삭제
- `src/app/api/register/route.ts`
  - 외부 업체 등록 API
  - manual_shows + show_schedules + show_ticket_prices 저장
- `src/app/admin/shows/page.tsx`
  - 관리자 회차/좌석가격 확인 및 수정
- `src/app/api/admin/shows/route.ts`
  - 관리자 공연 목록/등록 API
- `src/app/api/admin/shows/[id]/route.ts`
  - 관리자 공연 수정/삭제 API
- `supabase/migrations/0010_show_schedules_ticket_prices.sql`
  - 회차·좌석가격 테이블 생성

## 적용 순서

1. Supabase SQL Editor에서 `0010_show_schedules_ticket_prices.sql` 실행
2. 이 업데이트 폴더의 `src`와 `supabase` 폴더를 SHOWDAY 저장소 루트에 그대로 덮어쓰기
3. GitHub Commit / Push
4. Vercel 빌드가 Ready인지 확인
5. `/register`에서 테스트 등록
6. `/admin/shows`에서 회차와 좌석가격 확인

## 데이터 예시

공연 회차:
- 2026-09-12 15:00
- 2026-09-12 19:00
- 2026-09-13 15:00

티켓 가격:
- VIP석 154,000원
- R석 132,000원
- S석 110,000원
- 전석 0원 (무료 공연도 가능)

기존 `manual_shows.show_time`과 `price_label`도 자동 생성해 기존 SHOWDAY 화면과 호환됩니다.
