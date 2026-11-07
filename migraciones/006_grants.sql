-- Permisos explícitos para el cliente de servidor. Las políticas siguen aplicando al navegador.
grant all on public.members,public.blocked_sessions,public.content,public.versions,public.posts,public.inquiries,public.contact_lists,public.campaigns,public.message_queue,public.recovery_contacts,public.recovery_challenges to service_role;
grant usage,select on all sequences in schema public to service_role;
