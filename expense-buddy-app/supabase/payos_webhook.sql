-- Chạy lệnh SQL này trong Supabase > SQL Editor > New query
-- Mục đích: Cho phép server Webhook (payOS) ghi nhận giao dịch nạp quỹ an toàn vào bảng transactions mà không bị chặn bởi RLS.

create or replace function public.record_payos_payment(
  p_amount bigint,
  p_note text,
  p_user_id uuid default null
) returns json
language plpgsql
security definer
as $$
declare
  target_user uuid;
  new_tx record;
begin
  -- Nếu không truyền user_id, tự động gán cho tài khoản admin/user gần nhất
  if p_user_id is not null then
    target_user := p_user_id;
  else
    select id into target_user from auth.users order by created_at desc limit 1;
  end if;

  if target_user is null then
    raise exception 'Không tìm thấy user hợp lệ để ghi nhận giao dịch.';
  end if;

  insert into public.transactions (
    user_id,
    type,
    amount,
    category,
    member,
    note,
    occurred_at
  )
  values (
    target_user,
    'income',
    p_amount,
    'Quỹ chung',
    'Quỹ chung',
    p_note,
    now()
  )
  returning * into new_tx;

  return row_to_json(new_tx);
end;
$$;

-- Cấp quyền gọi hàm cho authenticated và anon (Webhook serverless)
grant execute on function public.record_payos_payment to anon, authenticated, service_role;
