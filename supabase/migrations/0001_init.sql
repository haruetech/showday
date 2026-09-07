-- SHOWDAY 1.0 → 1.5 전환용 초기 스키마.
-- 지금은 src/lib/profile.ts가 localStorage를 쓰지만, 이 테이블이 생기면
-- profile.ts 내부 구현만 Supabase 호출로 바꾸면 되도록 필드를 맞춰뒀습니다.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  age_band text not null,          -- "20대" ~ "60대 이상"
  district text not null,          -- "도봉구" 등
  companion text not null,         -- "혼자" / "배우자와 함께" 등
  preferred_day text not null,     -- "평일" / "토요일" / "일요일"
  max_distance_km integer not null,
  genres text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "본인 프로필만 조회" on profiles
  for select using (auth.uid() = id);

create policy "본인 프로필만 수정" on profiles
  for insert with check (auth.uid() = id);

create policy "본인 프로필만 업데이트" on profiles
  for update using (auth.uid() = id);

-- 관심 아티스트 (MY ARTISTS 실제화 시 사용)
create table if not exists artist_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, artist_id)
);

alter table artist_follows enable row level security;

create policy "본인 팔로우만 조회" on artist_follows
  for select using (auth.uid() = user_id);

create policy "본인 팔로우만 등록/삭제" on artist_follows
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
