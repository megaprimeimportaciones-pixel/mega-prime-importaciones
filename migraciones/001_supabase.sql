begin;
create table public.members (
 id uuid primary key references auth.users on delete cascade,
 email text not null, role text not null default 'editor' check(role in ('owner','editor')),
 active boolean not null default true, revoked_before timestamptz not null default 'epoch',
 created_at timestamptz not null default now()
);
create table public.blocked_sessions (id uuid primary key, user_id uuid not null references auth.users on delete cascade);
create function public.staff_role() returns text language sql stable security definer set search_path=public as $$
 select role from members where id=auth.uid() and active
 and exists(select 1 from auth.sessions s where s.id=(auth.jwt()->>'session_id')::uuid and s.user_id=auth.uid() and s.created_at>revoked_before)
 and not exists(select 1 from blocked_sessions where id=(auth.jwt()->>'session_id')::uuid)
$$;
create table public.content (id int primary key check(id=1), config jsonb not null, revision int not null default 0, updated_at timestamptz not null default now());
create table public.versions (id bigint generated always as identity primary key, config jsonb not null, revision int not null, description text not null, created_at timestamptz not null default now(), actor uuid references auth.users);
create table public.posts (id uuid primary key default gen_random_uuid(), title text not null check(length(title)<200), body text not null default '', media text, kind text check(kind in ('image','video')), published boolean not null default false, expires_at timestamptz, created_at timestamptz not null default now());
create table public.inquiries (id uuid primary key default gen_random_uuid(), name text not null, contact text not null, question text not null, consent boolean not null check(consent), status text not null default 'pendiente' check(status in ('pendiente','en proceso','resuelta')), created_at timestamptz not null default now());
create table public.contact_lists (id uuid primary key default gen_random_uuid(), name text not null, contacts jsonb not null, consent_at timestamptz not null, created_at timestamptz not null default now());
alter table public.members enable row level security;
alter table public.blocked_sessions enable row level security;
alter table public.content enable row level security;
alter table public.versions enable row level security;
alter table public.posts enable row level security;
alter table public.inquiries enable row level security;
alter table public.contact_lists enable row level security;
create policy member_read on public.members for select to authenticated using(id=auth.uid() or public.staff_role()='owner');
create policy content_read on public.content for select to anon,authenticated using(true);
create policy versions_read on public.versions for select to authenticated using(public.staff_role()='owner');
create policy posts_read on public.posts for select to anon,authenticated using((published and (expires_at is null or expires_at>now())) or public.staff_role() is not null);
create policy posts_write on public.posts for all to authenticated using(public.staff_role() is not null) with check(public.staff_role() is not null);
create policy inquiries_staff on public.inquiries for all to authenticated using(public.staff_role() is not null) with check(public.staff_role() is not null);
create policy lists_owner on public.contact_lists for all to authenticated using(public.staff_role()='owner') with check(public.staff_role()='owner');
grant select on public.content,public.posts to anon;
grant select on public.members,public.content,public.versions to authenticated;
grant select,insert,update,delete on public.posts,public.inquiries,public.contact_lists to authenticated;
revoke all on public.blocked_sessions from anon,authenticated;
revoke insert,update,delete on public.members,public.content,public.versions from anon,authenticated;
create function public.publish_content(payload jsonb, expected_revision int, description text default 'Publicación', restore_id bigint default null) returns int
language plpgsql security definer set search_path=public as $$
declare r int; old jsonb;
begin
 if public.staff_role() is null then raise exception 'Acceso denegado'; end if;
 if restore_id is not null then
  if public.staff_role()<>'owner' then raise exception 'Solo propietario'; end if;
  select config into payload from versions where id=restore_id;
 end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>2000000 then raise exception 'Contenido inválido'; end if;
 perform pg_advisory_xact_lock(942001);
 select revision,config into r,old from content where id=1 for update;
 r:=coalesce(r,0);
 if r<>expected_revision then raise exception 'CONFLICT: otro integrante publicó. Conserva tu borrador y carga la nueva versión.'; end if;
 if old is not null then insert into versions(config,revision,description,actor) values(old,r,left(description,200),auth.uid()); end if;
 insert into content(id,config,revision) values(1,payload,r+1) on conflict(id) do update set config=excluded.config,revision=excluded.revision,updated_at=now();
 return r+1;
end $$;
revoke all on function public.publish_content(jsonb,int,text,bigint) from public;
grant execute on function public.publish_content(jsonb,int,text,bigint) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',true,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']);
create policy media_read on storage.objects for select to anon,authenticated using(bucket_id='media');
create policy media_add on storage.objects for insert to authenticated with check(bucket_id='media' and public.staff_role() is not null and (storage.foldername(name))[1]=auth.uid()::text);
create policy media_delete on storage.objects for delete to authenticated using(bucket_id='media' and (public.staff_role()='owner' or (public.staff_role()='editor' and owner_id=auth.uid()::text)));
commit;
