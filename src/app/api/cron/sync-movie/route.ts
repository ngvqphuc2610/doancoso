import { NextResponse } from 'next/server';
import { syncMoviesFromTMDB } from '@/services/movieSyncService';

// This endpoint will be called by Vercel Cron or a similar service
export async function GET() {
  try {
    // Check for a secret key to ensure the route is only called by authorized services
    // const authHeader = headers().get('Authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    //   return NextResponse.json({ success: false }, { status: 401 });
    // }
    
    const result = await syncMoviesFromTMDB();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// For Vercel Cron, add this export
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes - adjust based on needs