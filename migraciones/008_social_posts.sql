alter table public.posts add column external_url text, add column platform text not null default 'web' check(platform in ('web','whatsapp','tiktok','facebook','youtube','instagram','x','other')), add column pinned boolean not null default false, add column external_id text unique;
alter table public.posts add constraint external_url_https check(external_url is null or external_url ~ '^https://[^[:space:]]+$');
create index posts_pinned_recent on public.posts(pinned desc,created_at desc);
