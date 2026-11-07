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
