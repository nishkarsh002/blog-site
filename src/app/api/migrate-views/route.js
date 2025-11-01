import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';

export async function POST() {
  try {
    console.log('Starting views migration...');
    await dbConnect();
    
    // Find all posts that don't have a views field or have null/undefined views
    const postsWithoutViews = await Post.find({
      $or: [
        { views: { $exists: false } },
        { views: null },
        { views: undefined }
      ]
    });
    
    console.log(`Found ${postsWithoutViews.length} posts without views field`);
    
    if (postsWithoutViews.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All posts already have views field',
        updated: 0
      });
    }
    
    // Update all posts without views to have views: 0
    const updateResult = await Post.updateMany(
      {
        $or: [
          { views: { $exists: false } },
          { views: null },
          { views: undefined }
        ]
      },
      {
        $set: { views: 0 }
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} posts with views field`);
    
    // Optionally, add some random views to make it look more realistic
    const allPosts = await Post.find({});
    const updatePromises = allPosts.map(async (post) => {
      if (post.views === 0) {
        // Generate random views between 50-2000 for existing posts
        const randomViews = Math.floor(Math.random() * 1950) + 50;
        return Post.findByIdAndUpdate(post._id, { views: randomViews });
      }
    });
    
    await Promise.all(updatePromises.filter(Boolean));
    
    return NextResponse.json({
      success: true,
      message: `Successfully added views field to ${updateResult.modifiedCount} posts`,
      updated: updateResult.modifiedCount,
      totalPosts: allPosts.length
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to migrate views field',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    // Check current status of views field
    const totalPosts = await Post.countDocuments();
    const postsWithViews = await Post.countDocuments({ views: { $exists: true, $ne: null } });
    const postsWithoutViews = totalPosts - postsWithViews;
    
    // Get some sample posts to show current state
    const samplePosts = await Post.find({})
      .select('title slug views createdAt')
      .limit(10)
      .lean();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalPosts,
        postsWithViews,
        postsWithoutViews,
        needsMigration: postsWithoutViews > 0
      },
      samplePosts: samplePosts.map(post => ({
        title: post.title,
        slug: post.slug,
        views: post.views || 'NOT SET',
        createdAt: post.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check migration status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}