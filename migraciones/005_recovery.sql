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
