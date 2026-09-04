# 📋 Product Requirements Document (PRD)
# Expense Buddy — Ứng dụng Quản lý Chi tiêu Gia đình

> **Version:** 1.1.0 — Customization, Telegram Bot JAVIS & Gemini AI Assistant
> **Ngày cập nhật:** 2026-09-04
> **Stack:** Next.js 16 · React 19 · Supabase (Auth + Postgres) · Telegram Bot API · Google Gemini 2.5 Flash · Recharts · Lucide React
> **Deploy:** Vercel Production → https://expense-buddy-app.vercel.app

---

## 1. Bối cảnh & Mục tiêu

### 1.1 Vấn đề cần giải quyết
Các gia đình Việt Nam thường quản lý chi tiêu theo cách thủ công — ghi sổ tay hoặc dùng spreadsheet rời rạc. Điều này dẫn đến:
- Không có cái nhìn tổng quan tức thời về dòng tiền gia đình
- Khó phân tích ai trong gia đình chi nhiều, chi vào đâu
- Không cảnh báo kịp thời khi vượt ngân sách
- Thiếu sự minh bạch và trách nhiệm chung giữa các thành viên
- Nhập liệu thủ công rườm rà, thiếu tính kết nối tức thì tới group chat gia đình

### 1.2 Mục tiêu sản phẩm
Xây dựng một **web app hiện đại, đẹp mắt, trực quan và thông minh** giúp gia đình:
1. **Ghi chép & Chỉnh sửa** thu nhập & chi tiêu hàng ngày nhanh chóng với phân loại linh hoạt.
2. **Tùy biến** danh mục và thành viên gia đình theo nhu cầu thực tế của từng hộ.
3. **Theo dõi** ngân sách tháng so với thực chi với biểu đồ trực quan.
4. **Thông báo tức thì qua Telegram**: Gửi thông báo chi tiêu/thu nhập đẹp mắt vào nhóm gia đình qua bot JAVIS (`@Javisreport_bot`).
5. **Trợ lý tài chính AI thông minh**: Chatbot Google Gemini 2.5 Flash giải đáp, tư vấn chi tiêu và tự động bóc tách ngôn ngữ tự nhiên (NLP) thành giao dịch.
6. **Đồng bộ đám mây**: Dữ liệu lưu trữ an toàn trên Supabase Postgres có bảo vệ RLS.

### 1.3 Target Users
| Nhóm | Đặc điểm | Nhu cầu chính |
|------|----------|---------------|
| **Gia đình trẻ** (25–40 tuổi) | 2 vợ chồng + 1–2 con | Kiểm soát chi tiêu, nhận thông báo nhóm Telegram, tiết kiệm cho tương lai |
| **Gia đình đa thế hệ** | Ông bà + con cái, quỹ chung | Minh bạch thu chi, tùy biến thành viên gia đình |
| **Cá nhân bận rộn** | Nhân viên văn phòng, freelancer | Nhập liệu cực nhanh qua chat AI tự nhiên |

---

## 2. Phạm vi Tính năng (v1.1)

### 2.1 Tính năng đã hoàn thiện ✅

#### 🔐 Authentication (AuthGate)
- Đăng nhập Magic Link qua email — không cần nhớ mật khẩu
- Supabase Auth tích hợp sẵn, gửi link xác thực về email
- Tự động phát hiện session khi click link từ email
- Đăng xuất an toàn, clear session
- Hiển thị email và sync status trên sidebar

#### 📊 Dashboard — Tổng quan
- **KPI Cards:** Thu nhập tháng, Chi tiêu tháng, Số dư, % Ngân sách đã dùng
- **Recent Transactions:** 10 giao dịch gần nhất kèm nút Chỉnh sửa (Pencil) và Xóa
- **Buddy Insights:** Nhận xét AI tự động — ai chi nhiều nhất, danh mục nào cao nhất, cảnh báo ngân sách

#### ➕ Thêm & Chỉnh sửa Giao dịch
- Form thêm giao dịch với type toggle (Thu nhập / Chi tiêu)
- Modal **EditTransactionModal** chỉnh sửa mọi thông tin giao dịch (Số tiền, Danh mục, Người chi/thu, Ngày, Ghi chú)
- Chuẩn hóa ngày giờ sang múi giờ Việt Nam `Asia/Ho_Chi_Minh` (`+07:00`)
- Tự động trigger thông báo Telegram sau khi tạo mới hoặc cập nhật giao dịch

#### ⚙️ Quản lý Danh mục & Thành viên tùy biến
- Quản lý danh mục Chi tiêu và Thu nhập: thêm mới với icon Lucide tùy chọn, chọn mã màu sắc, xóa danh mục
- Quản lý thành viên gia đình: thêm thành viên mới với avatar chữ viết tắt, chọn màu đại diện, xóa thành viên
- Đồng bộ bảng `user_settings` trên Supabase (JSONB columns) với cơ chế bảo toàn dữ liệu và fallback localStorage

#### 🤖 Trợ lý Tài chính AI Gemini 2.5 Flash
- Widget nổi góc phải màn hình (`FloatingChatWidget`) với animation mượt, giao diện glassmorphism
- Tự động nạp ngữ cảnh dữ liệu tài chính (tổng thu, chi, ngân sách, số dư, danh mục, thành viên)
- Phân tích chi tiêu, gợi ý tiết kiệm theo câu hỏi của người dùng
- **Bóc tách giao dịch tự nhiên (NLP)**: Người dùng chat *"Vừa ăn phở 45k bố trả"* → Gemini tự động nhận diện và tạo giao dịch tức thì vào hệ thống với bộ fuzzy matcher linh hoạt

