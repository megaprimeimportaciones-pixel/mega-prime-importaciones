begin;
alter table public.inquiries add column if not exists kind text not null default 'chat' check(kind in ('chat','cotizacion'));
alter table public.inquiries add column if not exists quote jsonb check(quote is null or (jsonb_typeof(quote)='object' and octet_length(quote::text)<60000));
commit;
