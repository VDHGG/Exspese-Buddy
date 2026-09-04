import { NextResponse } from 'next/server';
import payos from '@/app/lib/payos';

export async function POST(req) {
  try {
    if (!payos) {
      return NextResponse.json(
        { error: 'payOS chưa được cấu hình Client ID / API Key / Checksum Key.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { amount, member = 'Quỹ chung' } = body;

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount < 1000) {
      return NextResponse.json(
        { error: 'Số tiền tối thiểu là 1.000đ.' },
        { status: 400 }
      );
    }

    // Generate unique orderCode (timestamp in seconds + 2 random digits, safe integer)
    const orderCode = Math.floor(Date.now() / 1000) * 100 + Math.floor(Math.random() * 100);

    // payOS requires description <= 25 characters
    const description = `Nap quy #${orderCode}`.slice(0, 25);

    // Base origin for return/cancel URLs
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    const paymentLinkData = {
      orderCode,
      amount: parsedAmount,
      description,
      returnUrl: `${origin}`,
      cancelUrl: `${origin}`,
    };

    const paymentLinkResponse = await payos.paymentRequests.create(paymentLinkData);

    return NextResponse.json({
      success: true,
      data: {
        orderCode,
        amount: parsedAmount,
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        qrCode: paymentLinkResponse.qrCode,
        paymentLinkId: paymentLinkResponse.paymentLinkId,
        description,
        member,
      },
    });
  } catch (error) {
    console.error('Error creating payOS payment link:', error);
    return NextResponse.json(
      { error: error.message || 'Không thể tạo link thanh toán payOS.' },
      { status: 500 }
    );
  }
}
