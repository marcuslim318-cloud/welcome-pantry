-- Run this once in the Supabase SQL Editor.
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  state jsonb not null,
  owner_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.activities enable row level security;
create policy "Anyone can view activities by share link" on public.activities for select using (true);
create policy "Admins create their own activities" on public.activities for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owners update their activities" on public.activities for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

alter publication supabase_realtime add table public.activities;
