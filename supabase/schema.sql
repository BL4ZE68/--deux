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
  title text not null,
  content text not null,
  media_url text,
  opens_at timestamptz not null,
  created_at timestamptz default now()
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

-- Enable memories, reactions and notifications in Supabase Dashboard:
-- Database > Publications > supabase_realtime.
