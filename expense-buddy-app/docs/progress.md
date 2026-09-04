# 📈 Progress Log
# Expense Buddy — Nhật ký tiến độ phát triển

> Cập nhật lần cuối: **2026-09-04**
> Trạng thái hiện tại: **v1.2 Live 🚀** — Tích hợp Thanh toán VietQR & Webhook Realtime với payOS
> Deployed: 2026-09-04T21:48 (Production — payOS Payment Gateway & Webhooks)

---

## Tóm tắt nhanh

| Milestone | Trạng thái | Ngày hoàn thành |
|-----------|-----------|----------------|
| Khởi tạo dự án (Next.js + Vercel setup) | ✅ Done | 2026-08-24 |
| Design system & layout cơ bản | ✅ Done | 2026-08-24 |
| Core components (KPI, Charts, History) | ✅ Done | 2026-08-24 |
| LocalStorage CRUD + TTL 3h | ✅ Done | 2026-08-24 |
| Deep review & bug fixes | ✅ Done | 2026-08-24 |
| Vietnam timezone (+7) | ✅ Done | 2026-08-24 |
| Supabase Auth + Postgres integration | ✅ Done | 2026-08-25 |
| RLS policies + Auto-migration | ✅ Done | 2026-08-25 |
| Production deploy (Vercel) | ✅ Done | 2026-08-25 |
| Bug fix: Supabase Site URL config | ✅ Done | 2026-08-26 |
| Tài liệu dự án (docs/) | ✅ Done | 2026-08-26 |
| Chỉnh sửa giao dịch (Edit Transaction Modal) | ✅ Done | 2026-09-04 |
| Quản lý danh mục & thành viên tùy chỉnh | ✅ Done | 2026-09-04 |
| Tích hợp thông báo Telegram Bot JAVIS | ✅ Done | 2026-09-04 |
| Trợ lý tài chính AI thông minh (Gemini 2.5 Flash) | ✅ Done | 2026-09-04 |
| Deep review, reliability & bug fixes | ✅ Done | 2026-09-04 |
| Email + Password Auth (thay thế Magic Link) | ✅ Done | 2026-09-04 |
| Tích hợp payOS VietQR & Webhook Realtime | ✅ Done | 2026-09-04 |
| Supabase Realtime (auto-update Dashboard) | ✅ Done | 2026-09-04 |

---

## Chi tiết theo ngày

### 📅 2026-08-24 — Sprint 1: Foundation & MVP UI

#### Khởi tạo
- [x] Tạo Next.js app với `npx create-next-app@latest`
- [x] Setup Vercel deployment, connect GitHub main branch
- [x] Cấu hình `.env.local`, `.env.example`, `.gitignore`
- [x] Thêm `VIBECODE_BUOI4_OUTLINE_TRAINER_NO_IMAGE_DEPENDENCY.md` vào `.gitignore`

