create table public.brands (
  id text primary key,
  name text not null,
  logo_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.brands to anon, authenticated;
grant all on public.brands to service_role;
alter table public.brands enable row level security;
create policy "public read active brands" on public.brands for select to anon, authenticated using (is_active = true);

create table public.offers (
  id text primary key,
  brand_id text not null references public.brands(id) on delete cascade,
  label text,
  is_active boolean not null default true
);
grant select on public.offers to anon, authenticated;
grant all on public.offers to service_role;
alter table public.offers enable row level security;
create policy "public read active offers" on public.offers for select to anon, authenticated using (is_active = true);

create table public.vouchers (
  id text primary key,
  brand_id text not null references public.brands(id) on delete cascade,
  title text not null,
  discount_percent numeric,
  discount_label text,
  type text not null default 'voucher' check (type in ('deal','voucher')),
  expired_date date,
  description text,
  voucher_code text,
  status integer not null default 1,
  created_at timestamptz not null default now()
);
grant select on public.vouchers to anon, authenticated;
grant all on public.vouchers to service_role;
alter table public.vouchers enable row level security;
create policy "public read active vouchers" on public.vouchers for select to anon, authenticated using (status >= 1);

create table public.publishers (
  id text primary key,
  name text not null,
  domain text unique,
  is_default boolean not null default false,
  theme jsonb not null default '{}'::jsonb,
  show_faq boolean not null default true,
  show_promo_posts boolean not null default true,
  is_active boolean not null default true
);
grant select on public.publishers to anon, authenticated;
grant all on public.publishers to service_role;
alter table public.publishers enable row level security;
create policy "public read active publishers" on public.publishers for select to anon, authenticated using (is_active = true);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  publisher_id text not null references public.publishers(id) on delete cascade,
  offer_id text not null references public.offers(id) on delete cascade,
  tracking_link text not null,
  sort_order integer default 0,
  is_active boolean not null default true,
  unique(publisher_id, offer_id)
);
grant select on public.assignments to anon, authenticated;
grant all on public.assignments to service_role;
alter table public.assignments enable row level security;
create policy "public read active assignments" on public.assignments for select to anon, authenticated using (is_active = true);

create table public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  sort_order integer default 0
);
grant select on public.faqs to anon, authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "public read faqs" on public.faqs for select to anon, authenticated using (true);

create table public.promo_posts (
  id text primary key,
  title text not null,
  excerpt text not null,
  thumbnail_url text,
  published_at date not null default current_date,
  url text
);
grant select on public.promo_posts to anon, authenticated;
grant all on public.promo_posts to service_role;
alter table public.promo_posts enable row level security;
create policy "public read promo posts" on public.promo_posts for select to anon, authenticated using (true);

create index idx_vouchers_brand_status on public.vouchers(brand_id, status);
create index idx_assignments_publisher on public.assignments(publisher_id);

create or replace function public.get_publisher_config(p_domain text)
returns json
language plpgsql
stable
set search_path = public
as $$
declare
  v_publisher_id text;
  result json;
begin
  select id into v_publisher_id from public.publishers
  where (domain = p_domain or id = p_domain) and is_active limit 1;
  if v_publisher_id is null then
    select id into v_publisher_id from public.publishers where is_default and is_active limit 1;
  end if;

  select json_build_object(
    'id', p.id, 'name', p.name, 'theme', p.theme,
    'showFaq', p.show_faq, 'showPromoPosts', p.show_promo_posts,
    'brands', coalesce((
      select json_agg(json_build_object(
        'id', b.id, 'name', b.name, 'logoUrl', b.logo_url,
        'description', b.description, 'trackingLink', a.tracking_link
      ) order by a.sort_order)
      from public.assignments a
      join public.offers o on o.id = a.offer_id
      join public.brands b on b.id = o.brand_id
      where a.publisher_id = p.id and a.is_active and o.is_active and b.is_active
    ), '[]'::json)
  ) into result
  from public.publishers p where p.id = v_publisher_id;

  return result;
end;
$$;
grant execute on function public.get_publisher_config(text) to anon, authenticated;

create or replace function public.get_publisher_vouchers(
  p_domain text,
  p_brand_id text default null,
  p_page int default 1,
  p_limit int default 20,
  p_sort text default 'newest'
)
returns json
language plpgsql
stable
set search_path = public
as $$
declare
  v_publisher_id text;
  v_allowed_brand_ids text[];
