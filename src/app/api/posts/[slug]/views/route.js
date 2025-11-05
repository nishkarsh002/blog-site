import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';
import ViewLog from '@/app/models/ViewLog';

// Helper function to get client IP
function getClientIP(request) {
  const headersList = headers();
  
  // Check various headers for the real IP
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const cfConnectingIP = headersList.get('cf-connecting-ip');
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default IP if none found (for development)
  return '127.0.0.1';
}

export async function POST(request, { params }) {
  try {
    console.log('POST /api/posts/[slug]/views - Starting IP-based view tracking (60s engagement requirement)');
    await dbConnect();
    console.log('Database connected');
    
    const { slug } = await params;
    const clientIP = getClientIP(request);
    const userAgent = headers().get('user-agent') || '';
    
    console.log('Tracking engaged view for slug:', slug, 'from IP hash:', ViewLog.hashIP(clientIP).substring(0, 8) + '...');
    
    // Check if this IP can view (hasn't viewed in last 24 hours)
    const canView = await ViewLog.canView(slug, clientIP);
    
    if (!canView) {
      console.log('IP has already viewed this post in the last 24 hours');
      
      // Still return current view count, but don't increment
      const post = await Post.findOne({ slug, published: true }).select('views');
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: false,
        message: 'View already counted for this IP in the last 24 hours',
        views: post.views || 0,
        alreadyViewed: true
      });
    }
    
    // Find the post first
    const post = await Post.findOne({ slug, published: true });
    
    if (!post) {
      console.log('Post not found for slug:', slug);
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Log the view in ViewLog collection
    await ViewLog.logView(slug, clientIP, userAgent);
    console.log('View logged in ViewLog collection');
    
    // Increment view count in Post
    const updatedPost = await Post.findOneAndUpdate(
      { slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    
    console.log('Engaged view tracked successfully (60s+ engagement). New view count:', updatedPost.views);
    return NextResponse.json({ 
      success: true, 
      views: updatedPost.views,
      message: 'View counted successfully'
    });
  } catch (error) {
    console.error('Error updating views:', error);
    return NextResponse.json(
      { error: 'Failed to update views', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { slug } = await params;
    
    const post = await Post.findOne({ slug, published: true })
      .select('views')
      .lean();
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      views: post.views || 0 
    });
  } catch (error) {
    console.error('Error fetching views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch views' },
      { status: 500 }
    );
  }
}