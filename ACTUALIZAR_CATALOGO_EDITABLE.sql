-- Habilita añadir categorías con permiso de contenido; mantiene visibilidad solo del administrador.
begin;
create or replace function public.enforce_content_permissions() returns trigger language plpgsql security definer set search_path=public as $$
declare previous jsonb;
begin
 if public.staff_role()='editor' then
  if TG_OP='INSERT' then select config into previous from content where id=NEW.id;previous:=coalesce(previous,'{}'::jsonb);else previous:=OLD.config;end if;
  if not public.can_manage('manage_visibility') then
   if (public.visibility_signature(NEW.config)-'categories') is distinct from (public.visibility_signature(previous)-'categories') then raise exception 'Solo el administrador puede cambiar la visibilidad'; end if;
   if exists(select 1 from jsonb_array_elements(coalesce(previous->'categories','[]'::jsonb)) old_cat where not exists(select 1 from jsonb_array_elements(coalesce(NEW.config->'categories','[]'::jsonb)) new_cat where new_cat->>'name'=old_cat->>'name' and coalesce((new_cat->>'visible')::boolean,true)=coalesce((old_cat->>'visible')::boolean,true))) then raise exception 'Solo el administrador puede retirar, renombrar u ocultar categorías existentes'; end if;
   if exists(select 1 from jsonb_array_elements(coalesce(NEW.config->'categories','[]'::jsonb)) new_cat where not exists(select 1 from jsonb_array_elements(coalesce(previous->'categories','[]'::jsonb)) old_cat where old_cat->>'name'=new_cat->>'name') and coalesce((new_cat->>'visible')::boolean,true)=false) then raise exception 'Las categorías nuevas del editor deben crearse activas'; end if;
  end if;
  if not public.can_manage('manage_chatbot') and NEW.config->'chatbot' is distinct from previous->'chatbot' then raise exception 'No tienes permiso para editar el chatbot'; end if;
  if not public.can_manage('edit_content') and public.without_visibility(NEW.config-'chatbot') is distinct from public.without_visibility(previous-'chatbot') then raise exception 'No tienes permiso para editar el contenido'; end if;
 end if;
 return NEW;
end $$;
commit;
notify pgrst, 'reload schema';
