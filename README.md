# SHOWDAY Next.js 1.1 — KOPIS LIVE

SHOWDAY의 실제 운영형 1차 구조입니다. Next.js App Router 기반이며 KOPIS Open API v5.0 공연 목록/상세 API를 서버에서 직접 호출합니다.

## 포함 기능
- 비로그인 / 개인화 홈 데모 토글
- KOPIS 공연목록 실제 연동 (키 설정 시 홈 카드가 실데이터로 교체)
- KOPIS 공연상세 API 프록시
- 서버 전용 API Key 보호
- KOPIS 장애/키 미설정 시 데모 데이터 fallback
- SHOWDAY 메인 / ARENA NOW 구조 유지

## 시작
```bash
npm install
cp .env.example .env.local
# .env.local에서 KOPIS_API_KEY 입력
npm run dev
```

## API 확인
- `GET /api/kopis/shows?rows=20`
- `GET /api/kopis/shows?rows=20&area=11` (서울)
- `GET /api/kopis/shows?q=공연명`
- `GET /api/kopis/shows?venue=예술의전당`
- `GET /api/kopis/shows/PF132236`

## KOPIS 공식 제약 반영
- 공연 목록 조회 기간 최대 31일
- 페이지당 최대 100건
- XML 응답을 서버에서 JSON/SHOWDAY 모델로 변환
- 목록 endpoint: `http://www.kopis.or.kr/openApi/restful/pblprfr`
- 상세 endpoint: `http://www.kopis.or.kr/openApi/restful/pblprfr/{공연ID}`

## 다음 개발
1. Supabase: 사용자/찜/아티스트 팔로우/알림조건 저장
2. KOPIS sync job: 공연을 SHOWDAY 자체 DB에 정기 적재
3. 공연 상세 페이지 `/shows/[id]`
4. AI 추천 스코어링 + 자연어 조건 알림
5. 서울아레나 공연장 ID 확정 후 `/arena` 자동 필터링

> 운영에서는 KOPIS API를 매 화면마다 직접 호출하기보다 Supabase에 동기화해 검색/추천 속도와 안정성을 확보하는 방식을 권장합니다.
