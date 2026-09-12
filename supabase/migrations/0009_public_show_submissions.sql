-- 외부 기획사·주최사의 로그인 없는 공연 등록(/register)을 관리하기 위한 필드.
-- 공개 폼은 서버 API(service role)를 통해서만 manual_shows에 INSERT한다.
alter table manual_shows
  add column if not exists agency_email text,
  add column if not exists submission_source text not null default 'admin',
  add column if not exists privacy_consent_at timestamptz;

create index if not exists manual_shows_submission_source_idx
  on manual_shows(submission_source, status, created_at desc);
