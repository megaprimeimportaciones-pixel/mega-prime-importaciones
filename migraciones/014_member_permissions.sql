begin;
alter table public.members add column if not exists permissions jsonb not null default '{}'::jsonb check(jsonb_typeof(permissions)='object');
create or replace function public.can_manage(capability text) returns boolean language sql stable security definer set search_path=public as $$
 select coalesce((select case when public.staff_role()='owner' then true when public.staff_role()='editor' then coalesce((permissions->>capability)::boolean,capability in ('edit_content','upload_media','manage_posts','manage_videos','manage_chatbot','manage_inbox')) else false end from members where id=auth.uid()),false)
$$;
revoke all on function public.can_manage(text) from public;grant execute on function public.can_manage(text) to authenticated;
create or replace function public.visibility_signature(c jsonb) returns jsonb language sql immutable set search_path=public as $$
 select jsonb_build_object(
 'general',jsonb_build_array(coalesce(c#>'{visibility,cart}','true'),coalesce(c#>'{visibility,search}','true'),coalesce(c#>'{visibility,digitalCatalog}','true'),coalesce(c#>'{visibility,chatbot}','true')),
 'sections',coalesce(c#>'{visibility,sections}','{}'),
 'categories',coalesce((select jsonb_agg(jsonb_build_array(v->'name',coalesce(v->'visible','true'))) from jsonb_array_elements(coalesce(c->'categories','[]')) v),'[]'),
 'customBlocks',coalesce((select jsonb_agg(coalesce(v->'visible','true')) from jsonb_array_elements(coalesce(c->'customBlocks','[]')) v),'[]'),
 'menu',coalesce((select jsonb_agg(jsonb_build_array(v->'action',v->'target',coalesce(v->'visible','true'))) from jsonb_array_elements(coalesce(c#>'{header,nav}','[]')) v),'[]'),
 'legacySections',coalesce((select jsonb_agg(jsonb_build_array(v->'key',coalesce(v->'visible','true'))) from jsonb_array_elements(coalesce(c->'sections','[]')) v),'[]'),
 'otherBlocks',jsonb_build_array(coalesce(c#>'{indicators,visible}','true'),coalesce(c#>'{supplier,visible}','true'),coalesce(c#>'{technicalBenefits,visible}','true'),coalesce(c#>'{location,visible}','true'),coalesce(c#>'{contactSection,visible}','true'),coalesce(c#>'{social,visible}','true'),coalesce(c#>'{header,topVisible}','false')),
 'blocks',jsonb_build_array(coalesce(c#>'{chatbot,visible}','true'),coalesce(c#>'{company,visible}','true'),coalesce(c#>'{footer,visible}','true'),coalesce(c#>'{company,showPurposeNav}','true'),coalesce(c#>'{videoLibrary,visible}','true'),coalesce(c#>'{updates,visible}','true'),coalesce(c#>'{updates,showStories}','true')))
$$;
create or replace function public.without_visibility(c jsonb) returns jsonb language sql immutable set search_path=public as $$
 select case jsonb_typeof(c)
 when 'object' then coalesce((select jsonb_object_agg(k,public.without_visibility(v)) from jsonb_each(c) t(k,v) where k not in ('visibility','visible','topVisible','showPurposeNav','showStories')),'{}'::jsonb)
 when 'array' then coalesce((select jsonb_agg(public.without_visibility(v)) from jsonb_array_elements(c) v),'[]'::jsonb)
 else c end
$$;
revoke all on function public.without_visibility(jsonb) from public,anon,authenticated;
create or replace function public.enforce_content_permissions() returns trigger language plpgsql security definer set search_path=public as $$
declare previous jsonb;
begin
 if public.staff_role()='editor' then
  if TG_OP='INSERT' then select config into previous from content where id=NEW.id;previous:=coalesce(previous,'{}'::jsonb);else previous:=OLD.config;end if;
  if not public.can_manage('manage_visibility') and public.visibility_signature(NEW.config) is distinct from public.visibility_signature(previous) then raise exception 'Solo el administrador o un integrante con permiso especial puede cambiar la visibilidad'; end if;
  if not public.can_manage('manage_chatbot') and NEW.config->'chatbot' is distinct from previous->'chatbot' then raise exception 'No tienes permiso para editar el chatbot'; end if;
  if not public.can_manage('edit_content') and public.without_visibility(NEW.config-'chatbot') is distinct from public.without_visibility(previous-'chatbot') then raise exception 'No tienes permiso para editar el contenido'; end if;
 end if;
 return NEW;
end $$;
drop trigger if exists guard_content_permissions on public.content;
create trigger guard_content_permissions before insert or update on public.content for each row execute function public.enforce_content_permissions();
drop policy if exists posts_write on public.posts;create policy posts_write on public.posts for all to authenticated using(public.can_manage('manage_posts')) with check(public.can_manage('manage_posts'));
drop policy if exists videos_manage on public.videos;create policy videos_manage on public.videos for all to authenticated using(public.can_manage('manage_videos')) with check(public.can_manage('manage_videos'));
drop policy if exists inquiries_staff on public.inquiries;create policy inquiries_staff on public.inquiries for all to authenticated using(public.can_manage('manage_inbox')) with check(public.can_manage('manage_inbox'));
drop policy if exists thread_read on public.inquiry_messages;create policy thread_read on public.inquiry_messages for select to authenticated using(public.can_manage('manage_inbox'));
drop policy if exists thread_reply on public.inquiry_messages;create policy thread_reply on public.inquiry_messages for insert to authenticated with check(public.can_manage('manage_inbox') and actor=auth.uid());
drop policy if exists media_add on storage.objects;create policy media_add on storage.objects for insert to authenticated with check(bucket_id='media' and public.can_manage('upload_media') and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists media_delete on storage.objects;create policy media_delete on storage.objects for delete to authenticated using(bucket_id='media' and public.can_manage('upload_media') and (public.staff_role()='owner' or owner_id=auth.uid()::text));
drop policy if exists comments_staff on public.story_comments;
create policy comments_staff on public.story_comments for all to authenticated using(public.can_manage('manage_posts')) with check(public.can_manage('manage_posts'));
revoke all on function public.visibility_signature(jsonb) from public,anon,authenticated;
drop policy if exists targets_staff on public.notification_targets;
create policy targets_staff on public.notification_targets for all to authenticated using(public.can_manage('manage_inbox') and (user_id=auth.uid() or public.staff_role()='owner')) with check(public.can_manage('manage_inbox') and (user_id=auth.uid() or public.staff_role()='owner'));
create or replace function public.queue_chat_notifications() returns trigger language plpgsql security definer set search_path=public as $$begin
 insert into chat_notifications(inquiry_id,user_id,phone) select NEW.id,t.user_id,t.phone from notification_targets t join members m on m.id=t.user_id where t.enabled and m.active and (m.role='owner' or coalesce((m.permissions->>'manage_inbox')::boolean,true)) on conflict do nothing;
 return NEW;
end $$;
commit;