#### Design System
- [x] `globals.css`: Toàn bộ design tokens (wood palette, emerald, red, indigo, amber)
- [x] `globals.css`: Typography — Be Vietnam Pro từ Google Fonts
- [x] `globals.css`: Utility classes (`.card`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.input`)
- [x] `globals.css`: CSS Custom Properties cho spacing, radius, shadow, transition
- [x] Layout sidebar + main content (`page.module.css`)

#### Components (Vòng 1)
- [x] `Sidebar.js` — Navigation 5 tab, family avatars, sync status, sign-out
- [x] `KpiCards.js` — 4 thẻ: Thu nhập, Chi tiêu, Số dư, % Ngân sách
- [x] `AddTransaction.js` — Form thêm giao dịch, type toggle, category/member picker
- [x] `Charts.js` — Donut chart (by category) + Bar chart (by member) với Recharts
- [x] `TransactionList.js` — Danh sách đầy đủ, filter, xoá
- [x] `RecentTransactions.js` — 10 giao dịch gần nhất trên dashboard
- [x] `BuddyInsights.js` — Rule-based AI insights (4 loại nhận xét)
- [x] `SettingsView.js` — Budget, Export JSON, Import JSON, Reset

#### Data Layer (LocalStorage)
- [x] `data.js` — FAMILY_MEMBERS, CATEGORIES constants
- [x] `data.js` — `generateMockData()` với 20 giao dịch mẫu thực tế
- [x] `data.js` — `loadData()`, `saveData()` với **TTL 3 giờ**
- [x] `data.js` — `formatCurrency()`, `formatDate()`, `formatMonthYear()` — timezone +7
- [x] `useExpenseData.js` — Custom hook quản lý toàn bộ state (localStorage mode)

#### Bug fixes (Deep Review Round 1)
- [x] Fix KPI card animation delay
- [x] Fix mobile sidebar overlay z-index
- [x] Fix chart empty state khi không có data
- [x] Fix budget percentage overflow > 100%
- [x] Thêm confirm dialog 2 bước cho reset

---

### 📅 2026-08-25 — Sprint 2: Cloud Integration

#### Supabase Setup
- [x] Tạo Supabase project: `pjhnpeucdsyuwehafgum.supabase.co`
- [x] Chạy `supabase/schema.sql` trong SQL Editor:
  - Table `transactions` với index `(user_id, occurred_at DESC)`
  - Table `budgets` — 1 record per user
  - RLS enabled + policies "Users manage own transactions/budget"
  - Grant `SELECT, INSERT, UPDATE, DELETE` cho role `authenticated`
- [x] `supabase.js` — Singleton client với graceful fallback khi chưa config

#### Auth
- [x] `AuthGate.js` — Magic Link login form
- [x] `AuthGate.module.css` — Glassmorphism card, centered layout
- [x] `page.js` — Guard: chưa login → AuthGate, đã login → app
- [x] Supabase Auth: `signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })`
- [x] `onAuthStateChange` listener để tự detect session sau click magic link
- [x] Sign out: `supabase.auth.signOut()`

#### Supabase CRUD
- [x] `useExpenseData.js` — `loadCloudData()`: fetch transactions + budget song song
- [x] `useExpenseData.js` — `addTransaction()`: insert to Supabase, update local state
- [x] `useExpenseData.js` — `deleteTransaction()`: delete from Supabase
- [x] `useExpenseData.js` — `updateBudget()`: upsert với `onConflict: 'user_id'`
- [x] `useExpenseData.js` — `resetData()`: delete all + seed mock + update budget
- [x] `useExpenseData.js` — `importData()`: batch insert từ JSON file

#### Auto-Migration
- [x] Logic phát hiện user có localStorage data → tự động import lên cloud
- [x] Migration key `expense-buddy-cloud-migrated-{userId}` trong localStorage
- [x] Chỉ migrate 1 lần duy nhất per user

#### Timezone Fix
- [x] `data.js` — Thêm `TIMEZONE = 'Asia/Ho_Chi_Minh'`
- [x] `useExpenseData.js → computeStats()` — Dùng `toLocaleDateString('en-CA', { timeZone })` thay vì `.getMonth()`
- [x] Tất cả formatters (`formatDate`, `formatFullDate`, `formatMonthYear`) dùng `TIMEZONE`

#### Vercel Deploy
- [x] Set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [x] Git push origin main → Vercel auto-deploy
- [x] Verify production: https://expense-buddy-app.vercel.app

#### Verification
- [x] Test đăng nhập với `vuduchuy2072004@gmail.com` — ✅ thành công
- [x] Verify data trên Supabase Dashboard — ✅ transactions và budgets đúng
- [x] Test thêm/xoá giao dịch trên production — ✅ sync realtime

---

### 📅 2026-08-26 — Sprint 3: Bug Fix & Documentation

#### Bug: doc@mindx.edu.vn sync error
- [x] Investigation: Supabase Admin API — xác nhận `doc@mindx.edu.vn` không có user record
- [x] Root cause: **Site URL trong Supabase = `http://localhost:3000`** → Magic Link redirect về localhost thay vì production
- [x] Fix: Hướng dẫn đổi Site URL → `https://expense-buddy-app.vercel.app` trong Supabase Dashboard → Authentication → URL Configuration
- [x] Xác nhận Redirect URLs đã có cả `https://expense-buddy-app.vercel.app` và `http://localhost:3000`

