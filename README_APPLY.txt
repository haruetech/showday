SHOWDAY Ticket Open Engine 1차

덮어쓰기/추가:
1) src/app/artists/page.tsx
2) src/components/home/InterestArtistsSection.tsx
3) src/app/my/page.tsx
4) src/app/api/ticket-info/route.ts (새 파일)

기능:
- 관심 아티스트 예정공연 + 공연일정
- 공식 예매처 URL이 있으면 서버에서 공지 본문을 확인해 선예매/일반예매/휠체어석 날짜·시간 추출 시도
- 확인된 값만 표시, 추출 실패 시 '예매일정 확인'으로 안내
- 티켓 알림: 일정 발표 / 7일 전 / 하루 전 / 1시간 전 / 10분 전 / 오픈 즉시
- MY SHOWDAY와 동일 localStorage 알림설정 공유

주의:
- 예매처가 봇 접근을 막거나 JS로만 공지를 렌더링하면 자동 추출되지 않을 수 있음.
- 실제 푸시/카카오 자동 발송은 별도 스케줄러/발송 서버 연결이 필요함.
- Hero.tsx는 포함하지 않았으므로 현재 무료공연 수정본을 그대로 유지함.
