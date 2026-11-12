-- LifeOS user data: one private JSON document per authenticated user.
-- Safe to re-run. Existing user data is preserved.
-- Never use a service_role/secret key in the Expo client.

create table if not exists public.lifeos_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.lifeos_data
  add column if not exists data jsonb not null default '{}'::jsonb;

alter table public.lifeos_data
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists lifeos_data_user_id_uidx
  on public.lifeos_data (user_id);

alter table public.lifeos_data enable row level security;

grant select, insert, update on public.lifeos_data to authenticated;

-- Remove both policy names used by earlier LifeOS iterations so duplicate
-- permissive policies cannot accumulate or bypass later policy changes.
drop policy if exists "Users can read their own LifeOS data"
  on public.lifeos_data;
drop policy if exists "Users can create their own LifeOS data"
  on public.lifeos_data;
drop policy if exists "Users can update their own LifeOS data"
  on public.lifeos_data;
drop policy if exists "LifeOS users can read their own data"
  on public.lifeos_data;
drop policy if exists "LifeOS users can insert their own data"
  on public.lifeos_data;
drop policy if exists "LifeOS users can update their own data"
  on public.lifeos_data;

create policy "LifeOS users can read their own data"
  on public.lifeos_data
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "LifeOS users can insert their own data"
  on public.lifeos_data
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "LifeOS users can update their own data"
  on public.lifeos_data
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- This optional event-trigger function only enables RLS on newly created
-- public tables. It is not an RPC endpoint; remove client EXECUTE privileges
-- while leaving the database event trigger itself enabled.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;
