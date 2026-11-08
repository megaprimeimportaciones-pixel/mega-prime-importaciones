-- Visibilidad pública reservada al propietario. No borra contenido ni usuarios.
begin;
create or replace function public.can_manage(capability text) returns boolean
language sql stable security definer set search_path=public as $$
 select coalesce((select case
  when public.staff_role()='owner' then true
  when capability='manage_visibility' then false
  when public.staff_role()='editor' then coalesce((permissions->>capability)::boolean,capability in ('edit_content','upload_media','manage_posts','manage_videos','manage_chatbot','manage_inbox'))
  else false end from public.members where id=auth.uid()),false)
$$;
revoke all on function public.can_manage(text) from public;
grant execute on function public.can_manage(text) to authenticated;
commit;
notify pgrst, 'reload schema';
