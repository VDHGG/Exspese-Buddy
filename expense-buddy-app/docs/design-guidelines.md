# 🎨 Design Guidelines
# Expense Buddy — Vietnamese Warm Family Design System

> **Triết lý:** Ấm cúng như ngôi nhà Việt, hiện đại như ứng dụng thế giới.
> Font: **Be Vietnam Pro** · Theme: **Wood & Emerald** · Approach: **CSS Modules + Design Tokens**

---

## 1. Design Philosophy

Expense Buddy lấy cảm hứng từ **phong cách nội thất Việt Nam truyền thống** — gỗ ấm, mộc mạc nhưng tinh tế — kết hợp với **UI hiện đại** của các fintech app hàng đầu (Money Lover, Misa Money Keeper).

**3 nguyên tắc cốt lõi:**

| Nguyên tắc | Diễn giải |
|-----------|-----------|
| **Warm & Familiar** | Màu gỗ ấm áp, typography dễ đọc, icon quen thuộc |
| **Clear & Trustworthy** | Số liệu tài chính phải rõ ràng, không gây nhầm lẫn |
| **Delightful & Alive** | Animation mượt, hover effect tinh tế, micro-interaction |

---

## 2. Color Palette

Toàn bộ màu được định nghĩa qua CSS Custom Properties trong `globals.css`.

### 2.1 Wood & Earth (Primary Palette)

```css
--color-wood-50:  #FFF8F0;  /* Background chính của app */
--color-wood-100: #F5EBD9;  /* Border nhẹ, card hover */
--color-wood-200: #E8D5B8;  /* Border medium, dividers */
--color-wood-300: #D4B896;  /* Decorative accents */
--color-wood-400: #B89768;  /* Text muted/placeholder */
--color-wood-500: #9A7B4F;  /* Text secondary */
--color-wood-600: #7D6340;  /* Text labels, axis labels */
--color-wood-700: #5C4A30;  /* Text đậm hơn */
--color-wood-800: #3D3220;  /* Sidebar background */
--color-wood-900: #2A1F14;  /* Text primary (headings) */
```

> **Wood Accent Bar:** Đường viền mỏng `4px` màu gradient gỗ ở top-left card — signature visual của Expense Buddy.

### 2.2 Emerald (Success / Income)

```css
--color-emerald-500: #10B981;  /* Icon thu nhập, nút primary */
--color-emerald-600: #059669;  /* Hover state */
--color-emerald-700: #047857;  /* Active/pressed state */
```

### 2.3 Red (Danger / Expense)

```css
--color-red-500:  #F43F5E;  /* Số chi tiêu, badge warning */
--color-red-600:  #E11D48;  /* Nút danger */
```

### 2.4 Indigo (Balance / Neutral)

```css
--color-indigo-500: #8B5CF6;  /* Card số dư, accent phụ */
--color-indigo-600: #7C3AED;  /* Màu của thành viên "Bố" */
```

### 2.5 Amber (Warning / Budget)

```css
--color-amber-500: #F59E0B;  /* Màu cảnh báo, icon Insights */
--color-amber-400: #FBBF24;  /* Màu thành viên "Bé Bo" */
```

### 2.6 Semantic Color Mappings

```css
--bg-primary:   var(--color-wood-50);    /* Nền toàn app */
--bg-card:      #FFFFFF;                  /* Nền card */
--bg-sidebar:   var(--color-wood-800);   /* Sidebar tối ấm */
--text-primary: var(--color-wood-900);   /* Text chính */
--text-secondary: var(--color-wood-600); /* Text phụ */
--accent-income:  var(--color-emerald-500);  /* Thu nhập */
--accent-expense: var(--color-red-500);      /* Chi tiêu */
--accent-balance: var(--color-indigo-500);   /* Số dư */
```

---

## 3. Typography

### Font Family
**Be Vietnam Pro** — Google Font, tối ưu cho Tiếng Việt với đầy đủ dấu thanh.

```css
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');

font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
```

### Type Scale

