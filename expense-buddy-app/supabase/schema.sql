-- Expense Buddy: dữ liệu riêng theo tài khoản đăng nhập.
-- Chạy toàn bộ file này một lần trong Supabase > SQL Editor > New query.

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount > 0),
  category text not null,
  member text not null,
  note text not null default '',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_at desc);

create table if not exists public.budgets (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  monthly_budget bigint not null check (monthly_budget > 0),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- RLS chỉ trả lời "ai được làm gì"; grant cho phép role authenticated gọi Data API.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.budgets to authenticated;

drop policy if exists "Users manage own transactions" on public.transactions;
create policy "Users manage own transactions"
on public.transactions for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage own budget" on public.budgets;
create policy "Users manage own budget"
on public.budgets for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
