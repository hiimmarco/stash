-- Run this in Supabase SQL Editor to add archive support
alter table public.links add column if not exists is_archived boolean not null default false;
create index if not exists links_user_archived_idx on public.links (user_id, is_archived, created_at desc);

-- Allow users to update (archive/unarchive) their own links
create policy "Users can update own links"
  on public.links for update
  using (auth.uid() = user_id);
