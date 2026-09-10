create table if not exists profiles (
  id uuid primary key,
  email text unique not null,
  first_name text not null,
  password_hash text not null,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists spaces (
  id uuid primary key,
  code text unique not null,
  user1_id uuid references profiles(id) on delete cascade not null,
  user2_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references spaces(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('word', 'photo', 'video', 'audio', 'mood')),
  content text,
  media_url text,
  mood text,
  created_at timestamptz default now()
);

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references memories(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  kind text not null,
  message text not null,
  reference_id text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists secret_messages (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references spaces(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  media_url text,
  opens_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists streaks (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references spaces(id) on delete cascade not null unique,
  current_streak int default 0,
  max_streak int default 0,
  last_memory_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists streaks_space_idx on streaks(space_id);
alter table streaks enable row level security;

drop policy if exists "streaks_member" on streaks;
create policy "streaks_member"
  on streaks for select
  to authenticated
  using (
    exists (
      select 1 from spaces
      where spaces.id = streaks.space_id
        and (spaces.user1_id = auth.uid() or spaces.user2_id = auth.uid())
    )
  );

insert into storage.buckets (id, name, public)
values ('memories', 'memories', false)
on conflict (id) do nothing;

drop policy if exists "Members can upload memory media" on storage.objects;
create policy "Members can upload memory media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'memories'
  and exists (
    select 1 from public.spaces s
    where s.id::text = split_part(name, '/', 1)
      and (s.user1_id = auth.uid() or s.user2_id = auth.uid())
  )
);

drop policy if exists "Members can view memory media" on storage.objects;
create policy "Members can view memory media"
on storage.objects for select
to authenticated
using (
  bucket_id = 'memories'
  and exists (
    select 1 from public.spaces s
    where s.id::text = split_part(name, '/', 1)
      and (s.user1_id = auth.uid() or s.user2_id = auth.uid())
  )
);

create index if not exists profiles_email_idx on profiles(email);
create index if not exists spaces_code_idx on spaces(code);
create index if not exists spaces_members_idx on spaces(user1_id, user2_id);
create index if not exists memories_space_idx on memories(space_id, created_at desc);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);
create unique index if not exists reactions_memory_user_emoji_idx
  on reactions(memory_id, user_id, emoji);

alter table profiles enable row level security;
alter table spaces enable row level security;
alter table memories enable row level security;
alter table reactions enable row level security;
alter table notifications enable row level security;
alter table secret_messages enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "spaces_select_member" on spaces;
create policy "spaces_select_member"
  on spaces for select
  to authenticated
  using (auth.uid() = user1_id or auth.uid() = user2_id);

drop policy if exists "spaces_insert_owner" on spaces;
create policy "spaces_insert_owner"
  on spaces for insert
  to authenticated
  with check (auth.uid() = user1_id and user2_id is null);

drop policy if exists "spaces_join_open" on spaces;
create policy "spaces_join_open"
  on spaces for update
  to authenticated
  using (user2_id is null and auth.uid() <> user1_id)
  with check (auth.uid() = user2_id);

drop policy if exists "memories_select_member" on memories;
create policy "memories_select_member"
  on memories for select
  to authenticated
  using (
    exists (
      select 1 from spaces
      where spaces.id = memories.space_id
        and (spaces.user1_id = auth.uid() or spaces.user2_id = auth.uid())
    )
  );

drop policy if exists "memories_insert_member" on memories;
create policy "memories_insert_member"
  on memories for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from spaces
      where spaces.id = memories.space_id
        and (spaces.user1_id = auth.uid() or spaces.user2_id = auth.uid())
    )
  );

drop policy if exists "reactions_member" on reactions;
create policy "reactions_member"
  on reactions for all
  to authenticated
  using (
    exists (
      select 1
      from memories
      join spaces on spaces.id = memories.space_id
      where memories.id = reactions.memory_id
        and (spaces.user1_id = auth.uid() or spaces.user2_id = auth.uid())
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from memories
      join spaces on spaces.id = memories.space_id
      where memories.id = reactions.memory_id
        and (spaces.user1_id = auth.uid() or spaces.user2_id = auth.uid())
    )
  );

drop policy if exists "notifications_own" on notifications;
create policy "notifications_own"
  on notifications for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "secrets_member" on secret_messages;
create policy "secrets_member"
  on secret_messages for all
  to authenticated
  using (
    exists (
      select 1 from spaces
      where spaces.id = secret_messages.space_id
        and (spaces.user1_id = auth.uid() or spaces.user2_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from spaces
      where spaces.id = secret_messages.space_id
        and (spaces.user1_id = auth.uid() or spaces.user2_id = auth.uid())
    )
  );

-- Enable memories, reactions and notifications in Supabase Dashboard:
-- Database > Publications > supabase_realtime.
