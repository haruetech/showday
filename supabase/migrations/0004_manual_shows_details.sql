alter table manual_shows
  add column if not exists show_time text,      -- 공연시간 안내 (예: "화~금 20:00, 토 15:00/19:00, 일 14:00")
  add column if not exists age_label text,      -- 관람연령 (예: "8세 이상 관람가")
  add column if not exists synopsis text,       -- 공연소개
  add column if not exists cast_info text,      -- 출연
  add column if not exists crew text,           -- 제작진
  add column if not exists producer text,       -- 기획·제작
  add column if not exists running_time text;   -- 러닝타임 (예: "150분(인터미션 20분 포함)")
