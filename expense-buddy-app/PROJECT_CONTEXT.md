# Expense Buddy — Project Context

## Mục tiêu

Ứng dụng quản lý thu chi gia đình bằng tiếng Việt, thiết kế hiện đại, đồng bộ tức thì trên đám mây (Supabase), tích hợp thông báo tự động qua Telegram (Bot JAVIS) và trợ lý tài chính AI thông minh (Google Gemini 2.5 Flash).

## Công nghệ chính

- **Frontend**: Next.js 16 (App Router), React 19, JavaScript, CSS Modules, Lucide React (icons), Recharts (biểu đồ).
- **Backend / Database**: Supabase Postgres + Supabase Auth (email magic link/OTP) + Row Level Security (RLS).
- **Notifications**: Telegram Bot API (`/api/telegram/notify`) với bot JAVIS (`@Javisreport_bot`), thông báo định dạng HTML đẹp mắt, tự động gửi vào nhóm gia đình.
- **AI Assistant**: Google Gemini 2.5 Flash API (`/api/chat` + `FloatingChatWidget`), hỗ trợ tư vấn tài chính, phân tích chi tiêu và tự động bóc tách giao dịch từ câu nói tự nhiên (NLP).

## Kiến trúc dữ liệu

1. **`app/lib/useExpenseData.js`**:
   - Quản lý toàn bộ state tập trung của ứng dụng (CRUD giao dịch, ngân sách, danh mục, thành viên).
   - Đọc/ghi đồng bộ với Supabase khi user đăng nhập, có cơ chế fallback mượt mà sang `localStorage` khi offline hoặc chưa tạo bảng mới.
2. **Các bảng dữ liệu trong Supabase**:
   - `transactions`: Lưu giao dịch thu/chi (`id`, `user_id`, `type`, `amount`, `category`, `member`, `note`, `occurred_at`). Hỗ trợ đầy đủ Thêm, Sửa (Edit), Xóa.
   - `budgets`: Ngân sách tháng (`user_id`, `monthly_budget`, `updated_at`).
   - `user_settings`: Tùy biến danh mục (`categories` JSONB) và thành viên gia đình (`family_members` JSONB). Luôn upsert đồng thời cả 2 trường để tránh mất dữ liệu.
3. **Telegram Notification Pipeline**:
   - Khi thêm hoặc sửa giao dịch, hook `useExpenseData` gửi POST request bất đồng bộ tới `/api/telegram/notify`.
   - Endpoint server-side bảo mật `TELEGRAM_BOT_TOKEN` và gửi tin nhắn HTML trực quan tới nhóm gia đình, kèm timeout và error handling không làm ảnh hưởng luồng UI.
4. **Gemini Chatbot Pipeline**:
   - Widget chat nổi `FloatingChatWidget` gửi context dữ liệu tóm tắt (thu, chi, số dư, ngân sách, danh mục, thành viên) tới `/api/chat`.
   - Model Gemini 2.5 Flash phân tích và trả về câu trả lời tự nhiên, hoặc cấu trúc JSON hành động `{ "action": "add_transaction", ... }`.
   - Client có bộ fuzzy matching thông minh (`resolveCategory`, `resolveMember`) để ánh xạ chính xác vào danh mục và thành viên thực tế.

## Quy ước quan trọng

- **Bảo mật**: Biến môi trường public (`NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`) dùng ở client. Các secret (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GEMINI_API_KEY`) chỉ truy cập ở server route (`/api/*`).
- **Timezone**: Luôn chuẩn hóa ngày giờ theo múi giờ Việt Nam `Asia/Ho_Chi_Minh` (`+07:00`) để tránh lệch ngày/tháng ở biên múi giờ UTC.
- **Data Safety**: Luôn cung cấp đầy đủ cả `categories` và `family_members` khi upsert vào `user_settings`.
- **Thông báo thân thiện**: Không spam, định dạng HTML rõ ràng với icon và badge phân loại, không chứa từ ngữ AI sáo rỗng (no AI slop).

## Kiểm tra trước khi bàn giao

1. `pnpm run build` chạy thành công, không có lỗi syntax hoặc type error.
2. Đăng nhập qua email magic link, thêm/sửa/xóa giao dịch, chỉnh sửa ngân sách và kiểm tra dữ liệu duy trì sau khi reload.
3. Kiểm tra thông báo Telegram gửi về nhóm thành công với giao dịch mới.
4. Kiểm tra Chatbot Gemini trả lời chuẩn xác và hỗ trợ thêm giao dịch qua lệnh chat (ví dụ: "vừa đổ xăng 50k bố").
5. Kiểm tra tùy chỉnh danh mục và thành viên trong tab Cài đặt hoạt động ổn định.
