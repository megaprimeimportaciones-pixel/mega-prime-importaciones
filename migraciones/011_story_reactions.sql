begin;
create table public.post_reactions(post_id uuid not null references public.posts(id) on delete cascade, visitor uuid not null, reaction text not null check(reaction in ('heart','like','clap')), updated_at timestamptz not null default now(), primary key(post_id,visitor));
alter table public.post_reactions enable row level security;
revoke all on public.post_reactions from anon,authenticated;
grant all on public.post_reactions to service_role;
create function public.story_reaction_counts(story uuid) returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_object_agg(reaction,n),'{}'::jsonb) from (select r.reaction,count(*) n from post_reactions r join posts p on p.id=r.post_id where p.id=story and p.published and (p.expires_at is null or p.expires_at>now()) group by r.reaction) s
$$;
create function public.react_to_story(story uuid, visitor_key uuid, choice text) returns jsonb language plpgsql security definer set search_path=public as $$
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
