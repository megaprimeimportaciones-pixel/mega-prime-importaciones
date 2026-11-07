create function public.validate_contact_numbers() returns trigger language plpgsql set search_path=public as $$
declare rows jsonb; item jsonb; seen text[]='{}'; ids text[]='{}'; selected text; active_count int=0;
begin
 rows=NEW.config#>'{whatsapp,numbers}';
 if rows is null then return NEW; end if;
 if jsonb_typeof(rows)<>'array' or jsonb_array_length(rows)>50 then raise exception 'Lista de contactos inválida'; end if;
 for item in select * from jsonb_array_elements(rows) loop
  if coalesce(item->>'number','') !~ '^\+[1-9][0-9]{7,14}$' or coalesce(item->>'id','')='' then raise exception 'Número o identificador inválido'; end if;
  if item->>'number'=any(seen) or item->>'id'=any(ids) then raise exception 'Número o identificador duplicado'; end if;
  seen=array_append(seen,item->>'number');ids=array_append(ids,item->>'id');
  if coalesce((item->>'enabled')::boolean,false) then
   active_count=active_count+1;
   if item->>'id'=NEW.config#>>'{whatsapp,primaryId}' then selected=replace(item->>'number','+',''); end if;
  end if;
 end loop;
 if active_count>0 and selected is null then raise exception 'Selecciona un contacto principal activo'; end if;
 if coalesce(NEW.config#>>'{whatsapp,number}','')<>coalesce(selected,'') then raise exception 'El número principal no coincide con la lista'; end if;
 return NEW;
end $$;
create trigger contact_numbers before insert or update on public.content for each row execute function public.validate_contact_numbers();
