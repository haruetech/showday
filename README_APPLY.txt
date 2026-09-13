SHOWDAY Ticket Open Engine 2차 보완

덮어쓰기/추가 파일 3개
1) src/components/home/InterestArtistsSection.tsx
2) src/app/my/page.tsx
3) src/app/api/ticket-info/route.ts

보완 내용
- 관심 아티스트 링크 /artists?artist=아티스트명 자동 선택
- 티켓 알림을 단일 시점이 아니라 복수 시점 동시 선택으로 변경
- 일정 발표 즉시 / 7일 전 / 3일 전 / 하루 전 / 3시간 전 / 1시간 전 / 10분 전 / 오픈 즉시
- 기존 ticketLead 저장값 자동 호환
- NOL/인터파크 등 예매 공지의 AM/PM 시간을 24시간 형태로 정규화
- 예매처 redirect가 허용된 도메인 안에서만 이동하도록 보안 강화
- 예매처 본문에서 일정 추출 실패 시 임의 시간을 생성하지 않음

이번 ZIP은 Hero.tsx를 포함하지 않습니다. 현재 무료공연 검색/신청상태 수정본을 덮어쓰지 않습니다.
