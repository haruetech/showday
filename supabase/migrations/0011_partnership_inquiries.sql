-- 제휴·광고 문의 (/partnership 공개 폼) 저장용 테이블.
-- 로그인 없이 제출되며, 서버 API(service role)를 통해서만 INSERT/SELECT 한다.
create table if not exists partnership_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null default '기타', -- 제휴 | 광고 | 기타
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  message text not null,
  status text not null default 'new', -- new | read
  created_at timestamptz not null default now()
);
alter table partnership_inquiries enable row level security;
create index if not exists partnership_inquiries_created_idx on partnership_inquiries(created_at desc);
