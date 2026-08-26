# 📋 Product Requirements Document (PRD)
# Expense Buddy — Ứng dụng Quản lý Chi tiêu Gia đình

> **Version:** 1.0.0 — MVP
> **Ngày tạo:** 2026-08-26
> **Stack:** Next.js 16 · Supabase (Auth + Postgres) · Recharts · Lucide React
> **Deploy:** Vercel Production → https://expense-buddy-app.vercel.app

---

## 1. Bối cảnh & Mục tiêu

### 1.1 Vấn đề cần giải quyết
Các gia đình Việt Nam thường quản lý chi tiêu theo cách thủ công — ghi sổ tay hoặc dùng spreadsheet rời rạc. Điều này dẫn đến:
- Không có cái nhìn tổng quan tức thời về dòng tiền gia đình
- Khó phân tích ai trong gia đình chi nhiều, chi vào đâu
- Không cảnh báo kịp thời khi vượt ngân sách
- Thiếu sự minh bạch và trách nhiệm chung giữa các thành viên

### 1.2 Mục tiêu sản phẩm
Xây dựng một **web app đơn giản, đẹp, nhanh** giúp gia đình:
1. **Ghi chép** thu nhập & chi tiêu hàng ngày với phân loại rõ ràng
2. **Theo dõi** ngân sách tháng so với thực chi
3. **Phân tích** xu hướng chi tiêu theo danh mục và thành viên
4. **Đồng bộ** dữ liệu trên cloud — mọi thành viên cùng xem được
5. **Nhận gợi ý** thông minh từ rule-based Buddy AI dựa trên pattern chi tiêu

### 1.3 Target Users
| Nhóm | Đặc điểm | Nhu cầu chính |
|------|----------|---------------|
| **Gia đình trẻ** (25–40 tuổi) | 2 vợ chồng + 1–2 con | Kiểm soát chi tiêu, tiết kiệm cho con |
| **Gia đình đa thế hệ** | Ông bà + con cái, quỹ chung | Minh bạch quỹ chung, phân chia trách nhiệm |
| **Cá nhân** | Freelancer, nhân viên văn phòng | Theo dõi thu nhập không đều |

---

## 2. Phạm vi MVP (v1.0)

### 2.1 Tính năng đã hoàn thiện ✅

#### 🔐 Authentication (AuthGate)
- Đăng nhập Magic Link qua email — không cần nhớ mật khẩu
- Supabase Auth tích hợp sẵn, gửi link xác thực về email
- Tự động phát hiện session khi click link từ email
- Đăng xuất an toàn, clear session
- Hiển thị email và sync status trên sidebar

#### 📊 Dashboard — Tổng quan
- **KPI Cards:** Thu nhập tháng, Chi tiêu tháng, Số dư, % Ngân sách đã dùng
- **Recent Transactions:** 10 giao dịch gần nhất
- **Buddy Insights:** Nhận xét AI tự động — ai chi nhiều nhất, danh mục nào cao nhất, cảnh báo ngân sách

#### ➕ Thêm giao dịch
- Form với type toggle (Thu nhập / Chi tiêu)
- **9 danh mục chi tiêu:** Ăn uống, Đi chợ, Điện nước, Học phí, Y tế, Di chuyển, Mua sắm, Giải trí, Khác
- **5 danh mục thu nhập:** Lương, Thưởng, Đầu tư, Thu nhập phụ, Khác
- **4 thành viên:** Bố, Mẹ, Bé Bo, Quỹ chung
- Nhập số tiền format VND tự động, chọn ngày giao dịch (múi giờ +7)

#### 📈 Biểu đồ phân tích
- **Donut Chart:** Chi tiêu theo danh mục (animated)
- **Bar Chart:** Chi tiêu theo từng thành viên với màu riêng biệt
- Custom tooltip hiển thị số tiền VND
- Legend chi tiết

#### 📋 Lịch sử giao dịch
- Danh sách đầy đủ tất cả giao dịch
- Filter: Tất cả / Thu nhập / Chi tiêu / từng Thành viên
- Xoá giao dịch với confirm dialog

#### ⚙️ Cài đặt
- **Ngân sách hàng tháng:** Đặt/cập nhật, sync ngay lên Supabase
- **Export JSON:** Tải xuống dữ liệu backup
- **Import JSON:** Nhập giao dịch từ file (append)
- **Reset dữ liệu:** Khôi phục mock data với confirm 2 bước

### 2.2 Ngoài phạm vi MVP
- App mobile native
- Kết nối ngân hàng / Open Banking
- Chia sẻ gia đình multi-account
- Recurring transactions (chi tiêu định kỳ)
- Push notifications

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
        │ HTTPS / REST
        ▼
