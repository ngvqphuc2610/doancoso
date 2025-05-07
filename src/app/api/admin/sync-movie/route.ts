import { NextResponse } from 'next/server';
import { syncMoviesFromTMDB } from '@/services/movieSyncService';

// POST /api/admin/sync-movies
export async function POST() {
  try {
    const result = await syncMoviesFromTMDB();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in movie sync endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error while syncing movies' 
    }, { status: 500 });
  }
}