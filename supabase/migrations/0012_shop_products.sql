create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text not null default '',
  product_url text not null,
  price_label text not null default '',
  sale_label text not null default '',
  category text not null default '추천상품',
  cta_label text not null default '상품 보기',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shop_products_active_sort_idx on public.shop_products (is_active, sort_order, created_at desc);
alter table public.shop_products enable row level security;
-- 고객 화면은 서버 API를 통해 활성 상품만 읽습니다. 관리자 쓰기는 service role 전용입니다.