SUPABASE
  Auth: Magic Link OTP (email)
  Database: Postgres (transactions + budgets)
  RLS: Row Level Security per user_id
  Client: @supabase/supabase-js ^2.112.3
        │
        ▼
DEPLOY
  Vercel (Production branch: main)
  Env: NEXT_PUBLIC_SUPABASE_URL
       NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

### 3.2 Cấu trúc thư mục

```
expense-buddy-app/
├── app/
│   ├── globals.css              # Design system tokens & utilities
│   ├── layout.js                # Root layout, metadata, fonts
│   ├── page.js                  # Entry point: routing, auth guard
│   ├── lib/
│   │   ├── data.js              # Constants, mock data, formatters, localStorage TTL
│   │   ├── supabase.js          # Supabase client singleton
│   │   └── useExpenseData.js    # Central state hook (auth + CRUD + sync)
│   └── components/
│       ├── AuthGate.js          # Login screen
│       ├── Sidebar.js           # Navigation, user info, sync status
│       ├── KpiCards.js          # 4 KPI summary cards
│       ├── AddTransaction.js    # Form thêm giao dịch
│       ├── Charts.js            # Donut + Bar charts
│       ├── TransactionList.js   # Lịch sử + filter + delete
│       ├── RecentTransactions.js
│       ├── BuddyInsights.js     # Rule-based AI insights
│       └── SettingsView.js      # Budget + export/import/reset
├── supabase/
│   └── schema.sql               # DDL + RLS policies
└── docs/                        # Tài liệu dự án
```

### 3.3 Data Flow

```
User Action
    │
    ▼
page.js (renderView switch: dashboard | add | charts | history | settings)
    │
    ▼
useExpenseData.js (central React hook)
    ├── supabase.auth.getSession() → onAuthStateChange()
    ├── supabase.from('transactions').select('*').order('occurred_at', desc)
    ├── supabase.from('budgets').select('monthly_budget').maybeSingle()
    └── computeStats() → { totalIncome, totalExpense, balance, budgetUsed, byCategory, byMember, recent }
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
| `category` | text | 'food', 'salary', etc. |
| `member` | text | 'bo', 'me', 'bebo', 'chung' |
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

### RLS Policies
```sql
-- Transactions: chỉ đọc/ghi record của chính mình
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())

-- Budgets: tương tự
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())
```

---

## 5. Tính năng đặc biệt

### 5.1 Buddy Insights (Rule-based AI)
`BuddyInsights.js` phân tích tự động 4 chiều:
1. **Top Spender** — thành viên chi nhiều nhất tháng
2. **Top Category** — danh mục chiếm phần lớn
3. **Budget Alert** — cảnh báo > 80%, khen < 50%
4. **Balance Status** — thông báo dư/thâm hụt

### 5.2 Auto-Migration LocalStorage → Cloud
Lần đầu đăng nhập, nếu có dữ liệu localStorage cũ:
- Tự động migrate lên Supabase
- Đánh key `expense-buddy-cloud-migrated-{userId}` để không lặp
- 1 lần duy nhất per user

### 5.3 Vietnam Timezone (+7)
```js
const TIMEZONE = 'Asia/Ho_Chi_Minh';
// Dùng trong computeStats và tất cả formatters
new Date(t.date).toLocaleDateString('en-CA', { timeZone: TIMEZONE })
```

### 5.4 LocalStorage TTL 3 giờ
```js
const DATA_TTL_MS = 3 * 60 * 60 * 1000;
// Dữ liệu cache cục bộ tự expire sau 3h
```

---

## 6. Non-functional Requirements

| Tiêu chí | Yêu cầu | Trạng thái |
|----------|---------|-----------|
| Performance | FCP < 2s trên mobile 4G | ✅ Next.js SSR |
| Mobile responsive | Hoạt động từ 320px | ✅ |
| Security | RLS per user, no data leak | ✅ |
| Availability | Vercel + Supabase SLA | ✅ |
| Zero config | Mở browser là dùng ngay | ✅ |

---

## 7. Known Issues & Constraints

1. **Supabase Site URL** phải set `https://expense-buddy-app.vercel.app` (không để localhost) để Magic Link redirect đúng
2. **Free Tier Pause:** Supabase pause sau 1 tuần inactive → ~30s wake-up time
3. **Single-tenant:** Mỗi email = 1 tài khoản gia đình độc lập, chưa có multi-user sharing
4. **No offline support:** Cần internet để sync; nếu mất mạng, CRUD sẽ fail
