create function public.owner_sessions() returns table(id uuid,user_id uuid,created_at timestamptz,updated_at timestamptz) language sql security definer set search_path=public as $$
 select s.id,s.user_id,s.created_at,s.updated_at from auth.sessions s join public.members m on m.id=s.user_id
 where m.active and s.created_at>m.revoked_before and not exists(select 1 from public.blocked_sessions b where b.id=s.id)
 order by s.created_at desc limit 200
$$;
revoke all on function public.owner_sessions() from public,anon,authenticated;
grant execute on function public.owner_sessions() to service_role;
