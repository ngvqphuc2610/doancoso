import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || 'MOMO_SECRET_KEY';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = body;

    // Verify signature
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid MoMo signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Process payment result
    if (resultCode === 0) {
      // Payment successful
      console.log('MoMo payment successful:', {
        orderId,
        transId,
        amount
      });

      // TODO: Update booking status in database
      // await updateBookingStatus(orderId, 'paid', transId);
      
      // TODO: Send confirmation email/SMS to customer
      // await sendPaymentConfirmation(orderId);

    } else {
      // Payment failed
      console.log('MoMo payment failed:', {
        orderId,
        resultCode,
        message
      });

      // TODO: Update booking status in database
      // await updateBookingStatus(orderId, 'failed', null);
    }

    // Always return success to MoMo to acknowledge receipt
    return NextResponse.json({
      partnerCode,
      orderId,
      requestId,
      resultCode: 0,
      message: 'success',
      responseTime: Date.now()
    });

  } catch (error) {
    console.error('MoMo IPN processing error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
