drop table if exists assignments cascade;
drop table if exists offers cascade;
drop table if exists publishers cascade;
drop table if exists faqs cascade;
drop table if exists promo_posts cascade;
drop table if exists vouchers cascade;
drop table if exists brands cascade;
drop function if exists public.get_publisher_config(text);
drop function if exists public.get_publisher_vouchers(text,text,int,int,text);

create table public.promo_content (
  id text primary key,
  type text not null check (type in ('faq','post')),
  title text not null,
  thumbnail_url text,
  description text not null,
  is_active boolean not null default true,
  last_updated timestamptz not null default now()
);
grant select on public.promo_content to anon, authenticated;
grant all on public.promo_content to service_role;
alter table public.promo_content enable row level security;
create policy "public read active content" on public.promo_content for select using (is_active = true);

create table public.brand (
  brand_id text primary key,
  brand_name text not null,
  brand_logo text,
  brand_description text,
  offer_ids jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  last_updated timestamptz not null default now()
);
grant select on public.brand to anon, authenticated;
grant all on public.brand to service_role;
alter table public.brand enable row level security;
create policy "public read active brand" on public.brand for select using (is_active = true);

create table public.domain_publisher (
  id uuid primary key default gen_random_uuid(),
  domain text unique,
  publisher_id text not null,
  publisher_name text not null,
  is_default boolean not null default false,
  theme jsonb not null default '{"primary":"#0E4B4F"}'::jsonb,
  site_name text not null default 'Săn Deal',
  logo_url text,
  header_footer_text jsonb not null default '{}'::jsonb,
  promo_post_selection jsonb not null default '{"mode":"default"}'::jsonb,
  faq_selection jsonb not null default '{"mode":"default"}'::jsonb,
  assignments jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  last_updated timestamptz not null default now()
);
create unique index uidx_one_default_publisher on public.domain_publisher (is_default) where is_default = true;
grant select on public.domain_publisher to anon, authenticated;
grant all on public.domain_publisher to service_role;
alter table public.domain_publisher enable row level security;
create policy "public read active domain_publisher" on public.domain_publisher for select using (is_active = true);

create table public.voucher (
  id text primary key,
  brand_id text not null references public.brand(brand_id) on delete cascade,
  title text not null,
  discount_percent numeric,
  discount_label text,
  type text not null default 'voucher' check (type in ('deal','voucher')),
  expired_date date,
  description text,
  voucher_code text,
  status integer not null default 1,
  last_updated timestamptz not null default now()
);
create index idx_voucher_brand_status on public.voucher(brand_id, status);
grant select on public.voucher to anon, authenticated;
grant all on public.voucher to service_role;
alter table public.voucher enable row level security;
create policy "public read active voucher" on public.voucher for select using (status >= 1);

create table public.update_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('insert','update','delete')),
  changed_data jsonb,
  changed_by text,
  changed_at timestamptz not null default now()
);
grant all on public.update_log to service_role;
alter table public.update_log enable row level security;

create or replace function public.fn_log_change() returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_row jsonb := to_jsonb(case when TG_OP = 'DELETE' then old else new end);
begin
  insert into public.update_log(table_name, record_id, action, changed_data, changed_by)
  values (TG_TABLE_NAME, coalesce(v_row->>'id', v_row->>'brand_id', 'unknown'), lower(TG_OP), v_row,
          coalesce(current_setting('request.jwt.claims', true)::jsonb->>'email', 'system'));
  return null;
end;
$$;

create trigger trg_log_brand after insert or update or delete on public.brand for each row execute function public.fn_log_change();
create trigger trg_log_voucher after insert or update or delete on public.voucher for each row execute function public.fn_log_change();
create trigger trg_log_domain_publisher after insert or update or delete on public.domain_publisher for each row execute function public.fn_log_change();
create trigger trg_log_promo_content after insert or update or delete on public.promo_content for each row execute function public.fn_log_change();

create or replace function public.get_publisher_config(p_domain text)
returns json language plpgsql stable set search_path = public as $$
declare
  v_row public.domain_publisher%rowtype;
  result json;
begin
  select * into v_row from public.domain_publisher where (domain = p_domain or publisher_id = p_domain) and is_active limit 1;
  if not found then
    select * into v_row from public.domain_publisher where is_default and is_active limit 1;
  end if;
  if not found then return null; end if;

  select json_build_object(
    'id', v_row.id, 'publisherId', v_row.publisher_id, 'publisherName', v_row.publisher_name,
    'theme', v_row.theme, 'siteName', v_row.site_name, 'logoUrl', v_row.logo_url,
    'headerFooterText', v_row.header_footer_text,
    'faqs', case when v_row.faq_selection->>'mode' = 'custom' then
        (select coalesce(json_agg(c), '[]'::json) from public.promo_content c
         where c.type='faq' and c.is_active and c.id = any(array(select jsonb_array_elements_text(v_row.faq_selection->'ids'))))
      else (select coalesce(json_agg(c), '[]'::json) from public.promo_content c where c.type='faq' and c.is_active) end,
    'promoPosts', case when v_row.promo_post_selection->>'mode' = 'custom' then
        (select coalesce(json_agg(c), '[]'::json) from public.promo_content c
         where c.type='post' and c.is_active and c.id = any(array(select jsonb_array_elements_text(v_row.promo_post_selection->'ids'))))
      else (select coalesce(json_agg(c), '[]'::json) from public.promo_content c where c.type='post' and c.is_active) end,
    'brands', (
      select coalesce(json_agg(json_build_object(
        'id', b.brand_id, 'name', b.brand_name, 'logoUrl', b.brand_logo, 'description', b.brand_description,
        'trackingLink', (elem->>'trackingLink')
      )), '[]'::json)
      from jsonb_array_elements(v_row.assignments) elem
      join public.brand b on b.brand_id = (elem->>'brandId') and b.is_active
    )
  ) into result;
  return result;