#### Documentation
- [x] Tạo folder `docs/`
- [x] `project-overview-prd.md` — PRD đầy đủ
- [x] `design-guidelines.md` — Design system chi tiết
- [x] `progress.md` — Nhật ký này
- [x] `development-plan.md` — Lộ trình phát triển v2.x

---

### 📅 2026-09-04 — Sprint 4: Transaction Editing, Customization, Telegram Bot & Gemini Chatbot

#### Chỉnh sửa giao dịch (Transaction Editing)
- [x] Component `EditTransactionModal.js` với giao diện modal chỉnh sửa trực quan (chuyển đổi Thu/Chi, đổi danh mục linh hoạt, chọn thành viên, nhập số tiền, đổi ngày và ghi chú).
- [x] Tích hợp nút chỉnh sửa (icon `Pencil`) trong cả danh sách `TransactionList.js` và bảng 10 giao dịch gần nhất `RecentTransactions.js`.
- [x] Hàm `onEdit` trong `useExpenseData.js` đồng bộ cập nhật lên Supabase Postgres table `transactions`, fallback cập nhật `localStorage` khi offline.
- [x] Chuẩn hóa ngày giờ sang múi giờ Việt Nam `Asia/Ho_Chi_Minh` (`+07:00`) tránh lỗi trôi ngày khi edit.

#### Quản lý danh mục & thành viên gia đình tùy chỉnh
- [x] Mở rộng tab **Cài đặt** (`SettingsView.js`) với giao diện quản lý trực quan:
  - Thêm / Xóa danh mục chi tiêu và danh mục thu nhập kèm chọn icon Lucide và mã màu tùy ý.
  - Thêm / Xóa thành viên gia đình kèm avatar chữ viết tắt và bảng màu đa dạng.
- [x] Tích hợp đồng bộ Supabase qua bảng `user_settings` (cột `categories` JSONB và `family_members` JSONB) kèm fallback localStorage / defaults trong `data.js`.
- [x] Cơ chế đồng bộ bảo toàn dữ liệu: luôn upsert cả 2 trường `categories` và `family_members` đồng thời để không bị reset cột chưa truyền về default trong Postgres.
- [x] Cập nhật toàn bộ các views (`AddTransaction`, `EditTransactionModal`, `TransactionList`, `Charts`, `Sidebar`, `BuddyInsights`, `FloatingChatWidget`) phản ánh danh mục và thành viên tùy chỉnh mới nhất.

#### Tích hợp thông báo tự động Telegram (Bot JAVIS)
- [x] Thiết lập Bot Telegram `@Javisreport_bot` (token bot cấu hình an toàn trong `.env.local` / Vercel env).
- [x] Tạo API server route an toàn: `/api/telegram/notify` (Next.js App Router POST handler) gửi thông báo tới nhóm Telegram chung (`-1003980067278`).
- [x] Thiết kế mẫu thông báo HTML thân thiện, trực quan, không AI slop:
  - Header với badge loại giao dịch (🔴 CHI TIÊU MỚI / 🟢 THU NHẬP MỚI / ✏️ CẬP NHẬT GIAO DỊCH).
  - Định dạng số tiền nổi bật (VND), danh mục, người chi/thu, ghi chú và thời gian giao dịch.
  - Footer tiến độ ngân sách tháng trực quan kèm thanh progress text (`[■■■■□□□□□□] 42%`).
- [x] Smoke test live: Test thành công gửi thông báo trực tiếp vào nhóm **Buddy** (Message IDs: `2`, `3`).

