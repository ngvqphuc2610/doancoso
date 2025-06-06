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

      // Update booking status in database
      try {
        const { db } = await import('@/config/db');
        const connection = await db.getConnection();

        try {
          await connection.beginTransaction();

          // Update booking payment status
          const updateQuery = `
            UPDATE bookings
            SET payment_status = 'paid',
                booking_status = 'confirmed',
                transaction_id = ?,
                updated_at = NOW()
            WHERE booking_code = ?
          `;

          await connection.execute(updateQuery, [transId, orderId]);

          // Update order_product status
          await connection.execute(`
            UPDATE order_product op
            JOIN bookings b ON op.id_booking = b.id_booking
            SET op.order_status = 'confirmed'
            WHERE b.booking_code = ?
          `, [orderId]);

          await connection.commit();
          connection.release();

          console.log(`✅ Updated booking ${orderId} status to paid via IPN`);

        } catch (error) {
          await connection.rollback();
          connection.release();
          console.error('Error updating booking via IPN:', error);
        }

      } catch (error) {
        console.error('Database connection error in IPN:', error);
      }

      // TODO: Send confirmation email/SMS to customer
      // await sendPaymentConfirmation(orderId);

    } else {
      // Payment failed
      console.log('MoMo payment failed:', {
        orderId,
        resultCode,
        message
      });

      // Update booking status to failed
      try {
        const { db } = await import('@/config/db');
        const connection = await db.getConnection();

        await connection.execute(`
          UPDATE bookings
          SET payment_status = 'failed',
              booking_status = 'cancelled',
              updated_at = NOW()
          WHERE booking_code = ?
        `, [orderId]);

        connection.release();
        console.log(`✅ Updated booking ${orderId} status to failed via IPN`);

      } catch (error) {
        console.error('Error updating failed booking via IPN:', error);
      }
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
