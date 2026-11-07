-- Mega Prime Importaciones: ejecutar SOLO en un proyecto nuevo y exclusivo.
-- No contiene contraseñas ni claves. No repetir en un proyecto ya migrado.

-- 001_supabase.sql
begin;
create table public.members (
 id uuid primary key references auth.users on delete cascade,
 email text not null, role text not null default 'editor' check(role in ('owner','editor')),
 active boolean not null default true, revoked_before timestamptz not null default 'epoch',
 created_at timestamptz not null default now()
);
create table public.blocked_sessions (id uuid primary key, user_id uuid not null references auth.users on delete cascade);
create function public.staff_role() returns text language sql stable security definer set search_path=public as $$
 select role from members where id=auth.uid() and active
 and exists(select 1 from auth.sessions s where s.id=(auth.jwt()->>'session_id')::uuid and s.user_id=auth.uid() and s.created_at>revoked_before)
 and not exists(select 1 from blocked_sessions where id=(auth.jwt()->>'session_id')::uuid)
$$;
create table public.content (id int primary key check(id=1), config jsonb not null, revision int not null default 0, updated_at timestamptz not null default now());
create table public.versions (id bigint generated always as identity primary key, config jsonb not null, revision int not null, description text not null, created_at timestamptz not null default now(), actor uuid references auth.users);
create table public.posts (id uuid primary key default gen_random_uuid(), title text not null check(length(title)<200), body text not null default '', media text, kind text check(kind in ('image','video')), published boolean not null default false, expires_at timestamptz, created_at timestamptz not null default now());
create table public.inquiries (id uuid primary key default gen_random_uuid(), name text not null, contact text not null, question text not null, consent boolean not null check(consent), status text not null default 'pendiente' check(status in ('pendiente','en proceso','resuelta')), created_at timestamptz not null default now());
create table public.contact_lists (id uuid primary key default gen_random_uuid(), name text not null, contacts jsonb not null, consent_at timestamptz not null, created_at timestamptz not null default now());
alter table public.members enable row level security;
alter table public.blocked_sessions enable row level security;
alter table public.content enable row level security;
alter table public.versions enable row level security;
alter table public.posts enable row level security;
alter table public.inquiries enable row level security;
alter table public.contact_lists enable row level security;
create policy member_read on public.members for select to authenticated using(id=auth.uid() or public.staff_role()='owner');
create policy content_read on public.content for select to anon,authenticated using(true);
create policy versions_read on public.versions for select to authenticated using(public.staff_role()='owner');
create policy posts_read on public.posts for select to anon,authenticated using((published and (expires_at is null or expires_at>now())) or public.staff_role() is not null);
create policy posts_write on public.posts for all to authenticated using(public.staff_role() is not null) with check(public.staff_role() is not null);
create policy inquiries_staff on public.inquiries for all to authenticated using(public.staff_role() is not null) with check(public.staff_role() is not null);
create policy lists_owner on public.contact_lists for all to authenticated using(public.staff_role()='owner') with check(public.staff_role()='owner');
grant select on public.content,public.posts to anon;
grant select on public.members,public.content,public.versions to authenticated;
grant select,insert,update,delete on public.posts,public.inquiries,public.contact_lists to authenticated;
revoke all on public.blocked_sessions from anon,authenticated;
revoke insert,update,delete on public.members,public.content,public.versions from anon,authenticated;
create function public.publish_content(payload jsonb, expected_revision int, description text default 'Publicación', restore_id bigint default null) returns int
language plpgsql security definer set search_path=public as $$
declare r int; old jsonb;
begin
 if public.staff_role() is null then raise exception 'Acceso denegado'; end if;
 if restore_id is not null then
  if public.staff_role()<>'owner' then raise exception 'Solo propietario'; end if;
  select config into payload from versions where id=restore_id;
 end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>2000000 then raise exception 'Contenido inválido'; end if;
 perform pg_advisory_xact_lock(942001);
 select revision,config into r,old from content where id=1 for update;
 r:=coalesce(r,0);
 if r<>expected_revision then raise exception 'CONFLICT: otro integrante publicó. Conserva tu borrador y carga la nueva versión.'; end if;
 if old is not null then insert into versions(config,revision,description,actor) values(old,r,left(description,200),auth.uid()); end if;
 insert into content(id,config,revision) values(1,payload,r+1) on conflict(id) do update set config=excluded.config,revision=excluded.revision,updated_at=now();
 return r+1;
end $$;
revoke all on function public.publish_content(jsonb,int,text,bigint) from public;
grant execute on function public.publish_content(jsonb,int,text,bigint) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',true,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']);
create policy media_read on storage.objects for select to anon,authenticated using(bucket_id='media');
create policy media_add on storage.objects for insert to authenticated with check(bucket_id='media' and public.staff_role() is not null and (storage.foldername(name))[1]=auth.uid()::text);
create policy media_delete on storage.objects for delete to authenticated using(bucket_id='media' and (public.staff_role()='owner' or (public.staff_role()='editor' and owner_id=auth.uid()::text)));
commit;


