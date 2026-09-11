create table if not exists site_notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  image_url text,
  link_url text,
  link_label text not null default '자세히 보기',
  is_active boolean not null default false,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table site_notices enable row level security;
create index if not exists site_notices_active_idx on site_notices(is_active, created_at desc);
