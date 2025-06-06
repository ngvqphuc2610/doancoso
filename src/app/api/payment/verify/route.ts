import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || 'MOMO_SECRET_KEY';

// Function to update booking status in database
async function updateBookingStatus(bookingCode: string, paymentStatus: string, transactionId?: string) {
  try {
    const { db } = await import('@/config/db');
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Update booking payment status
      const updateQuery = `
        UPDATE bookings
        SET payment_status = ?,
            booking_status = CASE
              WHEN ? = 'paid' THEN 'confirmed'
              WHEN ? = 'failed' THEN 'cancelled'
              ELSE booking_status
            END,
            transaction_id = COALESCE(?, transaction_id),
            updated_at = NOW()
        WHERE booking_code = ?
      `;

      await connection.execute(updateQuery, [
        paymentStatus,
        paymentStatus,
        paymentStatus,
        transactionId,
        bookingCode
      ]);

      // If payment successful, also update order_product status
      if (paymentStatus === 'paid') {
        await connection.execute(`
          UPDATE order_product op
          JOIN bookings b ON op.id_booking = b.id_booking
          SET op.order_status = 'confirmed'
          WHERE b.booking_code = ?
        `, [bookingCode]);
      }

      await connection.commit();
      connection.release();

      console.log(`✅ Updated booking ${bookingCode} status to ${paymentStatus}`);
      return { success: true };

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

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
        // Update booking status in database
        const updateResult = await updateBookingStatus(orderId, 'paid', transId);

        console.log('Payment verified successfully:', {
          orderId,
          transId,
          amount,
          updateResult
        });

        return NextResponse.json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            orderId,
            transId,
            amount,
            status: 'success',
            bookingUpdated: updateResult.success
          }
        });
      } else {
        // Update booking status to failed
        await updateBookingStatus(orderId, 'failed');

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
