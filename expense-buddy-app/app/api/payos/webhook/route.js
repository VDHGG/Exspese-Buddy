import { NextResponse } from 'next/server';
import payos from '@/app/lib/payos';
import { supabase } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// In-memory cache for paid orderCodes (supports instant polling status on client)
globalThis.paidOrders = globalThis.paidOrders || new Set();

async function sendTelegramAlert(amount, note, orderCode) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  const text = [
    '🔔 <b>TING TING! NẠP QUỸ THÀNH CÔNG</b>',
    '━━━━━━━━━━━━━━━━━━━━',
    `💰 <b>Số tiền:</b> +${formattedAmount}`,
    `🏷️ <b>Hạng mục:</b> Quỹ chung gia đình`,
    `💳 <b>Cổng thanh toán:</b> payOS (VietQR 24/7)`,
    `📝 <b>Ghi chú:</b> ${note || `Đơn hàng #${orderCode}`}`,
    `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
    '━━━━━━━━━━━━━━━━━━━━',
    '✨ <i>Giao dịch đã được ghi nhận tự động vào Expense Buddy!</i>'
  ].join('\n');

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    })
  }).catch(err => console.error('Telegram notification error:', err.message));
}

export async function POST(req) {
  try {
    if (!payos) {
      return NextResponse.json(
        { error: 'payOS chưa được cấu hình.' },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Verify webhook data signature from payOS using v2 SDK
    let webhookData;
    try {
      webhookData = await payos.webhooks.verify(body);
    } catch (verifyErr) {
      console.error('payOS Webhook signature verification failed:', verifyErr.message);
      return NextResponse.json(
        { error: 'Chữ ký Webhook không hợp lệ.' },
        { status: 400 }
      );
    }

    console.log('✅ payOS Webhook verified successfully:', webhookData);

    const { orderCode, amount, description } = webhookData;

    // Record order as paid in memory for instant client polling
    globalThis.paidOrders.add(Number(orderCode));

    // 1. Insert into Supabase transactions table
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const dbClient = serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
      : supabase;

    const note = description || `Nạp tiền qua payOS #${orderCode}`;

    if (dbClient) {
      // First try calling the RPC function (runs with SECURITY DEFINER to bypass RLS)
      const { error: rpcError } = await dbClient.rpc('record_payos_payment', {
        p_amount: amount,
        p_note: note,
      });

      if (rpcError) {
        console.warn('RPC record_payos_payment failed, falling back to direct insert:', rpcError.message);
        // Fallback: direct insert (will succeed if service role key is provided or policy allows)
        const { error: insertError } = await dbClient.from('transactions').insert({
          type: 'income',
          amount: amount,
          category: 'Quỹ chung',
          member: 'Quỹ chung',
          note: note,
          occurred_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Failed direct insert into Supabase:', insertError.message);
        } else {
          console.log('✅ Direct insert transaction into Supabase succeeded');
        }
      } else {
        console.log('✅ Successfully recorded transaction via RPC record_payos_payment');
      }
    }

    // 2. Trigger Telegram notification
    try {
      await sendTelegramAlert(amount, note, orderCode);
    } catch (tgErr) {
      console.error('Telegram notification error:', tgErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderCode,
    });
  } catch (error) {
    console.error('Error processing payOS webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi xử lý webhook' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if an orderCode has been paid (instant client polling fallback)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderCode = searchParams.get('orderCode');

  if (!orderCode) {
    return NextResponse.json({ error: 'Missing orderCode' }, { status: 400 });
  }

  const isPaid = globalThis.paidOrders?.has(Number(orderCode)) || false;
  return NextResponse.json({ orderCode: Number(orderCode), isPaid });
}
