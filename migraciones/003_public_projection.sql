-- El JSON editable y el historial son privados; la web recibe una proyección publicada.
drop policy content_read on public.content;
revoke select on public.content from anon;
create policy content_staff on public.content for select to authenticated using(public.staff_role() is not null);
create function public.public_content() returns jsonb language plpgsql stable security definer set search_path=public as $$
declare c jsonb; r int;
begin
 select config,revision into c,r from content where id=1;
 if c is null then return null; end if;
 c=jsonb_set(c,'{categories}',coalesce((select jsonb_agg(x) from jsonb_array_elements(c->'categories') x where coalesce((x->>'visible')::boolean,true)),'[]'));
 c=jsonb_set(c,'{products}',coalesce((select jsonb_agg(x) from jsonb_array_elements(c->'products') x where coalesce((x->>'published')::boolean,true) and exists(select 1 from jsonb_array_elements(c->'categories') cat where cat->>'name'=x->>'category')),'[]'));
 if c ? 'reviews' then c=jsonb_set(c,'{reviews,items}',coalesce((select jsonb_agg(x) from jsonb_array_elements(c#>'{reviews,items}') x where x->>'approved'='true' and x->>'permissionConfirmed'='true'),'[]')); end if;
 if c ? 'customBlocks' then c=jsonb_set(c,'{customBlocks}',coalesce((select jsonb_agg(x) from jsonb_array_elements(c->'customBlocks') x where coalesce((x->>'visible')::boolean,true)),'[]')); end if;
 return jsonb_build_object('config',c,'revision',r);
end $$;
revoke all on function public.public_content() from public;
grant execute on function public.public_content() to anon,authenticated;
