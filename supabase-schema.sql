-- Stash: Supabase database schema
-- Run this in the Supabase SQL Editor to set up your database

-- Links table
create table public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null,
  description text,
  thumbnail_url text,
  type text not null default 'article' check (type in ('article', 'video', 'podcast')),
  domain text not null default '',
  platform text not null default '',
  created_at timestamptz default now() not null
);

-- Index for fast user queries
create index links_user_id_created_at_idx on public.links (user_id, created_at desc);

-- Row Level Security
alter table public.links enable row level security;

-- Users can only see their own links
create policy "Users can view own links"
  on public.links for select
  using (auth.uid() = user_id);

-- Users can insert their own links
create policy "Users can insert own links"
  on public.links for insert
  with check (auth.uid() = user_id);

-- Users can delete their own links
create policy "Users can delete own links"
  on public.links for delete
  using (auth.uid() = user_id);

-- API keys table (for iOS Shortcut / external clients)
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
