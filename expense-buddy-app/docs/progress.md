# 📈 Progress Log
# Expense Buddy — Nhật ký tiến độ phát triển

> Cập nhật lần cuối: **2026-08-26**
> Trạng thái hiện tại: **MVP Live ✅** — Production tại https://expense-buddy-app.vercel.app

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

## Metrics hiện tại

| Metric | Giá trị |
|--------|---------|
| Lines of code (JS) | ~1,400 lines |
| Lines of code (CSS) | ~515 lines globals + ~900 lines modules |
| Components | 9 components |
| Lib files | 3 files (data.js, supabase.js, useExpenseData.js) |
| Supabase users (production) | 2 users đã xác thực |
| Deploy time (Vercel) | ~45 giây |
| Bundle size | ~280KB gzip (Recharts ~150KB) |

---

## Known Issues & Pending

| Issue | Mức độ | Trạng thái |
|-------|--------|-----------|
| Supabase Site URL phải set đúng production URL | 🔴 Critical | ✅ Đã có fix guide |
| Free tier pause sau 1 tuần inactive | 🟡 Medium | ⏳ Chưa xử lý (nâng tier hoặc ping) |
| Không có offline fallback khi mất mạng | 🟡 Medium | ⏳ Roadmap v1.1 |
| Sidebar không nhớ collapse state | 🟢 Low | ⏳ Nice-to-have |
| Import JSON không validate schema chặt | 🟡 Medium | ⏳ Roadmap v1.1 |

---

## Lịch sử Deploy

| Version | Deploy | URL | Note |
|---------|--------|-----|------|
| v1.0.0 | 2026-08-25 | https://expense-buddy-app.vercel.app | MVP + Supabase |
| v0.9.0 | 2026-08-24 | *(preview URL)* | LocalStorage MVP |