| Class/Usage | Size | Weight | Color |
|-------------|------|--------|-------|
| App title (sidebar) | 16px / 1rem | 700 | White |
| Page heading h1 | 22–24px | 700 | `--text-primary` |
| Card heading h2 | 18–20px | 600 | `--text-primary` |
| Section heading h3 | 15–16px | 600 | `--text-primary` |
| Body text | 14px | 400 | `--text-primary` |
| Label / caption | 12–13px | 500 | `--text-secondary` |
| Muted / hint | 12px | 400 | `--text-muted` |
| KPI large number | 26–28px | 700 | Semantic color |

### Số tiền tài chính
Luôn dùng `formatCurrency()` từ `data.js`:
```js
new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
// Output: "1.500.000đ"
```

---

## 4. Spacing System

```css
--space-xs:  4px;
--space-sm:  8px;
--space-md:  16px;
--space-lg:  24px;
--space-xl:  32px;
--space-2xl: 48px;
```

**Quy tắc:**
- Padding card: `--space-lg` (24px)
- Gap giữa cards: `--space-md` (16px)
- Padding sidebar: `--space-md` top/bottom, `--space-lg` left/right
- Form inputs: `12px` vertical, `--space-md` horizontal

---

## 5. Border Radius

```css
--radius-sm:   8px;   /* Badges, tags nhỏ */
--radius-md:   12px;  /* Input fields, buttons */
--radius-lg:   16px;  /* Cards chuẩn */
--radius-xl:   20px;  /* Modal, large cards */
--radius-2xl:  24px;  /* Feature cards lớn */
--radius-full: 9999px;/* Pills, avatar circles */
```

**Card chuẩn:** `border-radius: var(--radius-lg)` (16px)

---

## 6. Shadow System

```css
--shadow-sm:   0 1px 3px rgba(61,50,32,0.06), 0 1px 2px rgba(61,50,32,0.04);
--shadow-md:   0 4px 12px rgba(61,50,32,0.08), 0 2px 4px rgba(61,50,32,0.04);
--shadow-lg:   0 10px 30px rgba(61,50,32,0.10), 0 4px 8px rgba(61,50,32,0.05);
--shadow-card: 0 2px 8px rgba(61,50,32,0.06);
--shadow-card-hover: 0 8px 24px rgba(61,50,32,0.12);
```

> Shadow dùng màu `rgba(61,50,32, ...)` — tông nâu gỗ ấm, không phải đen xám thông thường. Tạo cảm giác đặc trưng Việt.

---

## 7. Component Patterns

### 7.1 Card (`.card`)
Component cơ bản nhất của app, defined trong `globals.css`:
```css
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
  padding: var(--space-lg);
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}
.card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-1px);
}
```

### 7.2 Wood Accent Bar
Đặc trưng thị giác của mỗi feature card:
```css
.woodAccent {
  position: absolute;
  top: 0; left: 0;
  width: 4px; height: 100%;
  background: linear-gradient(to bottom, #D4B896, #B89768);
  border-radius: 4px 0 0 4px;
}
```
Dùng trong: `Charts.js`, `BuddyInsights.js`, `KpiCards.js`

### 7.3 Buttons

```css
/* Primary — Emerald */
.btn-primary {
  background: linear-gradient(135deg, var(--color-emerald-500), var(--color-emerald-600));
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-md);
}

/* Ghost — Transparent */
.btn-ghost {
  background: transparent;
  border: 1.5px solid var(--border-medium);
  color: var(--text-secondary);
}

/* Danger — Red */
.btn-danger {
  background: linear-gradient(135deg, var(--color-red-500), var(--color-red-600));
  color: white;
}
```

### 7.4 Form Inputs (`.input`)
```css
.input {
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-family: inherit;
  background: white;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.input:focus {
  border-color: var(--color-emerald-500);
  box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
  outline: none;
}
```

