-- NomadGao poster app — initial schema.
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;

-- ── Image library ──────────────────────────────────────────────────────────

create table if not exists event_type (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  emoji      text not null,
  created_at timestamptz not null default now()
);

create table if not exists event_photo (
  id            uuid primary key default gen_random_uuid(),
  event_type_id uuid not null references event_type(id) on delete cascade,
  storage_path  text not null,
  created_at    timestamptz not null default now()
);
create index if not exists event_photo_type_idx on event_photo(event_type_id);

create table if not exists brand_logo (
  id           uuid primary key default gen_random_uuid(),
  key          text unique not null check (key in ('nomadgao', 'hotpot')),
  storage_path text not null,
  updated_at   timestamptz not null default now()
);

-- ── Weeks, events, captions ─────────────────────────────────────────────────

create table if not exists week (
  id         uuid primary key default gen_random_uuid(),
  start_date date,
  end_date   date,
  theme      text,
  created_at timestamptz not null default now()
);

create table if not exists event (
  id            uuid primary key default gen_random_uuid(),
  week_id       uuid references week(id) on delete cascade,
  name          text not null,
  event_type_id uuid references event_type(id) on delete set null,
  date          date,
  time          text,
  location      text,
  price         text,
  description   text
);
create index if not exists event_week_idx on event(week_id);

create table if not exists caption (
  id           uuid primary key default gen_random_uuid(),
  subject      text not null,        -- 'calendar' or an event id
  week_id      uuid references week(id) on delete cascade,
  variants     text[] not null default '{}',
  chosen_index int not null default 0,
  created_at   timestamptz not null default now()
);

-- ── Storage bucket (public-read; uploads via service role) ───────────────────

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Enabled with no policies: anon/auth clients get nothing, the server's
-- service-role key bypasses RLS. All app access goes through server routes.

alter table event_type  enable row level security;
alter table event_photo enable row level security;
alter table brand_logo  enable row level security;
alter table week        enable row level security;
alter table event       enable row level security;
alter table caption     enable row level security;

-- ── Seed the pilot's default event types ─────────────────────────────────────

insert into event_type (slug, name, emoji) values
  ('sip',     'Sip & Paint',           '🎨'),
  ('board',   'Board Game Night',      '🎲'),
  ('karaoke', 'Karaoke Night',         '🎤'),
  ('nature',  'Nature Walk & Cleanup', '🥾')
on conflict (slug) do nothing;
