SHOWDAY 관심 아티스트 페이지 통합 네비게이션 FIX

덮어쓰기 파일
1. src/app/artists/page.tsx
2. src/components/layout/Header.tsx
3. src/components/navigation/ResponsiveDock.tsx
4. src/components/home/InterestArtistsSection.tsx

수정 내용
- /artists 전용 관심 아티스트 페이지 유지
- PC 우측 바로가기: 상단으로 / 메인 / 관심 아티스트 / 공연 소식 / ARENA NOW / MY SHOWDAY
- 관심 아티스트 페이지 하단에 SHOWDAY NOW 공연 소식 추가
- 관심 아티스트 페이지 하단에 ARENA NOW 배너 추가
- 모바일 하단 메뉴: 찾기 / 내 주변 / 공연 소식 / MY / ARENA
- Header의 관심 아티스트 링크를 /artists로 수정하고 현재 페이지 활성 표시
- 비로그인 상태에서 관심 아티스트 등록/알림 설정 시 카카오 간편 시작 유도 유지
- 기존 Ticket Open Engine / 복수 알림 설정이 들어간 InterestArtistsSection 유지
