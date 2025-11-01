import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';

export async function GET() {
  try {
    console.log('Testing views system...');
    await dbConnect();
    console.log('Database connected');
    
    // Get a sample post
    const samplePost = await Post.findOne({ published: true }).lean();
    
    if (!samplePost) {
      return NextResponse.json({
        success: false,
        error: 'No published posts found'
      });
    }
    
    console.log('Sample post found:', samplePost.title, 'Views:', samplePost.views);
    
    // Test incrementing views
    const updatedPost = await Post.findOneAndUpdate(
      { _id: samplePost._id },
      { $inc: { views: 1 } },
      { new: true }
    );
    
    console.log('After increment - Views:', updatedPost.views);
    
    return NextResponse.json({
      success: true,
      message: 'Views system test completed',
      testPost: {
        title: samplePost.title,
        slug: samplePost.slug,
        viewsBefore: samplePost.views,
        viewsAfter: updatedPost.views
      }
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}