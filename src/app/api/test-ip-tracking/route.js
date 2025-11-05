import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/app/lib/dbConnect';
import ViewLog from '@/app/models/ViewLog';

// Helper function to get client IP (same as in views route)
function getClientIP() {
  const headersList = headers();
  
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const cfConnectingIP = headersList.get('cf-connecting-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return '127.0.0.1';
}

export async function GET() {
  try {
    await dbConnect();
    
    const clientIP = getClientIP();
    const ipHash = ViewLog.hashIP(clientIP);
    const userAgent = headers().get('user-agent') || '';
    
    // Test if this IP can view a test post
    const canView = await ViewLog.canView('test-post', clientIP);
    
    // Get recent view logs for this IP (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentViews = await ViewLog.find({
      ipHash,
      timestamp: { $gte: twentyFourHoursAgo }
    }).select('postSlug timestamp').sort({ timestamp: -1 });
    
    return NextResponse.json({
      success: true,
      debug: {
        clientIP: clientIP.substring(0, 3) + '***', // Partially hide IP for privacy
        ipHash: ipHash.substring(0, 8) + '...', // Show first 8 chars of hash
        userAgent: userAgent.substring(0, 50) + '...', // Truncate user agent
        canViewTestPost: canView,
        recentViewsCount: recentViews.length,
        recentViews: recentViews.map(view => ({
          postSlug: view.postSlug,
          timestamp: view.timestamp,
          hoursAgo: Math.round((Date.now() - view.timestamp.getTime()) / (1000 * 60 * 60))
        }))
      }
    });
  } catch (error) {
    console.error('Error in IP tracking test:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}