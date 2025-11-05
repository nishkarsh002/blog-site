import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import ViewLog from '@/app/models/ViewLog';
import Post from '@/app/models/Post';

export async function GET() {
  try {
    await dbConnect();
    
    // Get total view logs
    const totalViewLogs = await ViewLog.countDocuments();
    
    // Get view logs from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentViewLogs = await ViewLog.countDocuments({
      timestamp: { $gte: twentyFourHoursAgo }
    });
    
    // Get total post views
    const posts = await Post.find({ published: true }).select('views title slug');
    const totalPostViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    // Get top viewed posts
    const topPosts = posts
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(post => ({
        title: post.title,
        slug: post.slug,
        views: post.views || 0
      }));
    
    // Get view logs by post (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const viewsByPost = await ViewLog.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$postSlug',
          count: { $sum: 1 },
          uniqueIPs: { $addToSet: '$ipHash' }
        }
      },
      {
        $project: {
          postSlug: '$_id',
          viewCount: '$count',
          uniqueIPCount: { $size: '$uniqueIPs' }
        }
      },
      {
        $sort: { viewCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalViewLogs,
        recentViewLogs,
        totalPostViews,
        topPosts,
        viewsByPost: viewsByPost.map(item => ({
          postSlug: item.postSlug,
          viewCount: item.viewCount,
          uniqueIPCount: item.uniqueIPCount
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching view stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch view statistics', details: error.message },
      { status: 500 }
    );
  }
}