end;
$$;

create or replace function public.get_publisher_vouchers(
  p_domain text, p_brand_id text default null, p_page int default 1, p_limit int default 20, p_sort text default 'newest'
) returns json language plpgsql stable set search_path = public as $$
declare
  v_row public.domain_publisher%rowtype;
  v_allowed text[];
begin
  select * into v_row from public.domain_publisher where (domain = p_domain or publisher_id = p_domain) and is_active limit 1;
  if not found then select * into v_row from public.domain_publisher where is_default and is_active limit 1; end if;
  if not found then return json_build_object('vouchers','[]'::json,'total',0,'page',p_page,'limit',p_limit); end if;

  select array_agg(distinct (elem->>'brandId')) into v_allowed from jsonb_array_elements(v_row.assignments) elem;
  v_allowed := coalesce(v_allowed, array[]::text[]);
  if p_brand_id is not null and not (p_brand_id = any(v_allowed)) then
    return json_build_object('vouchers','[]'::json,'total',0,'page',p_page,'limit',p_limit);
  end if;

  return (
    with filtered as (
      select * from public.voucher where status >= 1 and brand_id = any(v_allowed) and (p_brand_id is null or brand_id = p_brand_id)
    ), sorted as (
      select * from filtered order by
        case when p_sort='discount' then discount_percent end desc nulls last,
        case when p_sort='expiry' then expired_date end asc nulls last,
        last_updated desc
    )
    select json_build_object(
      'vouchers', coalesce((select json_agg(row_to_json(s)) from (select * from sorted limit greatest(p_limit,1) offset (greatest(p_page,1)-1)*greatest(p_limit,1)) s), '[]'::json),
      'total', (select count(*) from filtered), 'page', greatest(p_page,1), 'limit', greatest(p_limit,1)
    )
  );
end;
$$;

insert into public.brand (brand_id, brand_name, brand_logo, brand_description, offer_ids) values
('shopee','Shopee',null,'Sàn thương mại điện tử','[{"offerId":"shopee_1","label":"Offer chuẩn"}]'),
('lazada','Lazada',null,'Sàn thương mại điện tử','[{"offerId":"lazada_1","label":"Offer chuẩn"}]'),
('grab','Grab',null,'Ăn uống & di chuyển','[{"offerId":"grab_1","label":"Offer chuẩn"}]');

insert into public.voucher (id, brand_id, title, discount_percent, type, expired_date, description, voucher_code, status) values
('shopee-v001','shopee','Giảm 35% toàn sàn, đơn từ 300k',35,'voucher','2026-09-30','Áp dụng cho một số sản phẩm được chọn.','SALE35OFF',1),
('lazada-v001','lazada','Săn quà Giáng Sinh cùng Lazada, giảm tới 50%',16,'deal',null,'Chào đón Noel, Lazada tặng ưu đãi giảm giá đặc biệt.',null,1);

insert into public.promo_content (id, type, title, description) values
('faq-1','faq','Mã giảm giá có dùng được nhiều lần không?','Tuỳ chương trình của từng brand, thường mỗi mã chỉ áp dụng 1 lần/tài khoản.'),
('faq-2','faq','Trang có thu phí khi dùng mã giảm giá không?','Không. Hoàn toàn miễn phí cho người dùng.'),
('post-1','post','Tổng hợp mã giảm giá Shopee tháng 9','<p>Cập nhật những mã hot nhất đang áp dụng trên Shopee tuần này...</p>');

insert into public.domain_publisher (domain, publisher_id, publisher_name, is_default, theme, site_name, assignments) values
(null, 'default', 'Săn Deal', true, '{"primary":"#0E4B4F"}', 'Săn Deal',
 '[{"brandId":"shopee","offerId":"shopee_1","trackingLink":"https://rutgon.me/123"},{"brandId":"lazada","offerId":"lazada_1","trackingLink":"https://rutgon.me/456"}]'),
('demo-pub.example.com', 'pub_001', 'Publisher Demo', false, '{"primary":"#1D4ED8"}', 'Deal Demo',
 '[{"brandId":"shopee","offerId":"shopee_1","trackingLink":"https://rutgon.me/999"}]');