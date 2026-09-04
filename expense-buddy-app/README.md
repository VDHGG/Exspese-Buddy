# 💰 Expense Buddy

Ứng dụng quản lý thu chi gia đình hiện đại bằng tiếng Việt, đồng bộ đám mây với Supabase, tích hợp thông báo nhóm tự động qua Telegram Bot JAVIS và trợ lý tài chính AI thông minh (Google Gemini 2.5 Flash).

Production URL: [https://expense-buddy-app.vercel.app](https://expense-buddy-app.vercel.app)

---

## 🚀 Tính năng nổi bật

- **Quản lý thu chi toàn diện**: Thêm mới, chỉnh sửa chi tiết, xóa giao dịch với chuẩn hóa múi giờ Việt Nam (`Asia/Ho_Chi_Minh`).
- **Dashboard trực quan**: KPI Cards (Thu nhập, Chi tiêu, Số dư, % Ngân sách), 10 giao dịch gần nhất, nhận xét Buddy Insights tự động.
- **Biểu đồ phân tích chuyên sâu**: Biểu đồ tròn Donut phân bổ theo danh mục & Biểu đồ cột phân bổ theo thành viên gia đình (Recharts).
- **Tùy biến linh hoạt**: Tự do thêm/xóa danh mục chi tiêu, danh mục thu nhập kèm icon/màu sắc, và quản lý các thành viên trong gia đình trong tab Cài đặt.
- **Thông báo tự động qua Telegram (Bot JAVIS)**: Mỗi khi có giao dịch mới hoặc cập nhật, bot JAVIS gửi thông báo HTML sắc nét kèm thanh tiến độ ngân sách vào nhóm gia đình.
- **Trợ lý tài chính AI (Google Gemini 2.5 Flash)**: Widget chat nổi trả lời tư vấn ngân sách, phân tích chi tiêu và hỗ trợ nhập giao dịch tức thời bằng ngôn ngữ tự nhiên (NLP).
- **Đồng bộ đám mây an toàn**: Supabase Auth (Email Magic Link/OTP) và Postgres Database với bảo vệ phân quyền Row Level Security (RLS).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling**: Vanilla CSS Modules (Design Tokens, Glassmorphism, Dark/Warm Palette)
- **Database & Auth**: [Supabase](https://supabase.com/) (Postgres + Magic Link Auth + RLS)
- **AI Engine**: [Google Gemini 2.5 Flash API](https://ai.google.dev/)
- **Messaging**: [Telegram Bot API](https://core.telegram.org/bots/api)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Cấu hình biến môi trường

Tạo file `.env.local` từ mẫu `.env.example`:

```bash
# Supabase Client
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key

# Telegram Bot Config
TELEGRAM_BOT_TOKEN=8806064139:AAHPDZbAK6jPuPm2rJseLNRRR0SqOCARINQ
TELEGRAM_CHAT_ID=-1003980067278
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=Javisreport_bot

# Google Gemini API Config
GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ **Lưu ý bảo mật**: Tuyệt đối không commit token bí mật, secret key hoặc service-role key lên GitHub. Các key bot và AI chỉ được dùng trong API Route phía server (`/api/telegram/notify`, `/api/chat`).

---

## 💻 Hướng dẫn chạy Local

1. Cài đặt dependencies:
   ```bash
   pnpm install
   ```

2. Khởi động dev server:
   ```bash
   pnpm dev
   ```

3. Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

4. Build kiểm tra production:
   ```bash
   pnpm run build
   ```

---

## 📚 Tài liệu chi tiết

- [Project Context](PROJECT_CONTEXT.md) — Kiến trúc tổng quan, quy ước kỹ thuật và checklist bàn giao.
- [Supabase Setup Guide](SUPABASE_SETUP.md) — Hướng dẫn cài đặt schema SQL và cấu hình Vercel.
- [Design Guidelines](docs/design-guidelines.md) — Quy chuẩn thiết kế, bảng màu, typography và components.
- [Product Requirements (PRD)](docs/project-overview-prd.md) — Tài liệu yêu cầu sản phẩm v1.1.0.
- [Progress Log](docs/progress.md) — Lịch sử các sprint và mốc phát triển.
- [Development Plan](docs/development-plan.md) — Lộ trình các tính năng tiếp theo (v1.2, v2.0).
