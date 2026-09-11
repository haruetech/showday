-- 관리자(admin.showday.kr) 화면에서 쓸 테이블 2개.
-- 둘 다 서버(SUPABASE_SERVICE_ROLE_KEY)를 통해서만 쓰고 읽으므로,
-- RLS는 켜두되 공개 정책은 만들지 않는다(= 클라이언트 anon key로는 접근 불가, 서버 admin 클라이언트만 접근 가능).

create table if not exists manual_shows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  genre text not null,
  venue text not null,
  region text,
  period text not null,
  price_label text,
  booking_url text,
  poster_url text,
  agency_name text not null,
  agency_contact text,
  status text not null default '검토중', -- 검토중 / 게시중 / 종료
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table manual_shows enable row level security;

create table if not exists booking_clicks (
  id bigint generated always as identity primary key,
  platform text not null,
  show_id text not null,
  target_url text,
  created_at timestamptz not null default now()
);
alter table booking_clicks enable row level security;

create index if not exists booking_clicks_created_at_idx on booking_clicks(created_at desc);
create index if not exists booking_clicks_platform_idx on booking_clicks(platform);
