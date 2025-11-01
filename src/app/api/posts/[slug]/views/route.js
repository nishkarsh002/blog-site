import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';

export async function POST(request, { params }) {
  try {
    console.log('POST /api/posts/[slug]/views - Starting engagement-based view tracking (100s requirement)');
    await dbConnect();
    console.log('Database connected');
    
    const { slug } = await params;
    console.log('Tracking engaged view for slug:', slug);
    
    // Increment view count
    const post = await Post.findOneAndUpdate(
      { slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!post) {
      console.log('Post not found for slug:', slug);
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    console.log('Engaged view tracked successfully (100s+ engagement). New view count:', post.views);
    return NextResponse.json({ 
      success: true, 
      views: post.views 
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