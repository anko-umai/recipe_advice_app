-- =============================================================================
-- Recipe Advice App: initial schema
-- Phase 0 / Phase 1 Sprint 1 で使う最小限のテーブル構成
-- =============================================================================

-- ----- Extensions -----
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----- plans (課金導線の先行設計) -----
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  price_jpy integer not null default 0,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.plans (code, name, price_jpy, features)
values
  ('free', 'Free', 0, '{"recipe_limit": 30, "ocr_limit": 20}'),
  ('standard', 'Standard', 500, '{"recipe_limit": -1, "ocr_limit": 100}'),
  ('family', 'Family', 1000, '{"recipe_limit": -1, "ocr_limit": 300, "sharing": true}')
on conflict (code) do nothing;

-- ----- profiles (auth.users に 1:1 で紐付く) -----
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  current_plan_id uuid references public.plans (id),
  receipt_retention_days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----- subscriptions (当面は 0 件だが、スキーマを先行) -----
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status text not null check (
    status in ('active', 'trialing', 'past_due', 'canceled', 'paused')
  ),
  provider text,
  provider_subscription_id text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----- usage_counters -----
create table if not exists public.usage_counters (
  user_id uuid not null references auth.users (id) on delete cascade,
  period_yyyymm text not null,
  recipe_count integer not null default 0,
  ocr_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, period_yyyymm)
);

-- ----- ingredient_master (正規化食材マスタ) -----
create table if not exists public.ingredient_master (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  category text not null,
  default_unit text not null,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists ingredient_master_name_idx
  on public.ingredient_master (canonical_name);

-- ----- ingredients (ユーザー在庫) -----
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  master_id uuid references public.ingredient_master (id),
  name text not null,
  quantity numeric(10, 2) not null default 1,
  unit text not null default '個',
  storage_type text not null default 'refrigerated'
    check (storage_type in ('refrigerated', 'frozen', 'pantry')),
  purchased_at date,
  expires_at date,
  note text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ingredients_user_idx
  on public.ingredients (user_id) where deleted_at is null;

-- ----- receipts -----
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_path text,
  ocr_raw_text text,
  parsed_items jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'imported', 'discarded')),
  created_at timestamptz not null default now(),
  retention_expires_at timestamptz
);

-- ----- recipes -----
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  cuisine text,
  duration_min integer,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  calories integer,
  source text not null default 'ai' check (source in ('ai', 'user', 'external')),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----- cooking_logs -----
create table if not exists public.cooking_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete set null,
  cooked_at timestamptz not null default now(),
  meal_type text not null default 'dinner'
    check (meal_type in ('breakfast', 'lunch', 'dinner', 'other')),
  rating integer check (rating between 1 and 5),
  memo text,
  created_at timestamptz not null default now()
);

-- ----- inventory_audits (自動減算ログ) -----
create table if not exists public.inventory_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cooking_log_id uuid references public.cooking_logs (id) on delete set null,
  ingredient_id uuid references public.ingredients (id) on delete set null,
  delta numeric(10, 2) not null,
  before_qty numeric(10, 2) not null,
  after_qty numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

-- ----- updated_at トリガ -----
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'profiles_set_updated_at'
  ) then
    create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'ingredients_set_updated_at'
  ) then
    create trigger ingredients_set_updated_at
    before update on public.ingredients
    for each row execute function public.set_updated_at();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'subscriptions_set_updated_at'
  ) then
    create trigger subscriptions_set_updated_at
    before update on public.subscriptions
    for each row execute function public.set_updated_at();
  end if;
end $$;
