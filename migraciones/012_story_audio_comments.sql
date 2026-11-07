begin;
alter table public.posts add column if not exists audio_url text check(audio_url is null or audio_url ~ '^https://[^[:space:]]+$');
update storage.buckets set allowed_mime_types=array['image/jpeg','image/png','image/webp','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/ogg','audio/wav'] where id='media';
create table public.story_comments(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts(id) on delete cascade,visitor uuid not null,author text not null check(length(author) between 1 and 80),body text not null check(length(body) between 1 and 1000),approved boolean not null default false,created_at timestamptz not null default now());
create index story_comments_visitor_date on public.story_comments(visitor,created_at);
create index story_comments_post_approved on public.story_comments(post_id,approved);
alter table public.story_comments enable row level security;
create policy comments_public on public.story_comments for select to anon,authenticated using((approved and exists(select 1 from public.posts p where p.id=post_id and p.published and (p.expires_at is null or p.expires_at>now()))) or public.staff_role() is not null);
create policy comments_staff on public.story_comments for all to authenticated using(public.staff_role() is not null) with check(public.staff_role() is not null);
grant select(id,post_id,author,body,created_at) on public.story_comments to anon;
grant select,insert,update,delete on public.story_comments to authenticated;
grant all on public.story_comments to service_role;
create function public.comment_on_story(story uuid,visitor_key uuid,author_name text,comment_text text) returns void language plpgsql security definer set search_path=public as $$
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