#### 📢 Thông báo tự động qua Telegram (Bot JAVIS)
- Bot JAVIS (`@Javisreport_bot`) gửi tin nhắn tự động vào nhóm chat gia đình (`-1003980067278`)
- API Route `/api/telegram/notify` bảo mật token ở phía server
- Định dạng HTML sắc nét, trực quan, không AI slop:
  - Header với badge phân loại (🔴 CHI TIÊU MỚI / 🟢 THU NHẬP MỚI / ✏️ CẬP NHẬT GIAO DỊCH)
  - Chi tiết số tiền, danh mục, người phụ trách, ghi chú, thời gian
  - Thanh tiến độ ngân sách tháng trực quan `[■■■■□□□□□□] 42%`

#### 📈 Biểu đồ phân tích
- **Donut Chart:** Chi tiêu theo danh mục (animated)
- **Bar Chart:** Chi tiêu theo từng thành viên với màu sắc tương ứng
- Custom tooltip hiển thị số tiền VND

#### 📋 Lịch sử giao dịch
- Danh sách đầy đủ tất cả giao dịch
- Filter: Tất cả / Thu nhập / Chi tiêu / từng Thành viên
- Chỉnh sửa và Xoá giao dịch với confirm dialog

#### ⚙️ Cài đặt chung & Dữ liệu
- **Ngân sách hàng tháng:** Đặt/cập nhật, sync ngay lên Supabase
- **Export JSON:** Tải xuống dữ liệu backup
- **Import JSON:** Nhập giao dịch từ file (append)
- **Reset dữ liệu:** Khôi phục mock data với confirm 2 bước

---

## 3. Kiến trúc Hệ thống

### 3.1 Tech Stack

```
FRONTEND
  Next.js 16.3.2 (App Router, Client Components)
  React 19.2.8
  Vanilla CSS Modules
  Recharts 3.10.1 (biểu đồ)
  Lucide React 1.34.0 (icons)
  Be Vietnam Pro font (Google Fonts)
        │
        ├── HTTPS (App Router API Routes)
        │     ├── /api/telegram/notify  ──► Telegram Bot API (JAVIS)
        │     └── /api/chat             ──► Google Gemini 2.5 Flash API
        │
        ▼ HTTPS / REST
SUPABASE
  Auth: Magic Link OTP (email)
  Database: Postgres (transactions, budgets, user_settings)
  RLS: Row Level Security per user_id
  Client: @supabase/supabase-js ^2.112.3
        │
        ▼
DEPLOY
  Vercel (Production branch: main)
```

### 3.2 Cấu trúc thư mục

```
expense-buddy-app/
├── app/
│   ├── globals.css                   # Design system tokens & utilities
│   ├── layout.js                     # Root layout, metadata, fonts
│   ├── page.js                       # Entry point: routing, auth guard
│   ├── api/
│   │   ├── chat/route.js             # Gemini AI Assistant API handler
│   │   └── telegram/notify/route.js  # Telegram Bot JAVIS notification handler
│   ├── lib/
│   │   ├── data.js                   # Constants, mock data, formatters, localStorage TTL
│   │   ├── supabase.js               # Supabase client singleton
│   │   └── useExpenseData.js         # Central state hook (auth + CRUD + sync + notify)
│   └── components/
│       ├── AuthGate.js               # Login screen
│       ├── Sidebar.js                # Navigation, user info, sync status
│       ├── KpiCards.js               # 4 KPI summary cards
│       ├── AddTransaction.js         # Form thêm giao dịch
│       ├── EditTransactionModal.js   # Modal chỉnh sửa giao dịch
│       ├── FloatingChatWidget.js     # Trợ lý AI Gemini widget chat nổi
│       ├── Charts.js                 # Donut + Bar charts
│       ├── TransactionList.js        # Lịch sử + filter + edit + delete
│       ├── RecentTransactions.js     # 10 giao dịch gần nhất
│       ├── BuddyInsights.js          # Rule-based AI insights
│       └── SettingsView.js           # Budget + Categories/Members + backup/reset
├── supabase/
│   └── schema.sql                    # DDL + RLS policies
└── docs/                             # Tài liệu dự án
```

---

## 4. Database Schema

### Bảng `transactions`
| Column | Type | Mô tả |
|--------|------|-------|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid FK | auth.users, cascade delete |
| `type` | text | 'income' hoặc 'expense' |
| `amount` | bigint | VND, check > 0 |
| `category` | text | ID danh mục |
| `member` | text | ID thành viên |
| `note` | text | Ghi chú, default '' |
| `occurred_at` | timestamptz | Ngày giao dịch |
| `created_at` | timestamptz | Ngày tạo record |

Index: `transactions_user_date_idx` trên `(user_id, occurred_at DESC)`

### Bảng `budgets`
| Column | Type | Mô tả |
|--------|------|-------|
| `user_id` | uuid PK FK | 1 record per user |
| `monthly_budget` | bigint | VND, check > 0 |
| `updated_at` | timestamptz | Lần cập nhật gần nhất |

### Bảng `user_settings`
| Column | Type | Mô tả |
|--------|------|-------|
| `user_id` | uuid PK FK | 1 record per user |
| `categories` | jsonb | Danh sách category chi tiêu & thu nhập tùy biến |
| `family_members` | jsonb | Danh sách thành viên gia đình tùy biến |
| `updated_at` | timestamptz | Lần cập nhật gần nhất |

### RLS Policies
Tất cả các bảng (`transactions`, `budgets`, `user_settings`) đều bật RLS với điều kiện:
```sql
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())
```
