# 🗺️ Development Plan
# Expense Buddy — Lộ trình phát triển

> **Hiện tại:** v1.0.0 MVP — Supabase Auth + CRUD + Charts
> **Nguyên tắc:** Mỗi phase phải ship-able, testable, và không break tính năng cũ

---

## Tổng quan Roadmap

```
v1.0  ████████████████████ Done    — MVP: Auth, CRUD, Charts, Cloud sync
v1.1  ░░░░░░░░░░░░░░░░░░░░ Planned — Stability & UX Polish
v1.2  ░░░░░░░░░░░░░░░░░░░░ Planned — Multi-month Analysis
v2.0  ░░░░░░░░░░░░░░░░░░░░ Future  — Family Sharing & Smart Features
v3.0  ░░░░░░░░░░░░░░░░░░░░ Vision  — Open Banking & Mobile
```

---

## Phase v1.1 — Stability & UX Polish
> **Mục tiêu:** Ổn định, không lỗi, trải nghiệm mượt hơn
> **Ưu tiên:** Cao | **Estimated:** 1–2 tuần

### 1.1.1 Auth & Sync Improvements
- [ ] **Toast notification system** — thay thế `{status && <p>}` bằng toast đẹp (top-right, auto-dismiss 3s)
  - Success toast: xanh emerald
  - Error toast: đỏ với retry button
  - Sync toast: "Đang lưu..." spinner
- [ ] **Offline detection** — detect khi mất internet, show banner "Không có kết nối. Thay đổi sẽ được lưu khi có mạng."
- [ ] **Session refresh** — auto-refresh Supabase token trước khi expire (hiện tại nếu tab mở quá lâu, session có thể expire)
- [ ] **Redirect URL validation** — kiểm tra `window.location.origin` có trong Supabase whitelist hay không, warn user nếu không
- [ ] **Email whitelist hint** — nếu domain email là tổ chức (@mindx.edu.vn), hiển thị hint "Kiểm tra thư mục Spam nếu chưa nhận được link"

### 1.1.2 Form Improvements
- [ ] **Smart number input** — nhập `1.5tr` → auto-convert thành `1500000`, nhập `50k` → `50000`
- [ ] **Recent notes autocomplete** — gợi ý note dựa trên lịch sử nhập của cùng category
  - Ví dụ: nhập category "Ăn uống" → gợi ý "Cà phê sáng", "Ăn trưa"
  - Source: `localStorage` cache 20 note gần nhất
- [ ] **Duplicate transaction warning** — nếu amount + category + date trùng với giao dịch trong 24h gần nhất → hỏi "Bạn có muốn thêm giao dịch tương tự không?"
- [ ] **Keyboard shortcuts** — `N` = mở form thêm giao dịch, `Esc` = đóng form/modal, `Enter` = submit

### 1.1.3 Data & Validation
- [ ] **Import JSON schema validation** — validate file import có đúng format trước khi insert
  ```js
  // Validate mỗi transaction: type, amount > 0, category valid, member valid, occurred_at parsable
  ```
- [ ] **Amount limits** — warning nếu amount > 500 triệu (likely typo), confirm trước khi save
- [ ] **Soft delete** — thêm cột `deleted_at` vào `transactions`, ẩn thay vì xoá hard → cho phép undo trong 5 giây
- [ ] **Supabase keep-alive** — ping endpoint mỗi 6 ngày để tránh free tier pause

### 1.1.4 UI Polish
- [ ] **Loading skeleton** — thay spinner bằng skeleton cards trong lúc fetch data
- [ ] **Empty state illustrations** — khi chưa có giao dịch, hiển thị illustration + CTA "Thêm giao dịch đầu tiên"
- [ ] **Sidebar collapse** — thêm nút collapse sidebar trên desktop (48px icon-only mode)
- [ ] **Transaction hover card** — hover vào transaction row hiện quick-view popup (amount, category, member, note đầy đủ)
- [ ] **Page transitions** — fade-in khi switch view (CSS `@keyframes fadeIn`)

---

## Phase v1.2 — Multi-month Analysis
> **Mục tiêu:** Phân tích xu hướng theo thời gian, không chỉ trong tháng hiện tại
> **Ưu tiên:** Trung bình | **Estimated:** 2–3 tuần

### 1.2.1 Month Picker
- [ ] **Tháng selector** trên Dashboard và Charts view
  - Previous/Next month navigation
  - Month/Year dropdown picker
  - "Tháng này" quick-reset button
- [ ] **Data caching by month** — cache query kết quả theo key `{userId}-{year}-{month}` trong `sessionStorage`

