-- =============================================================================
-- Row Level Security policies
-- 1ユーザー=1冷蔵庫の原則に従い、auth.uid() で自分のデータのみアクセス可
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.ingredients enable row level security;
alter table public.receipts enable row level security;
alter table public.recipes enable row level security;
alter table public.cooking_logs enable row level security;
alter table public.inventory_audits enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_counters enable row level security;

-- plans / ingredient_master は全ユーザー参照可能
alter table public.plans enable row level security;
alter table public.ingredient_master enable row level security;

drop policy if exists "plans readable by everyone" on public.plans;
create policy "plans readable by everyone"
  on public.plans for select using (is_active);

drop policy if exists "ingredient_master readable by everyone"
  on public.ingredient_master;
create policy "ingredient_master readable by everyone"
  on public.ingredient_master for select using (true);

-- profiles
drop policy if exists "profiles owner" on public.profiles;
create policy "profiles owner"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ingredients
drop policy if exists "ingredients owner" on public.ingredients;
create policy "ingredients owner"
  on public.ingredients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- receipts
drop policy if exists "receipts owner" on public.receipts;
create policy "receipts owner"
  on public.receipts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- recipes
drop policy if exists "recipes owner" on public.recipes;
create policy "recipes owner"
  on public.recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- cooking_logs
drop policy if exists "cooking_logs owner" on public.cooking_logs;
create policy "cooking_logs owner"
  on public.cooking_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- inventory_audits
drop policy if exists "inventory_audits owner" on public.inventory_audits;
create policy "inventory_audits owner"
  on public.inventory_audits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- subscriptions
drop policy if exists "subscriptions owner" on public.subscriptions;
create policy "subscriptions owner"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- usage_counters
drop policy if exists "usage_counters owner" on public.usage_counters;
create policy "usage_counters owner"
  on public.usage_counters for select
  using (auth.uid() = user_id);

-- =============================================================================
-- 新規ユーザー登録時に profiles を自動作成するトリガ
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  free_plan_id uuid;
begin
  select id into free_plan_id from public.plans where code = 'free' limit 1;
  insert into public.profiles (id, display_name, current_plan_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    free_plan_id
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
