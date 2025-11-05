import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { slug } = await params;
    const post = await Post.findOne({ slug, published: true }).lean();
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    console.log('DELETE /api/posts/[slug] - Starting post deletion');
    await dbConnect();
    
    const { slug } = await params;
    console.log('Deleting post with slug:', slug);
    
    // Find and delete the post
    const deletedPost = await Post.findOneAndDelete({ slug });
    
    if (!deletedPost) {
      console.log('Post not found for deletion:', slug);
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    console.log('Post deleted successfully:', deletedPost.title);
    
    // Revalidate pages to remove deleted content
    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath(`/blog/${slug}`);
      console.log('Pages revalidated after deletion');
    } catch (revalidateError) {
      console.error('Error revalidating pages:', revalidateError);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Post deleted successfully',
      deletedPost: {
        title: deletedPost.title,
        slug: deletedPost.slug
      }
    });
    
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    console.log('PUT /api/posts/[slug] - Starting post update');
    await dbConnect();
    
    const { slug } = await params;
    const updateData = await request.json();
    
    console.log('Updating post with slug:', slug);
    
    // Update the post
    const updatedPost = await Post.findOneAndUpdate(
      { slug },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    console.log('Post updated successfully:', updatedPost.title);
    
    // Revalidate pages
    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath(`/blog/${updatedPost.slug}`);
      console.log('Pages revalidated after update');
    } catch (revalidateError) {
      console.error('Error revalidating pages:', revalidateError);
    }
    
    return NextResponse.json({ 
      success: true,
      post: updatedPost
    });
    
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post', details: error.message },
      { status: 500 }
    );
  }
}