### 1.2.2 Trend Charts
- [ ] **Line Chart: Thu nhập vs Chi tiêu theo 6 tháng**
  - Recharts `LineChart` với 2 lines (income=emerald, expense=red)
  - X-axis: Tháng/Năm, Y-axis: Triệu VND
  - Tooltip: Show cả income và expense của tháng đó
- [ ] **Area Chart: Số dư tích lũy**
  - Hiển thị balance cộng dồn theo từng tháng
  - Positive area: emerald, Negative area: red
- [ ] **Bar Chart: So sánh danh mục** — stacked bar so sánh 3 tháng gần nhất

### 1.2.3 Budget Tracking Improvements
- [ ] **Budget per category** — đặt ngân sách riêng cho từng danh mục (e.g. Ăn uống: 5tr, Học phí: 6tr)
  - New table `category_budgets(user_id, category, monthly_limit, updated_at)`
  - Progress bar per category trên Settings
- [ ] **Budget history** — lưu lại budget của từng tháng để so sánh
- [ ] **Overspend breakdown** — khi vượt budget, hiển thị chi tiết danh mục nào gây ra

### 1.2.4 Advanced Reporting
- [ ] **Monthly summary card** — card tóm tắt cuối tháng: tổng thu, tổng chi, tiết kiệm được bao nhiêu
- [ ] **Year-to-date stats** — tổng từ đầu năm đến hiện tại
- [ ] **Export to CSV** — xuất dữ liệu ra CSV để mở bằng Excel
  - Format: Date, Type, Category, Member, Amount, Note
- [ ] **Export monthly PDF report** — sử dụng `window.print()` + print CSS để xuất báo cáo tháng

---

## Phase v2.0 — Family Sharing & Smart Features
> **Mục tiêu:** Cho phép nhiều thành viên cùng đăng nhập và chia sẻ 1 "sổ gia đình"
> **Ưu tiên:** Cao (business value) | **Estimated:** 4–6 tuần | **Requires:** Schema redesign

### 2.0.1 Family Accounts (Shared Ledger)

**Architecture thay đổi:**
```sql
-- Thêm bảng families
CREATE TABLE families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,           -- "Gia đình Nguyễn"
  created_by uuid REFERENCES auth.users(id),
  invite_code text UNIQUE,      -- 6-char code để invite
  created_at timestamptz DEFAULT now()
);

-- Thêm bảng family_members
CREATE TABLE family_members (
  family_id uuid REFERENCES families(id),
  user_id uuid REFERENCES auth.users(id),
  display_name text,            -- "Bố", "Mẹ", tùy user đặt
  role text DEFAULT 'member',   -- 'owner' | 'member'
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (family_id, user_id)
);

-- transactions và budgets thêm family_id
ALTER TABLE transactions ADD COLUMN family_id uuid REFERENCES families(id);
ALTER TABLE budgets ADD COLUMN family_id uuid REFERENCES families(id);
```

**Features:**
- [ ] **Tạo gia đình** — User đầu tiên tạo "Gia đình" với tên + invite code
- [ ] **Invite thành viên** — Share invite code (6 ký tự) cho người thân
- [ ] **Join gia đình** — Nhập invite code để vào chung sổ
- [ ] **Role: Owner** — Có thể xoá thành viên, reset data, thay đổi budget
- [ ] **Role: Member** — Thêm/xem giao dịch, không xoá của người khác
- [ ] **Activity feed** — Realtime feed "Mẹ vừa thêm: Đi chợ 850,000đ" (Supabase Realtime)

### 2.0.2 Smart Buddy AI (Upgraded)
- [ ] **Spending pattern detection** — "Tuần này gia đình chi ăn uống nhiều hơn 30% so với tuần trước"
- [ ] **Anomaly detection** — Cảnh báo giao dịch bất thường (outlier > 2 std deviation)
- [ ] **Saving goal** — Đặt mục tiêu tiết kiệm (VD: mua xe 200tr trong 12 tháng), track progress
  - Table `saving_goals(id, family_id, name, target_amount, current_amount, deadline)`
- [ ] **Monthly prediction** — Dự đoán tổng chi tháng này dựa trên trend 3 tháng qua
- [ ] **Smart categories** — Tự động suggest category dựa trên keyword trong note

### 2.0.3 Recurring Transactions
- [ ] **Định kỳ tự động** — Lương, tiền điện, học phí → tự tạo giao dịch theo lịch
  - Table `recurring_transactions(id, user_id, family_id, ...fields, frequency, next_due_at)`
  - Frequencies: daily | weekly | monthly | yearly
  - Vercel Cron Job (hoặc Supabase Edge Function) để tạo giao dịch đúng hạn
