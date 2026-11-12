-- LifeOS user data: one private JSON document per authenticated user.
-- Run this in Supabase SQL Editor after the project has been restored.
-- The policies restrict every row to its owner. Never use a service_role/secret
-- key in the Expo client.

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

drop policy if exists "LifeOS users can read their own data"
  on public.lifeos_data;
create policy "LifeOS users can read their own data"
  on public.lifeos_data
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "LifeOS users can insert their own data"
  on public.lifeos_data;
create policy "LifeOS users can insert their own data"
  on public.lifeos_data
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "LifeOS users can update their own data"
  on public.lifeos_data;
create policy "LifeOS users can update their own data"
  on public.lifeos_data
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
