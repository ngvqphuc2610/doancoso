import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received booking data:', JSON.stringify(body, null, 2));

    // Test database connection first
    try {
      const testResult = await query('SELECT 1 as test');
      console.log('Database connection test:', testResult);
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError
      }, { status: 500 });
    }

    // Validate required fields
    const {
      customer_name,
      customer_email,
      customer_phone,
      id_showtime,
      selected_seats,
      total_amount
    } = body;

    console.log('Validating fields:', {
      customer_name: !!customer_name,
      customer_email: !!customer_email,
      customer_phone: !!customer_phone,
      id_showtime: !!id_showtime,
      selected_seats: !!selected_seats && Array.isArray(selected_seats) && selected_seats.length > 0,
      total_amount: !!total_amount
    });

    if (!customer_name || !customer_email || !customer_phone || !id_showtime || !selected_seats || selected_seats.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required booking information',
        received: {
          customer_name: !!customer_name,
          customer_email: !!customer_email,
          customer_phone: !!customer_phone,
          id_showtime: !!id_showtime,
          selected_seats: !!selected_seats && Array.isArray(selected_seats) && selected_seats.length > 0,
          total_amount: !!total_amount
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test booking validation passed',
      data: body
    });

  } catch (error) {
    console.error('Test booking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test booking failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
