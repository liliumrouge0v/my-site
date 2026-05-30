-- =============================================================
--  生活记录网站 — Supabase 数据库结构
--  在 Supabase 控制台 → SQL Editor 中整段执行一次即可。
--  包含:建表、索引、唯一约束、行级安全(RLS)策略。
-- =============================================================

-- ---------- 计时器活动分类 ----------
create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#6366f1',
  icon        text not null default 'circle',
  sort        int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- 计时记录 ----------
create table if not exists public.time_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  activity_id      uuid references public.activities(id) on delete set null,
  started_at       timestamptz not null,
  ended_at         timestamptz not null,
  duration_seconds int  not null,
  note             text,
  is_public        boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists time_entries_user_started_idx
  on public.time_entries (user_id, started_at desc);

-- ---------- 习惯 ----------
create table if not exists public.habits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  color           text not null default '#22c55e',
  icon            text not null default 'check',
  target_per_week int  not null default 7,
  archived        boolean not null default false,
  is_public       boolean not null default false,
  sort            int  not null default 0,
  created_at      timestamptz not null default now()
);

-- ---------- 习惯每日打卡 ----------
create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  habit_id   uuid not null references public.habits(id) on delete cascade,
  log_date   date not null,
  count      int  not null default 1,
  note       text,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);
create index if not exists habit_logs_user_date_idx
  on public.habit_logs (user_id, log_date desc);

-- =============================================================
--  行级安全 (RLS)
-- =============================================================
alter table public.activities   enable row level security;
alter table public.time_entries enable row level security;
alter table public.habits       enable row level security;
alter table public.habit_logs   enable row level security;

-- ---------- activities ----------
-- 本人完全读写;activities 本身没有 is_public,公开页通过 time_entries 关联读取所需信息,
-- 因此额外开放一个"被公开记录引用的活动"匿名只读策略。
drop policy if exists "activities owner all" on public.activities;
create policy "activities owner all" on public.activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "activities public read" on public.activities;
create policy "activities public read" on public.activities
  for select using (
    exists (
      select 1 from public.time_entries te
      where te.activity_id = activities.id and te.is_public = true
    )
  );

-- ---------- time_entries ----------
drop policy if exists "time_entries owner all" on public.time_entries;
create policy "time_entries owner all" on public.time_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "time_entries public read" on public.time_entries;
create policy "time_entries public read" on public.time_entries
  for select using (is_public = true);

-- ---------- habits ----------
drop policy if exists "habits owner all" on public.habits;
create policy "habits owner all" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "habits public read" on public.habits;
create policy "habits public read" on public.habits
  for select using (is_public = true);

-- ---------- habit_logs ----------
drop policy if exists "habit_logs owner all" on public.habit_logs;
create policy "habit_logs owner all" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 公开习惯的打卡记录,匿名可读(用于公开页的连续天数 / 热力图)
drop policy if exists "habit_logs public read" on public.habit_logs;
create policy "habit_logs public read" on public.habit_logs
  for select using (
    exists (
      select 1 from public.habits h
      where h.id = habit_logs.habit_id and h.is_public = true
    )
  );