### 7.5 Sidebar
- Background: `--color-wood-800` (#3D3220) — nâu gỗ tối
- Active nav item: Emerald highlight với left border `3px solid emerald`
- Family member avatars: Emoji circles ở dưới nav
- Footer: Sync status dot + email + sign out button
- Mobile: Slide-in overlay từ trái, toggle bằng hamburger icon

---

## 8. Member Color System

Mỗi thành viên có màu riêng — dùng nhất quán trong Charts, TransactionList, Badges:

| Thành viên | Emoji | Color | Hex |
|-----------|-------|-------|-----|
| Bố | 👨 | Indigo | `#7C3AED` |
| Mẹ | 👩 | Rose | `#E11D48` |
| Bé Bo | 👦 | Amber | `#F59E0B` |
| Quỹ chung | 🏠 | Emerald | `#059669` |

---

## 9. Category Icon & Color System

Defined in `data.js → CATEGORIES`:

**Chi tiêu (expense):**
| Danh mục | Icon (Lucide) | Color |
|---------|--------------|-------|
| Ăn uống | UtensilsCrossed | `#F97316` Orange |
| Đi chợ | ShoppingCart | `#10B981` Emerald |
| Điện nước | Zap | `#FBBF24` Yellow |
| Học phí | GraduationCap | `#8B5CF6` Violet |
| Y tế | Heart | `#EF4444` Red |
| Di chuyển | Car | `#3B82F6` Blue |
| Mua sắm | ShoppingBag | `#EC4899` Pink |
| Giải trí | Gamepad2 | `#06B6D4` Cyan |
| Khác | MoreHorizontal | `#6B7280` Gray |

---

## 10. Animation & Transitions

```css
--transition-fast: 150ms ease;   /* Hover state, color changes */
--transition-base: 250ms ease;   /* Most interactive elements */
--transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1); /* Page transitions, modals */
```

**Recharts animations:**
- `animationBegin: 200`, `animationDuration: 800` — cảm giác "load và reveal" tự nhiên

**Micro-interactions:**
- Card hover: `translateY(-1px)` + shadow tăng
- Nav item: `translateX(2px)` khi active
- Button: `scale(0.97)` khi click
- Input focus: Green glow `rgba(16,185,129,0.12)`

---

## 11. Responsive Layout

### Breakpoints
```css
/* Mobile first */
@media (max-width: 768px)  { /* Tablet/Mobile */ }
@media (max-width: 480px)  { /* Small mobile */ }
```

### Layout Strategy
- **Desktop (> 768px):** Sidebar cố định 240px bên trái + main content scroll
- **Mobile (≤ 768px):** Sidebar ẩn hoàn toàn, hiện qua hamburger menu với overlay
- **KPI Cards:** Grid 4 cột desktop → 2 cột tablet → 1 cột mobile
- **Charts:** Grid 2 cột → 1 cột trên mobile

---

## 12. Icon Library

**Lucide React** `^1.34.0` — icon library chính:

| Icon | Nơi dùng |
|------|---------|
| `Home` | Nav: Tổng quan |
| `PlusCircle` | Nav: Thêm giao dịch |
| `BarChart3` | Nav: Biểu đồ |
| `List` | Nav: Lịch sử |
| `Settings` | Nav: Cài đặt |
| `Cloud` | AuthGate header |
| `Mail` | AuthGate input |
| `LogOut` | Sidebar footer |
| `Lightbulb` | BuddyInsights header |
| `Target` | Settings: Budget |
| `Download` | Settings: Export |
| `Upload` | Settings: Import |
| `RefreshCw` | Settings: Reset |
| `AlertTriangle` | Settings: Danger zone |
| `Menu` / `X` | Mobile toggle |
| `TrendingUp` / `TrendingDown` | KPI cards |
| `Wallet` / `Banknote` | Transaction type |

---

## 13. Do & Don't

### ✅ DO
- Dùng CSS Custom Properties cho mọi màu sắc — không hardcode hex trong component
- Dùng `formatCurrency()` cho mọi số tiền hiển thị
- Dùng `formatDate()` / `formatFullDate()` với timezone `Asia/Ho_Chi_Minh`
- Giữ card padding nhất quán `var(--space-lg)`
- Dùng `transition` cho mọi interactive element
- Dùng semantic class (`btn-primary`, `btn-danger`, `input`) thay vì inline style

### ❌ DON'T
- Không dùng Tailwind CSS — dự án này là Vanilla CSS Modules
- Không hardcode màu hex trong JSX/module.css (dùng CSS vars)
- Không dùng dark mode toggle — app chỉ có light mode warm
- Không dùng `px` cho font size trong media query (dùng `rem`)
- Không bỏ `transition` trên hover state
- Không hiển thị số tiền raw (1500000) — luôn format VND
