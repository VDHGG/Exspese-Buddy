# Expense Buddy

MVP quản lý thu chi gia đình bằng tiếng Việt, đồng bộ dữ liệu theo tài khoản Supabase.

- [Project context](PROJECT_CONTEXT.md): kiến trúc, quy ước và checklist bàn giao.
- [Supabase setup](SUPABASE_SETUP.md): hướng dẫn kết nối database và Vercel.

## Chạy local

1. Tạo `.env.local` từ `.env.example` và điền Project URL cùng Publishable key của Supabase.
2. Chạy:

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Kiểm tra production

```bash
pnpm run build
```

Trên Vercel, thêm cùng hai biến môi trường rồi redeploy. Không bao giờ đưa Secret key hoặc service-role key vào app hay GitHub.
