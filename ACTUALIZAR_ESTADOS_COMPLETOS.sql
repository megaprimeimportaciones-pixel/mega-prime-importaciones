-- Incluye el campo de nombres del editor anterior.
begin;
alter table public.members add column if not exists display_name text not null default '' check(length(display_name)<=120);
commit;

-- Actualización incremental de estados existentes. No borra publicaciones ni credenciales.
begin;
create table if not exists public.post_reactions(post_id uuid not null references public.posts(id) on delete cascade, visitor uuid not null, reaction text not null check(reaction in ('heart','like','clap')), updated_at timestamptz not null default now(), primary key(post_id,visitor));
alter table public.post_reactions enable row level security;
revoke all on public.post_reactions from anon,authenticated;
grant all on public.post_reactions to service_role;
create or replace function public.story_reaction_counts(story uuid) returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_object_agg(reaction,n),'{}'::jsonb) from (select r.reaction,count(*) n from post_reactions r join posts p on p.id=r.post_id where p.id=story and p.published and (p.expires_at is null or p.expires_at>now()) group by r.reaction) s
$$;
create or replace function public.react_to_story(story uuid, visitor_key uuid, choice text) returns jsonb language plpgsql security definer set search_path=public as $$
begin
 if visitor_key is null or not exists(select 1 from posts where id=story and published and (expires_at is null or expires_at>now())) then raise exception 'Estado no disponible'; end if;
 if choice is null then delete from post_reactions where post_id=story and visitor=visitor_key;
 elsif choice in ('heart','like','clap') then
 insert into post_reactions(post_id,visitor,reaction) values(story,visitor_key,choice) on conflict(post_id,visitor) do update set reaction=excluded.reaction,updated_at=now();
 else raise exception 'Reacción inválida'; end if;
 return public.story_reaction_counts(story);
end $$;
revoke all on function public.story_reaction_counts(uuid), public.react_to_story(uuid,uuid,text) from public;
grant execute on function public.story_reaction_counts(uuid), public.react_to_story(uuid,uuid,text) to anon,authenticated;
commit;

begin;
alter table public.posts add column if not exists audio_url text check(audio_url is null or audio_url ~ '^https://[^[:space:]]+$');
update storage.buckets set allowed_mime_types=array['image/jpeg','image/png','image/webp','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/ogg','audio/wav'] where id='media';
create table if not exists public.story_comments(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts(id) on delete cascade,visitor uuid not null,author text not null check(length(author) between 1 and 80),body text not null check(length(body) between 1 and 1000),approved boolean not null default false,created_at timestamptz not null default now());
create index if not exists story_comments_visitor_date on public.story_comments(visitor,created_at);
create index if not exists story_comments_post_approved on public.story_comments(post_id,approved);
alter table public.story_comments enable row level security;
drop policy if exists comments_public on public.story_comments;
create policy comments_public on public.story_comments for select to anon,authenticated using((approved and exists(select 1 from public.posts p where p.id=post_id and p.published and (p.expires_at is null or p.expires_at>now()))) or public.staff_role() is not null);
drop policy if exists comments_staff on public.story_comments;
create policy comments_staff on public.story_comments for all to authenticated using(public.staff_role() is not null) with check(public.staff_role() is not null);
grant select(id,post_id,author,body,created_at) on public.story_comments to anon;
grant select,insert,update,delete on public.story_comments to authenticated;
grant all on public.story_comments to service_role;
create or replace function public.comment_on_story(story uuid,visitor_key uuid,author_name text,comment_text text) returns void language plpgsql security definer set search_path=public as $$
begin
 if visitor_key is null or not exists(select 1 from posts where id=story and published and (expires_at is null or expires_at>now())) then raise exception 'Estado no disponible'; end if;
 if author_name is null or length(trim(author_name)) not between 1 and 80 or comment_text is null or length(trim(comment_text)) not between 1 and 1000 then raise exception 'Revisa el nombre y el comentario'; end if;
 perform pg_advisory_xact_lock(hashtext(visitor_key::text));
 if (select count(*) from story_comments where visitor=visitor_key and created_at>now()-interval '1 day')>=10 then raise exception 'Has alcanzado el límite de comentarios de hoy'; end if;
 perform 1 from posts where id=story for update;
 if (select count(*) from story_comments where post_id=story and not approved)>=100 then raise exception 'Este estado tiene comentarios pendientes de revisión'; end if;
 insert into story_comments(post_id,visitor,author,body) values(story,visitor_key,trim(author_name),trim(comment_text));
end $$;
revoke all on function public.comment_on_story(uuid,uuid,text,text) from public;
grant execute on function public.comment_on_story(uuid,uuid,text,text) to anon,authenticated;
commit;

notify pgrst, 'reload schema';
