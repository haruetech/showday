alter table manual_shows
  add column if not exists is_featured boolean not null default false;

create index if not exists manual_shows_featured_idx on manual_shows(is_featured, status, created_at desc);
