-- Migration 0005: Researcher Direct & Group Messaging System

-- 1. Conversations Table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'group')),
  name text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2. Conversation Members Table
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- 3. Messages Table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 4. Fast Lookup Indexes
create index if not exists conversation_members_user_id_idx 
  on public.conversation_members(user_id);

create index if not exists conversation_members_conv_user_idx 
  on public.conversation_members(conversation_id, user_id);

create index if not exists messages_conversation_id_created_at_idx 
  on public.messages(conversation_id, created_at asc);

create index if not exists messages_sender_id_idx 
  on public.messages(sender_id);

create index if not exists conversations_created_by_idx 
  on public.conversations(created_by);

-- 5. Enable Row Level Security
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- 6. RLS Policies for conversations
drop policy if exists "Members can view conversations" on public.conversations;
create policy "Members can view conversations" on public.conversations
  for select using (
    exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversations.id
      and cm.user_id = auth.uid()
    )
    or exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
  );

drop policy if exists "Authenticated users can create conversations" on public.conversations;
create policy "Authenticated users can create conversations" on public.conversations
  for insert with check (auth.uid() = created_by);

-- 7. RLS Policies for conversation_members
drop policy if exists "Members can view conversation members" on public.conversation_members;
create policy "Members can view conversation members" on public.conversation_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id
      and cm.user_id = auth.uid()
    )
    or exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
  );

drop policy if exists "Authenticated users can add conversation members" on public.conversation_members;
create policy "Authenticated users can add conversation members" on public.conversation_members
  for insert with check (auth.uid() is not null);

-- 8. RLS Policies for messages
drop policy if exists "Members can view conversation messages" on public.messages;
create policy "Members can view conversation messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
    )
    or exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
  );

drop policy if exists "Members can insert messages" on public.messages;
create policy "Members can insert messages" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
    )
  );

-- 9. Realtime Publication
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
