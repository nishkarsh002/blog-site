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

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { slug } = await params;
    const clientIP = getClientIP();
    
    // Check if this IP can view (hasn't viewed in last 24 hours)
    const canView = await ViewLog.canView(slug, clientIP);
    
    return NextResponse.json({ 
      canView,
      message: canView ? 'IP can view this post' : 'IP has already viewed this post in the last 24 hours'
    });
  } catch (error) {
    console.error('Error checking view eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check view eligibility', details: error.message },
      { status: 500 }
    );
  }
}