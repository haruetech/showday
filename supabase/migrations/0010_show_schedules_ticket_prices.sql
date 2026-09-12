-- SHOWDAY 공연 회차 및 좌석별 티켓 가격
-- manual_shows 1건에 여러 회차와 여러 좌석 가격을 연결합니다.

create table if not exists show_schedules (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references manual_shows(id) on delete cascade,
  performance_date date not null,
  start_time time not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists show_schedules_show_id_idx
  on show_schedules(show_id, performance_date, start_time);

create table if not exists show_ticket_prices (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references manual_shows(id) on delete cascade,
  seat_grade text not null,
  price integer not null check (price >= 0),
  price_note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists show_ticket_prices_show_id_idx
  on show_ticket_prices(show_id, sort_order);

alter table show_schedules enable row level security;
alter table show_ticket_prices enable row level security;

-- 브라우저에서 직접 INSERT하지 않습니다.
-- /api/register 및 /api/admin/shows가 service role로 처리합니다.
