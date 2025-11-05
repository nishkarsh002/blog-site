import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    await dbConnect();
    
    // Create search regex for title, excerpt, content, and tags
    const searchRegex = new RegExp(query, 'i');
    
    const results = await Post.find({
      published: true,
      $or: [
        { title: { $regex: searchRegex } },
        { excerpt: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
        { author: { $regex: searchRegex } }
      ]
    })
    .select('title slug excerpt category readTime views image createdAt')
    .sort({ views: -1, createdAt: -1 }) // Sort by popularity then recency
    .limit(10)
    .lean();

    // Convert MongoDB ObjectId to string and ensure views is a number
    const formattedResults = results.map(post => ({
      ...post,
      _id: post._id.toString(),
      views: Number(post.views) || 0,
      createdAt: post.createdAt.toISOString()
    }));

    return NextResponse.json({ 
      results: formattedResults,
      query,
      total: formattedResults.length
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}