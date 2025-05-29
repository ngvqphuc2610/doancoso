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
      signature,
      paymentMethod = 'momo'
    } = body;

    if (paymentMethod === 'momo') {
      // Verify MoMo signature
      const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      
      const expectedSignature = crypto
        .createHmac('sha256', MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid MoMo signature');
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 400 }
        );
      }

      // Check if payment was successful
      if (resultCode === 0) {
        // TODO: Update booking status in database
        console.log('Payment verified successfully:', {
          orderId,
          transId,
          amount
        });

        return NextResponse.json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            orderId,
            transId,
            amount,
            status: 'success'
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Payment failed',
          data: {
            orderId,
            resultCode,
            message
          }
        });
      }
    }

    // Handle other payment methods
    return NextResponse.json(
      { success: false, message: 'Unsupported payment method' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
