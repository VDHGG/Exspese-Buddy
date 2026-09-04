import { NextResponse } from 'next/server';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(Math.abs(amount)) + 'đ';
}

function formatDateTimeVN(dateStr) {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      isSmokeTest,
      transaction,
      monthlyBudget,
      totalExpense,
      botToken: customToken,
      chatId: customChatId,
    } = body;

    const botToken = (customToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const chatId = (customChatId || process.env.TELEGRAM_CHAT_ID || '').trim();

    if (!botToken || !chatId) {
      return NextResponse.json(
        { ok: false, error: 'Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID.' },
        { status: 400 }
      );
    }

    let text = '';

    if (isSmokeTest) {
      text = [
        '🤖 <b>JAVIS ĐÃ KẾT NỐI THÀNH CÔNG!</b>',
        '━━━━━━━━━━━━━━━━━━━━',
        'Chào cả nhà! Em là <b>JAVIS</b> — trợ lý thông báo chi tiêu gia đình.',
        'Từ bây giờ, mỗi khi phát sinh khoản thu/chi mới hoặc biến động ngân sách, em sẽ tự động báo vào đây để cả nhà cùng theo dõi nhé! ✨',
      ].join('\n');
    } else if (transaction) {
      const isExpense = transaction.type === 'expense';
      const typeLabel = isExpense ? '💸 <b>KHOẢN CHI MỚI</b>' : '💵 <b>KHOẢN THU MỚI</b>';
      const sign = isExpense ? '-' : '+';
      const amountStr = `${sign}${formatVND(transaction.amount)}`;
      const catName = escapeHtml(transaction.categoryName || transaction.category || 'Chung');
      const memberName = escapeHtml(transaction.memberName || transaction.member || 'Thành viên');
      const memberAvatar = transaction.memberAvatar || (isExpense ? '👤' : '💰');
      const note = escapeHtml(transaction.note || '');
      const timeStr = formatDateTimeVN(transaction.date);

      const lines = [
        typeLabel,
        '━━━━━━━━━━━━━━━━━━━━',
        `💰 <b>Số tiền:</b> <code>${amountStr}</code>`,
        `📂 <b>Hạng mục:</b> ${catName}`,
        `👤 <b>Thành viên:</b> ${memberAvatar} ${memberName}`,
      ];

      if (note) {
        lines.push(`📝 <b>Ghi chú:</b> ${note}`);
      }

      lines.push(`📅 <b>Thời gian:</b> ${timeStr}`);
      lines.push('━━━━━━━━━━━━━━━━━━━━');

      if (isExpense && monthlyBudget && monthlyBudget > 0) {
        const spent = totalExpense !== undefined ? totalExpense : transaction.amount;
        const percent = ((spent / monthlyBudget) * 100).toFixed(1);
        let budgetStatus = `📊 <b>Ngân sách tháng:</b> ${formatVND(spent)} / ${formatVND(monthlyBudget)} (${percent}%)`;
        if (percent >= 100) {
          budgetStatus += '\n⚠️ <i>Cảnh báo: Đã vượt 100% ngân sách tháng!</i>';
        } else if (percent >= 80) {
          budgetStatus += '\n⚡ <i>Lưu ý: Đã dùng hơn 80% ngân sách tháng.</i>';
        }
        lines.push(budgetStatus);
      } else if (!isExpense) {
        lines.push('🎉 <i>Thu nhập gia đình được tăng thêm!</i>');
      }

      text = lines.join('\n');
    } else {
      return NextResponse.json({ ok: false, error: 'Thiếu dữ liệu giao dịch hoặc cờ smoke test.' }, { status: 400 });
    }

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await telegramRes.json();
    if (!telegramRes.ok || !data.ok) {
      return NextResponse.json(
        { ok: false, error: data.description || 'Lỗi gửi tin nhắn Telegram.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, result: data.result });
  } catch (err) {
    console.error('Telegram notification error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
