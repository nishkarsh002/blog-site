import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit')) || 0;
    
    let query = { published: true };
    if (featured === 'true') {
      query.featured = true;
    }
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('POST /api/posts - Starting post creation');
    await dbConnect();
    console.log('Database connected successfully');
    
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.title || !body.slug || !body.excerpt || !body.content || !body.category) {
      console.error('Missing required fields:', {
        title: !!body.title,
        slug: !!body.slug,
        excerpt: !!body.excerpt,
        content: !!body.content,
        category: !!body.category
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if slug already exists
    const existingPost = await Post.findOne({ slug: body.slug });
    if (existingPost) {
      console.error('Slug already exists:', body.slug);
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      );
    }
    
    const post = await Post.create(body);
    console.log('Post created successfully:', post._id);
    
    // Revalidate pages to show new content
    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath(`/blog/${post.slug}`);
      console.log('Pages revalidated successfully');
    } catch (revalidateError) {
      console.error('Error revalidating pages:', revalidateError);
    }
    
    return NextResponse.json({ 
      success: true,
      post: {
        _id: post._id,
        title: post.title,
        slug: post.slug,
        createdAt: post.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      );
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create post', details: error.message },
      { status: 500 }
    );
  }
}