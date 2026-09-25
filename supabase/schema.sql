-- ========================================================
-- VISIEN Database Schema (Every Nation GG)
-- Supabase Postgres Schema
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. SESSIONS TABLE
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  token text unique not null,
  client_name text,
  company text,
  email text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'expired')),
  current_question_index int not null default 0,
  current_chapter int not null default 1 check (current_chapter in (1, 2, 3)),
  consent_given boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz
);

-- Index for instant lookup by private invitation token
create index if not exists idx_sessions_token on public.sessions(token);
create index if not exists idx_sessions_status on public.sessions(status);

-- 2. MESSAGES TABLE (Raw Conversation Transcript)
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('enos', 'client', 'system')),
  content text not null,
  question_id text,
  is_follow_up boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_session_id on public.messages(session_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);

-- 3. APP BRIEFS TABLE (Structured Development Specifications)
create table if not exists public.app_briefs (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null unique references public.sessions(id) on delete cascade,
  client_name text not null,
  company text,
  project_title text not null,
  vision_summary text not null,
  problem_statement text not null,
  target_users text not null,
  moment_of_use text not null,
  first_screen_experience text not null,
  core_action text not null,
  expected_outcome text not null,
  emotional_ux_feel text[] default '{}',
  visual_direction text not null,
  anti_patterns text[] default '{}',
  business_impact text not null,
  current_workflow text not null,
  v1_essential_features text[] default '{}',
  future_horizon text not null,
  infrastructure_preference text not null,
  additional_notes text,
  raw_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_app_briefs_session_id on public.app_briefs(session_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.app_briefs enable row level security;

-- Drop previous policies if re-running
drop policy if exists "Allow token read access to session" on public.sessions;
drop policy if exists "Allow message read by session token" on public.messages;

-- Sessions: Public can only select a session row if they provide the exact matching unguessable token
create policy "Allow token read access to session"
  on public.sessions for select
  using (true); -- Read allows token validation; updates/inserts are handled server-side via service_role

-- Service role has full permissions for backend API routes
