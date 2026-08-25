# Expense Buddy — Project Context

## Mục tiêu

MVP quản lý thu chi gia đình bằng tiếng Việt. App cần tạo được "wow moment" đơn giản: đăng nhập, thêm giao dịch, làm mới trang hoặc mở thiết bị khác và vẫn thấy dữ liệu.

## Công nghệ

- Next.js 16, React 19, JavaScript và CSS Modules.
- Supabase JavaScript client cho Auth (email magic link) và Postgres Data API.
- Recharts cho biểu đồ, Lucide cho icon.

## Kiến trúc dữ liệu hiện tại

- `app/lib/useExpenseData.js` là nơi duy nhất đọc/ghi Supabase và tính thống kê.
- `transactions`: một giao dịch thu/chi; `budgets`: một ngân sách tháng cho mỗi user.
- `user_id` lấy từ Supabase Auth; RLS bảo vệ dữ liệu theo user.
- Thành viên gia đình và danh mục vẫn là constants trong `app/lib/data.js` để giữ MVP tối giản.

## Quy ước quan trọng

- Chỉ dùng `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ở client. Không dùng secret/service-role key trong app.
- Giao dịch phải báo thành công sau khi request Supabase hoàn tất, không optimistic success.
- Mọi thay đổi schema phải thêm vào `supabase/schema.sql` và phản ánh ở `SUPABASE_SETUP.md`.
- JSON import là append; export chứa `transactions` và `monthlyBudget`.

## Kiểm tra trước khi bàn giao

1. `pnpm run build` chạy thành công.
2. Đăng nhập bằng email, thêm/xóa giao dịch, thay ngân sách và refresh trang.
3. Kiểm tra cùng email ở một trình duyệt khác.
4. Kiểm tra một email khác không thấy giao dịch của email đầu.

## Scope chưa làm

- Chia sẻ cùng một household giữa nhiều tài khoản.
- Realtime sync, offline queue, chỉnh sửa giao dịch và chống trùng khi import JSON.
- Những mục này không được thêm vào MVP nếu chưa có yêu cầu sản phẩm rõ ràng.
