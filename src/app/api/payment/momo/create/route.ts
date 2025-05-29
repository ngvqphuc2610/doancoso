import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// MoMo configuration - In production, these should be environment variables
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO_PARTNER_CODE',
  accessKey: process.env.MOMO_ACCESS_KEY || 'MOMO_ACCESS_KEY',
  secretKey: process.env.MOMO_SECRET_KEY || 'MOMO_SECRET_KEY',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      orderId,
      amount,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType = 'captureWallet'
    } = body;

    // Validate required fields
    if (!orderId || !amount || !orderInfo) {
      return NextResponse.json(
        { resultCode: 1, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const requestId = orderId + new Date().getTime();
    const partnerCode = MOMO_CONFIG.partnerCode;
    const accessKey = MOMO_CONFIG.accessKey;
    const secretKey = MOMO_CONFIG.secretKey;

    // Create signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // Prepare request body for MoMo
    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi'
    };

    // For demo purposes, we'll simulate MoMo response
    // In production, you would make actual API call to MoMo
    if (process.env.NODE_ENV === 'development') {
      // Simulate MoMo response for development
      const mockResponse = {
        partnerCode,
        orderId,
        requestId,
        amount,
        responseTime: new Date().getTime(),
        message: 'Successful.',
        resultCode: 0,
        payUrl: `https://test-payment.momo.vn/v2/gateway/pay?t=${Buffer.from(JSON.stringify(requestBody)).toString('base64')}`,
        deeplink: `momo://app?action=payWithAppInApp&isScanQR=false&payUrl=${encodeURIComponent('https://test-payment.momo.vn/v2/gateway/pay')}`,
        qrCodeUrl: `https://test-payment.momo.vn/v2/gateway/api/qr?t=${Buffer.from(JSON.stringify(requestBody)).toString('base64')}`,
        transId: Date.now()
      };

      return NextResponse.json(mockResponse);
    }

    // Make actual API call to MoMo in production
    const response = await fetch(MOMO_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`MoMo API error: ${response.status}`);
    }

    const momoResponse = await response.json();
    
    // Log the transaction for debugging
    console.log('MoMo payment created:', {
      orderId,
      requestId,
      amount,
      resultCode: momoResponse.resultCode
    });

    return NextResponse.json(momoResponse);

  } catch (error) {
    console.error('MoMo payment creation error:', error);
    
    return NextResponse.json(
      {
        resultCode: 1,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