#### Trợ lý tài chính AI thông minh (Google Gemini 2.5 Flash)
- [x] Tích hợp mô hình `gemini-2.5-flash` qua API server route `/api/chat` (sử dụng `GEMINI_API_KEY`).
- [x] Component giao diện `FloatingChatWidget.js`: Nút widget tròn nổi góc dưới phải màn hình với animation mượt, cửa sổ chat bo góc glassmorphism cao cấp, gợi ý nhanh (quick prompts).
- [x] Cung cấp system prompt thông minh nạp ngữ cảnh dữ liệu tài chính gia đình (tổng thu, chi, số dư, ngân sách tháng, danh mục và thành viên hiện tại).
- [x] Tính năng bóc tách giao dịch tự nhiên (NLP): Cho phép người dùng nhập nhanh như *"Vừa đi ăn sáng hết 45k bố trả"* hoặc *"Lương tháng này 25tr mẹ"* -> Gemini tự động phân tích và tạo giao dịch tức thì vào hệ thống.
- [x] Xây dựng bộ fuzzy matcher (`resolveCategory`, `resolveMember`) nhận diện linh hoạt keyword tiếng Việt/Anh, danh mục tùy biến và định dạng dữ liệu linh hoạt.

#### Deep Review, Bug Fixes & Tối ưu hóa
- [x] Loại bỏ side-effect bất đồng bộ ra khỏi React state updater trong `useExpenseData.js` (tránh gửi lặp tin nhắn Telegram khi React re-render).
- [x] Khắc phục triệt để lỗi ghi đè dữ liệu Supabase `upsert` trên bảng `user_settings`.
- [x] Bổ sung timeout (`AbortSignal.timeout`) và validation `.trim()` cho Telegram và Gemini API routes.
- [x] Đồng bộ chuẩn hóa ngày giờ (`T12:00:00+07:00`) trong cả `AddTransaction.js` và `EditTransactionModal.js`.
- [x] Bổ sung regex bóc tách JSON đa tầng trong `/api/chat/route.js` và `FloatingChatWidget.js`.

---

## Metrics hiện tại

| Metric | Giá trị |
|--------|---------|
| Lines of code (JS) | ~2,500 lines |
| Lines of code (CSS) | ~515 lines globals + ~1,500 lines modules |
| Components | 11 components (+ EditTransactionModal, FloatingChatWidget) |
| API Routes | 2 routes (`/api/telegram/notify`, `/api/chat`) |
| Lib files | 3 files (data.js, supabase.js, useExpenseData.js) |
| Supabase tables | 3 tables (`transactions`, `budgets`, `user_settings`) |
| Deploy time (Vercel) | ~45 giây |
| Bundle size | ~310KB gzip |

---

## Known Issues & Pending

| Issue | Mức độ | Trạng thái |
|-------|--------|-----------|
| Supabase Site URL phải set đúng production URL | 🔴 Critical | ✅ Đã có fix guide |
| Free tier pause sau 1 tuần inactive | 🟡 Medium | ⏳ Chưa xử lý (nâng tier hoặc ping) |
| Không có offline fallback khi mất mạng | 🟡 Medium | ⏳ Roadmap v1.2 |
| Sidebar không nhớ collapse state | 🟢 Low | ⏳ Nice-to-have |
| Import JSON không validate schema chặt | 🟡 Medium | ⏳ Roadmap v1.2 |

---

## Lịch sử Deploy

| Version | Deploy | URL | Note |
|---------|--------|-----|------|
| v1.1.0 | 2026-09-04 | https://expense-buddy-app.vercel.app | Edit Transaction + Custom Settings + Telegram Bot JAVIS + Gemini AI Chatbot |
| v1.0.0 | 2026-08-25 | https://expense-buddy-app.vercel.app | MVP + Supabase Auth & Cloud |
| v0.9.0 | 2026-08-24 | *(preview URL)* | LocalStorage MVP |
