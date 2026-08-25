# Kết nối Expense Buddy với Supabase

## 1. Tạo bảng dữ liệu

1. Mở [Supabase Dashboard](https://supabase.com/dashboard) và chọn project của bạn.
2. Vào **SQL Editor** → **New query**.
3. Mở file `supabase/schema.sql` trong project này, copy toàn bộ và bấm **Run**.

Kết quả: bạn sẽ có bảng `transactions` và `budgets`. Mỗi tài khoản chỉ thấy dữ liệu của chính mình.

## 2. Bật đăng nhập bằng email

1. Vào **Authentication** → **Providers** → **Email**.
2. Bật **Enable Email provider**.
3. Trong **Authentication** → **URL Configuration**, thêm hai URL:
   - `http://localhost:3000`
   - `https://expense-buddy-app.vercel.app`

## 3. Thêm key vào máy

1. Trong Supabase, bấm **Connect**.
2. Copy **Project URL** và **Publishable key** — không copy Secret key.
3. Tạo file `.env.local` bên cạnh `package.json`, rồi điền:

```env
NEXT_PUBLIC_SUPABASE_URL=gia-tri-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=gia-tri-publishable-key
```

File này đã bị Git bỏ qua, không đưa lên GitHub.

## 4. Thêm key vào Vercel

1. Vercel → project **expense-buddy-app** → **Settings** → **Environment Variables**.
2. Thêm đúng hai biến ở trên cho Production, Preview và Development.
3. Deploy lại project.

## 5. Kiểm tra wow moment

1. Mở app → nhập email → bấm **Gửi link đăng nhập**.
2. Mở email, bấm link, rồi quay lại app.
3. Thêm một khoản chi và refresh trang: giao dịch vẫn còn.
4. Mở app ở một trình duyệt khác, đăng nhập cùng email: dữ liệu cũng xuất hiện.
5. Thử xuất JSON, rồi nhập lại: app sẽ **thêm** các giao dịch từ file vào Supabase.

## Nếu app báo chưa cấu hình

Kiểm tra `.env.local` có nằm cùng thư mục `package.json` không. Sau khi sửa biến môi trường, dừng rồi chạy lại dev server. Trên Vercel, cần redeploy sau khi thêm biến.

## Ghi chú dữ liệu

- Khi lần đầu đăng nhập, app tự chuyển dữ liệu cũ trong trình duyệt lên Supabase một lần.
- Nhập JSON là thao tác **thêm** dữ liệu, không thay thế dữ liệu đang có. Tránh nhập cùng một file nhiều lần nếu không muốn giao dịch trùng lặp.
