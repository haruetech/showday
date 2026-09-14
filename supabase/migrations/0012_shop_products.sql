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

create index if not exists shop_products_active_sort_idx
  on public.shop_products (is_active, sort_order, created_at desc);

alter table public.shop_products enable row level security;

-- 기존 SHOWDAY PICK 상품을 새 관리자 상품목록으로 안전하게 이관합니다.
-- 이미 같은 상품 링크가 있으면 중복 등록하지 않습니다.
insert into public.shop_products
  (title, description, image_url, product_url, price_label, sale_label, category, cta_label, is_active, is_featured, sort_order)
select
  '하루에 렌야 키높이 여성 스니커즈 6.5cm',
  '공연 가는 날에도 편안하고 가볍게.',
  'https://ca.lotteimall.com/S/storage001.daousync.com/v1/AUTH_78da087baa364fca88c704bf2ddb3904/image/1747033052723.jpg?imw=780&ol=4&sh=1280&v=250922163954',
  'https://posty.kr/products/161707873?from=search_result',
  '',
  '',
  'SHOWDAY PICK',
  '상품 보기',
  true,
  true,
  0
where not exists (
  select 1
  from public.shop_products
  where product_url = 'https://posty.kr/products/161707873?from=search_result'
);

-- 고객 화면은 서버 API를 통해 활성 상품만 읽습니다.
-- 관리자 등록/수정/삭제는 service role 기반 API에서 처리합니다.
