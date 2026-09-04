import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, history = [], context = {} } = body;

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'Chưa cấu hình GEMINI_API_KEY trong hệ thống.' },
        { status: 400 }
      );
    }

    const {
      monthlyBudget = 0,
      stats = {},
      categories = { expense: [], income: [] },
      familyMembers = [],
    } = context;

    // Build context summary
    const memberSummary = (familyMembers || [])
      .map(m => `${m.name} (id: ${m.id}, avatar: ${m.avatar})`)
      .join(', ');

    const expenseCats = (categories?.expense || [])
      .map(c => `${c.name} (id: ${c.id})`)
      .join(', ');

    const incomeCats = (categories?.income || [])
      .map(c => `${c.name} (id: ${c.id})`)
      .join(', ');

    const recentSummary = (stats?.recent || [])
      .slice(0, 8)
      .map(t => `- ${t.type === 'expense' ? 'Chi' : 'Thu'} ${t.amount?.toLocaleString('vi-VN')}đ: ${t.note || t.category} (${t.member})`)
      .join('\n');

    const systemInstruction = `
Bạn là JAVIS (hoặc Buddy) — Trợ lý cố vấn tài chính gia đình thông minh, hóm hỉnh và tận tâm trong ứng dụng Expense Buddy.
Bạn giao tiếp bằng tiếng Việt tự nhiên, ấm áp, ngắn gọn, đi thẳng vào vấn đề. TUYỆT ĐỐI KHÔNG dùng văn phong máy móc rập khuôn (AI slop) như "Dưới đây là một số gợi ý...", "Chào bạn, tôi là một mô hình ngôn ngữ...".

DỮ LIỆU TÀI CHÍNH THÁNG NÀY CỦA GIA ĐÌNH:
- Ngân sách tháng: ${monthlyBudget?.toLocaleString('vi-VN')}đ
- Tổng thu nhập tháng: ${(stats?.totalIncome || 0)?.toLocaleString('vi-VN')}đ
- Tổng chi tiêu tháng: ${(stats?.totalExpense || 0)?.toLocaleString('vi-VN')}đ
- Số dư còn lại: ${(stats?.balance || 0)?.toLocaleString('vi-VN')}đ
- Tỷ lệ đã dùng: ${(stats?.budgetUsed || 0)?.toFixed(1)}% ngân sách
- Danh sách thành viên: ${memberSummary || 'Bố, Mẹ, Bé Bo, Quỹ chung'}
- Danh mục chi tiêu có sẵn: ${expenseCats}
- Danh mục thu nhập có sẵn: ${incomeCats}
- Giao dịch gần đây:
${recentSummary || 'Chưa có giao dịch'}

NHIỆM VỤ CỦA BẠN:
1. Giải đáp thắc mắc tài chính: Khi người dùng hỏi ai tiêu nhiều, khoản nào tốn nhất, còn bao nhiêu tiền... hãy dùng số liệu cụ thể ở trên để trả lời súc tích, dễ hiểu.
2. Gợi ý tiết kiệm: Đưa ra lời khuyên thực tế, gần gũi với nếp sống gia đình Việt Nam.
3. GHI CHÉP GIAO DỊCH NHANH:
   Khi người dùng có ý định ghi lại một khoản thu hoặc chi (ví dụ: "vừa đổ xăng 50k", "mẹ mua rau 45k", "bố nhận lương 25tr", "uống trà đá 10k"), hãy:
   - Viết lời nhắn ngắn gọn xác nhận một cách thân thiện.
   - KÈM THEO một khối JSON ở cuối tin nhắn theo đúng định dạng sau để ứng dụng tự động bóc tách:
   \`\`\`json
   {
     "action": "add_transaction",
     "data": {
       "type": "expense" | "income",
       "amount": 50000,
       "category": "<id danh mục khớp nhất trong danh sách có sẵn>",
       "member": "<id thành viên khớp nhất trong danh sách, nếu không rõ thì để bo hoặc me hoặc chung>",
       "note": "<mô tả ngắn gọn>"
     }
   }
   \`\`\`
   Chú ý: Số tiền phải là số nguyên (50k -> 50000, 2 củ -> 2000000, 1.5tr -> 1500000).
`;

    // Map history to Gemini format
    const contents = [];

    history.forEach(item => {
      contents.push({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.content }],
      });
    });

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
      signal: AbortSignal.timeout(15000),
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API error:', geminiData);
      return NextResponse.json(
        { ok: false, error: geminiData.error?.message || 'Lỗi kết nối Gemini API.' },
        { status: 500 }
      );
    }

    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse potential JSON action block
    let actionData = null;
    let cleanReply = candidateText;

    const jsonMatch = candidateText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.action === 'add_transaction') {
          actionData = parsed.transaction || parsed.data;
          cleanReply = candidateText.replace(/```(?:json)?[\s\S]*?```/, '').trim();
        }
      } catch (e) {
        // Ignore parse error, return text as is
      }
    } else {
      // Check for unquoted raw JSON block
      const rawJsonMatch = candidateText.match(/(\{\s*"action"\s*:\s*"add_transaction"[\s\S]*\})/);
      if (rawJsonMatch) {
        try {
          const parsed = JSON.parse(rawJsonMatch[1]);
          if (parsed.action === 'add_transaction') {
            actionData = parsed.transaction || parsed.data;
            cleanReply = candidateText.replace(rawJsonMatch[1], '').trim();
          }
        } catch (e) {
          // ignore
        }
      }
    }

    return NextResponse.json({
      ok: true,
      reply: cleanReply,
      actionData,
    });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
