import dbConnect from './dbConnect';
import Post from '../models/Post';

export async function getFeaturedPosts(limit = 3) {
  try {
    await dbConnect();
    
    const posts = await Post.find({ published: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Convert MongoDB ObjectId to string
    return posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

export async function getAllPosts() {
  try {
    await dbConnect();
    
    const posts = await Post.find({ published: true })
      .sort({ createdAt: -1 })
      .lean();
    
    // Convert MongoDB ObjectId to string
    return posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getRecentPosts(limit = 6) {
  try {
    await dbConnect();
    
    const posts = await Post.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Convert MongoDB ObjectId to string
    return posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    await dbConnect();
    
    const post = await Post.findOne({ slug, published: true }).lean();
    
    if (!post) {
      return null;
    }
    
    // Convert MongoDB ObjectId to string
    return {
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}