- [ ] **Reminder notification** — Email reminder khi có recurring sắp đến hạn

### 2.0.4 Notifications
- [ ] **Email digest** — Gửi email tóm tắt chi tiêu cuối tuần (Supabase Edge Function + Resend)
- [ ] **Budget alert email** — Email cảnh báo khi đã dùng 80% ngân sách
- [ ] **Web Push** — Progressive Web App, push notification trên mobile/desktop

---

## Phase v3.0 — Open Banking & Mobile
> **Mục tiêu:** Kết nối tự động với ngân hàng, ra mắt app mobile
> **Ưu tiên:** Future | **Estimated:** 3–6 tháng

### 3.0.1 Open Banking Integration
- [ ] **Vietcombank, Techcombank API** (khi Open Banking API được phép ở Việt Nam)
- [ ] **SMS/Email parsing** — Tự parse SMS báo số dư thành giao dịch
- [ ] **QR Code payment import** — Scan QR thanh toán → auto-create transaction

### 3.0.2 Mobile App
- [ ] **Progressive Web App (PWA)** — Bước 1 nhẹ nhàng: add to home screen, offline cache
  - `manifest.json` + Service Worker
  - Offline read (cache transactions), online sync khi có mạng
- [ ] **React Native app** — v3.1, sau khi PWA validated
  - Shared business logic với web (data.js, supabase.js tái dùng)
  - Native camera để scan receipt/QR
  - FaceID/TouchID authentication

### 3.0.3 Advanced AI
- [ ] **LLM-powered insights** — Tích hợp Gemini API để đưa ra phân tích ngôn ngữ tự nhiên
  - "Tháng này gia đình bạn chi ăn uống 8.5 triệu, cao hơn 20% so với trung bình 3 tháng qua. Nguyên nhân chính là các khoản ăn nhà hàng tăng gấp đôi vào cuối tuần."
- [ ] **Receipt OCR** — Scan hóa đơn → tự extract amount, category, date

---

## Technical Debt Backlog

Các vấn đề kỹ thuật cần giải quyết:

| Priority | Item | File | Mô tả |
|----------|------|------|-------|
| 🔴 High | Supabase Site URL config | Dashboard config | Phải set production URL, không để localhost |
| 🟠 Medium | Recharts bundle size | `package.json` | ~150KB gzip — cân nhắc lazy-load hoặc dùng Chart.js nhẹ hơn |
| 🟠 Medium | Error boundary | `page.js` | Chưa có React Error Boundary — lỗi render sẽ crash toàn app |
| 🟠 Medium | Loading skeleton | Tất cả views | Hiện dùng spinner đơn giản — nên có skeleton per component |
| 🟡 Low | `useExpenseData` size | `useExpenseData.js` | File 166 dòng đang làm nhiều việc — nên tách thành `useAuth` + `useTransactions` + `useBudget` |
| 🟡 Low | No test coverage | Global | Chưa có bất kỳ unit test nào |
| 🟡 Low | No ESLint config | Root | Next.js default ESLint nhưng chưa có custom rules |
| 🟢 Low | `generateId()` không dùng | `data.js` | Hàm còn đó nhưng Supabase tự gen uuid |

---

## Development Guidelines khi thêm tính năng mới

1. **Kiểm tra SOT trước:** Đọc `project-overview-prd.md` và `design-guidelines.md` trước khi code
2. **Luôn cập nhật `progress.md`** sau khi hoàn thành một task
3. **Không hardcode** — mọi màu, spacing, fontSize phải dùng CSS Custom Properties
4. **Test trên mobile trước** — App ưu tiên mobile-first
5. **Timezone safe** — Mọi date operation phải dùng `TIMEZONE = 'Asia/Ho_Chi_Minh'`
6. **Optimistic UI** — Cập nhật local state ngay khi user action, đồng thời gọi Supabase async; rollback nếu lỗi
7. **Error handling** — Mọi Supabase call phải handle error và hiển thị message thân thiện bằng tiếng Việt

---

## Stack Upgrade Consideration

| Hiện tại | Cân nhắc nâng lên | Lý do |
|----------|-----------------|-------|
| `@supabase/supabase-js ^2.112.3` | Luôn latest | Security patches |
| `next 16.3.2` | `next@latest` khi stable | App Router improvements |
| `recharts ^3.10.1` | Lazy import | Giảm bundle size |
| CSS Modules | Giữ nguyên | Phù hợp scale hiện tại |
| No test | `vitest` + `@testing-library/react` | Khi codebase lớn hơn |
| No CI/CD checks | GitHub Actions | Lint + type check trước merge |
