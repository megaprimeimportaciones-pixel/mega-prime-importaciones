begin;
alter table public.members add column if not exists display_name text not null default '' check(length(display_name)<=120);
commit;
