import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';

export async function GET() {
  try {
    console.log('Debug endpoint called');
    await dbConnect();
    console.log('Database connected');
    
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ published: true });
    const featuredPosts = await Post.countDocuments({ featured: true });
    
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug createdAt published featured')
      .lean();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        featuredPosts
      },
      recentPosts: recentPosts.map(post => ({
        ...post,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}