begin
  select id into v_publisher_id from public.publishers
  where (domain = p_domain or id = p_domain) and is_active limit 1;
  if v_publisher_id is null then
    select id into v_publisher_id from public.publishers where is_default and is_active limit 1;
  end if;

  select array_agg(distinct b.id) into v_allowed_brand_ids
  from public.assignments a
  join public.offers o on o.id = a.offer_id
  join public.brands b on b.id = o.brand_id
  where a.publisher_id = v_publisher_id and a.is_active and o.is_active and b.is_active;

  if p_brand_id is not null and not (p_brand_id = any(coalesce(v_allowed_brand_ids, array[]::text[]))) then
    return json_build_object('vouchers', '[]'::json, 'total', 0, 'page', p_page, 'limit', p_limit);
  end if;

  return (
    with filtered as (
      select * from public.vouchers
      where status >= 1
        and brand_id = any(coalesce(v_allowed_brand_ids, array[]::text[]))
        and (p_brand_id is null or brand_id = p_brand_id)
    ), sorted as (
      select * from filtered
      order by
        case when p_sort = 'discount' then discount_percent end desc nulls last,
        case when p_sort = 'expiry' then expired_date end asc nulls last,
        created_at desc
    )
    select json_build_object(
      'vouchers', coalesce((select json_agg(row_to_json(s)) from (
          select * from sorted limit greatest(p_limit, 1) offset (greatest(p_page, 1)-1)*greatest(p_limit, 1)
        ) s), '[]'::json),
      'total', (select count(*) from filtered),
      'page', greatest(p_page, 1), 'limit', greatest(p_limit, 1)
    )
  );
end;
$$;
grant execute on function public.get_publisher_vouchers(text,text,int,int,text) to anon, authenticated;

insert into public.publishers (id, name, domain, is_default, theme, show_faq, show_promo_posts, is_active) values
('default', 'Săn Deal', null, true, '{"brand":"#0E4B4F","accent":"#E2451B"}', true, true, true),
('demo-pub', 'Publisher Demo', null, false, '{"brand":"#1D4ED8","accent":"#DB2777"}', true, false, true);

insert into public.brands (id, name, logo_url, description, is_active) values
('shopee', 'Shopee', null, 'Sàn thương mại điện tử', true),
('lazada', 'Lazada', null, 'Sàn thương mại điện tử', true),
('grab', 'Grab', null, 'Ăn uống & di chuyển', true);

insert into public.offers (id, brand_id, label, is_active) values
('shopee_1', 'shopee', 'Shopee - offer chuẩn', true),
('lazada_1', 'lazada', 'Lazada - offer chuẩn', true),
('grab_1', 'grab', 'Grab - offer chuẩn', true);

insert into public.vouchers (id, brand_id, title, discount_percent, discount_label, type, expired_date, description, voucher_code, status) values
('shopee-v001','shopee','Giảm 35% toàn sàn, đơn từ 300k',35,null,'voucher','2026-09-30','Áp dụng cho một số sản phẩm được chọn.','SALE35OFF',1),
('lazada-v001','lazada','Săn quà Giáng Sinh cùng Lazada, giảm tới 50%',16,null,'deal',null,'Chào đón Noel, Lazada tặng ưu đãi giảm giá đặc biệt.',null,1);

insert into public.assignments (publisher_id, offer_id, tracking_link, sort_order, is_active) values
('default','shopee_1','https://rutgon.me/123',1,true),
('default','lazada_1','https://rutgon.me/456',2,true),
('demo-pub','shopee_1','https://rutgon.me/999',1,true);

insert into public.faqs (id, question, answer, sort_order) values
('faq-1','Mã giảm giá có dùng được nhiều lần không?','Tuỳ chương trình của từng brand, thường mỗi mã chỉ áp dụng 1 lần/tài khoản.',1),
('faq-2','Trang có thu phí khi dùng mã giảm giá không?','Không. Hoàn toàn miễn phí cho người dùng.',2);

insert into public.promo_posts (id, title, excerpt, published_at) values
('post-1','Tổng hợp mã giảm giá Shopee tháng 9','Cập nhật những mã hot nhất đang áp dụng trên Shopee tuần này.','2026-09-08');