-- 002_sessions.sql
create function public.owner_sessions() returns table(id uuid,user_id uuid,created_at timestamptz,updated_at timestamptz) language sql security definer set search_path=public as $$
 select s.id,s.user_id,s.created_at,s.updated_at from auth.sessions s join public.members m on m.id=s.user_id
 where m.active and s.created_at>m.revoked_before and not exists(select 1 from public.blocked_sessions b where b.id=s.id)
 order by s.created_at desc limit 200
$$;
revoke all on function public.owner_sessions() from public,anon,authenticated;
grant execute on function public.owner_sessions() to service_role;


-- 003_public_projection.sql
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


-- 004_messaging.sql
begin;
create table public.campaigns(id uuid primary key default gen_random_uuid(), name text not null, template text not null, language text not null default 'es', message text not null, image text, consent_at timestamptz not null, cancelled boolean not null default false, created_at timestamptz not null default now());
create table public.message_queue(id uuid primary key default gen_random_uuid(),campaign_id uuid not null references campaigns on delete cascade, phone text not null check(phone ~ '^\+[1-9][0-9]{7,14}$'),status text not null default 'pendiente' check(status in ('pendiente','procesando','enviado','fallido','incierto','cancelado')),provider_id text,error text,claimed_at timestamptz,unique(campaign_id,phone));
alter table public.campaigns enable row level security;
alter table public.message_queue enable row level security;
create policy campaigns_owner on public.campaigns for all to authenticated using(public.staff_role()='owner') with check(public.staff_role()='owner');
create policy queue_owner on public.message_queue for select to authenticated using(public.staff_role()='owner');
grant select,insert,update on public.campaigns to authenticated;
grant select on public.message_queue to authenticated;
create function public.enqueue_campaign(campaign uuid,phones jsonb) returns int language plpgsql security definer set search_path=public as $$
declare n int;
begin
 if public.staff_role()<>'owner' or public.staff_role() is null then raise exception 'Solo propietario'; end if;
 if not exists(select 1 from campaigns where id=campaign and not cancelled and consent_at is not null) then raise exception 'Campaña inválida'; end if;
 if jsonb_array_length(phones)>1000 then raise exception 'Máximo 1000 contactos'; end if;
 insert into message_queue(campaign_id,phone) select campaign,x from jsonb_array_elements_text(phones) x on conflict(campaign_id,phone) do nothing;
 get diagnostics n=row_count;return n;
end $$;
revoke all on function public.enqueue_campaign(uuid,jsonb) from public;
grant execute on function public.enqueue_campaign(uuid,jsonb) to authenticated;
create function public.claim_message() returns jsonb language plpgsql security definer set search_path=public as $$
declare item message_queue;
begin
 -- Una respuesta perdida no se reenvía automáticamente: evita duplicados tras reinicio.
 update message_queue set status='incierto',error='Worker interrumpido; comprobar en Meta antes de decidir.' where status='procesando' and claimed_at<now()-interval '5 minutes';
 update message_queue q set status='cancelado' from campaigns c where q.campaign_id=c.id and c.cancelled and q.status='pendiente';
 select q.* into item from message_queue q join campaigns c on c.id=q.campaign_id where q.status='pendiente' and not c.cancelled order by c.created_at,q.id for update of q skip locked limit 1;
 if item.id is null then return null; end if;
 update message_queue set status='procesando',claimed_at=now() where id=item.id;
 return jsonb_build_object('job',to_jsonb(item),'campaign',(select to_jsonb(c) from campaigns c where c.id=item.campaign_id));
end $$;
revoke all on function public.claim_message() from public,anon,authenticated;
grant execute on function public.claim_message() to service_role;
commit;


-- 005_recovery.sql
begin;
create table public.recovery_contacts(user_id uuid primary key references auth.users on delete cascade,email text not null,verified boolean not null default false);
create table public.recovery_challenges(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,token_hash text not null unique,purpose text not null check(purpose in ('verify','reset')),email text not null,expires_at timestamptz not null,used_at timestamptz,created_at timestamptz not null default now());
alter table public.recovery_contacts enable row level security;
alter table public.recovery_challenges enable row level security;
revoke all on public.recovery_contacts,public.recovery_challenges from anon,authenticated;
grant all on public.recovery_contacts,public.recovery_challenges to service_role;
create function public.consume_recovery(hash text) returns jsonb language plpgsql security definer set search_path=public as $$
declare item recovery_challenges;
begin
 update recovery_challenges set used_at=now() where token_hash=hash and used_at is null and expires_at>now() returning * into item;
 if item.id is null then raise exception 'Enlace inválido, usado o vencido'; end if;
 return to_jsonb(item);
end $$;
revoke all on function public.consume_recovery(text) from public,anon,authenticated;
grant execute on function public.consume_recovery(text) to service_role;
commit;


