import './globals.css';

export const metadata = {
  title: 'Expense Buddy — Quản lý Thu Chi Gia Đình',
  description: 'Ứng dụng quản lý thu chi gia đình thông minh, dễ dùng. Theo dõi chi tiêu, ngân sách và phân tích tài chính cho cả nhà.',
  keywords: 'quản lý chi tiêu, thu chi gia đình, expense tracker, ngân sách gia đình',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFF8F0" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💰</text></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
