-- Run this in Supabase SQL Editor if you already have the links table set up
-- This adds the api_keys table for iOS Shortcut / external client auth

create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null unique,
  name text not null default 'Default',
  created_at timestamptz default now() not null
);

create index api_keys_key_idx on public.api_keys (key);

alter table public.api_keys enable row level security;

create policy "Users can view own api keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

create policy "Users can insert own api keys"
  on public.api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own api keys"
  on public.api_keys for delete
  using (auth.uid() = user_id);
