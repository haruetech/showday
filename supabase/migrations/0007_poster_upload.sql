-- 포스터 이미지를 저장할 공개 버킷 (관리자 서버(service_role)에서만 업로드하고,
-- 누구나 그 이미지를 볼 수 있어야 하므로 public = true)
insert into storage.buckets (id, name, public)
values ('posters', 'posters', true)
on conflict (id) do nothing;

-- 포스터 이미지 사용 권한(저작권) 확인 여부 — 나중에 기획사가 직접 등록하는 구조로
-- 확장될 때를 대비해, 누가 언제 이 확인을 했는지 기록으로 남긴다.
alter table manual_shows
  add column if not exists poster_rights_confirmed boolean not null default false;