-- 006_grants.sql
-- Permisos explícitos para el cliente de servidor. Las políticas siguen aplicando al navegador.
grant all on public.members,public.blocked_sessions,public.content,public.versions,public.posts,public.inquiries,public.contact_lists,public.campaigns,public.message_queue,public.recovery_contacts,public.recovery_challenges to service_role;
grant usage,select on all sequences in schema public to service_role;


-- 007_contact_validation.sql
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


-- 008_social_posts.sql
alter table public.posts add column external_url text, add column platform text not null default 'web' check(platform in ('web','whatsapp','tiktok','facebook','youtube','instagram','x','other')), add column pinned boolean not null default false, add column external_id text unique;
alter table public.posts add constraint external_url_https check(external_url is null or external_url ~ '^https://[^[:space:]]+$');
create index posts_pinned_recent on public.posts(pinned desc,created_at desc);


-- 009_videos_and_chat.sql
begin;
create table public.videos(id uuid primary key default gen_random_uuid(),title text not null check(length(title) between 1 and 199),description text not null default '',url text not null check(url ~ '^https://[^[:space:]]+$'),poster text,source text not null default 'upload' check(source in ('upload','external')),published boolean not null default false,sort_order int not null default 0,created_at timestamptz not null default now());
alter table public.videos enable row level security;
create policy videos_read on public.videos for select to anon,authenticated using(published or public.staff_role() is not null);
create policy videos_manage on public.videos for all to authenticated using(public.staff_role() is not null) with check(public.staff_role() is not null);
grant select on public.videos to anon;grant select,insert,update,delete on public.videos to authenticated;
alter table public.inquiries add column transcript jsonb not null default '[]' check(jsonb_typeof(transcript)='array' and octet_length(transcript::text)<40000);
create table public.inquiry_messages(id uuid primary key default gen_random_uuid(),inquiry_id uuid not null references public.inquiries on delete cascade,actor uuid not null references auth.users,body text not null check(length(body) between 1 and 4000),created_at timestamptz not null default now());
alter table public.inquiry_messages enable row level security;
create policy thread_read on public.inquiry_messages for select to authenticated using(public.staff_role() is not null);
create policy thread_reply on public.inquiry_messages for insert to authenticated with check(public.staff_role() is not null and actor=auth.uid());
grant select,insert on public.inquiry_messages to authenticated;
create table public.notification_targets(user_id uuid primary key references public.members on delete cascade,phone text not null check(phone ~ '^\+[1-9][0-9]{7,14}$'),enabled boolean not null default false,consent_at timestamptz not null);
alter table public.notification_targets enable row level security;
create policy targets_staff on public.notification_targets for all to authenticated using(public.staff_role() is not null and (user_id=auth.uid() or public.staff_role()='owner')) with check(public.staff_role() is not null and (user_id=auth.uid() or public.staff_role()='owner'));
grant select,insert,update,delete on public.notification_targets to authenticated;
create table public.chat_notifications(id uuid primary key default gen_random_uuid(),inquiry_id uuid not null references public.inquiries on delete cascade,user_id uuid not null references public.members on delete cascade,phone text not null,status text not null default 'pendiente' check(status in ('pendiente','procesando','enviado','fallido','incierto','cancelado')),provider_id text,error text,claimed_at timestamptz,created_at timestamptz not null default now(),unique(inquiry_id,user_id));
alter table public.chat_notifications enable row level security;
create policy notifications_read on public.chat_notifications for select to authenticated using(public.staff_role() is not null and (user_id=auth.uid() or public.staff_role()='owner'));
grant select on public.chat_notifications to authenticated;
create function public.queue_chat_notifications() returns trigger language plpgsql security definer set search_path=public as $$begin
 insert into chat_notifications(inquiry_id,user_id,phone) select NEW.id,t.user_id,t.phone from notification_targets t join members m on m.id=t.user_id where t.enabled and m.active on conflict do nothing;
 return NEW;
end $$;
create trigger new_chat_inquiry after insert on public.inquiries for each row execute function public.queue_chat_notifications();
create function public.claim_chat_notification() returns jsonb language plpgsql security definer set search_path=public as $$
declare item chat_notifications; inquiry inquiries;
begin
 update chat_notifications set status='incierto',error='Respuesta no confirmada; comprobar antes de reenviar' where status='procesando' and claimed_at<now()-interval '5 minutes';
 update chat_notifications n set status='cancelado' where n.status='pendiente' and not exists(select 1 from members m join notification_targets t on t.user_id=m.id where m.id=n.user_id and m.active and t.enabled and t.phone=n.phone);
 select * into item from chat_notifications where status='pendiente' order by created_at for update skip locked limit 1;
 if item.id is null then return null; end if;
 update chat_notifications set status='procesando',claimed_at=now() where id=item.id;
 select * into inquiry from inquiries where id=item.inquiry_id;
 return jsonb_build_object('job',to_jsonb(item),'inquiry',to_jsonb(inquiry));
end $$;
revoke all on function public.claim_chat_notification() from public,anon,authenticated;
grant execute on function public.claim_chat_notification() to service_role;
grant all on public.videos,public.inquiry_messages,public.notification_targets,public.chat_notifications to service_role;
commit;


