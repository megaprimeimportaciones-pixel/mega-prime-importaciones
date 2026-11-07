-- Ejecutar en SQL Editor DESPUÉS de crear el usuario en Authentication > Users.
-- No crea contraseñas, no habilita un registro público y no contiene secretos.
do $$
declare target uuid;
begin
 select id into target from auth.users where lower(email)='megaprimeimportaciones@gmail.com';
 if target is null then raise exception 'Primero crea el usuario megaprimeimportaciones@gmail.com en Authentication > Users con la contraseña del Word'; end if;
 if exists(select 1 from public.members where role='owner' and id<>target) then raise exception 'Ya existe otro propietario; revisar identidad antes de cambiar accesos'; end if;
 insert into public.members(id,email,role,active) values(target,'megaprimeimportaciones@gmail.com','owner',true)
 on conflict(id) do update set role='owner',active=true;
end $$;
