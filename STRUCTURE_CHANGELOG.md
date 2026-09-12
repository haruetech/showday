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
