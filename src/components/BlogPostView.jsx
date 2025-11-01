'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";

export default function BlogPostView({ post }) {
  const [views, setViews] = useState(Number(post.views) || 0);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    // Track view when component mounts (only once per session)
    const trackView = async () => {
      if (hasTracked) return;
      
      try {
        console.log('Tracking view for post:', post.slug);
        const response = await fetch(`/api/posts/${post.slug}/views`, {
          method: 'POST',
        });
        
        console.log('View tracking response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('View tracking response data:', data);
          setViews(Number(data.views) || 0);
          setHasTracked(true);
        } else {
          const errorData = await response.json();
          console.error('View tracking failed:', errorData);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Delay tracking to avoid counting quick bounces
    const timer = setTimeout(trackView, 2000);
    
    return () => clearTimeout(timer);
  }, [post.slug, hasTracked]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="max-w-4xl mx-auto py-12">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/blog" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Blog
        </Link>
        
        <div className="mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-4 text-gray-600 mb-8">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>•</span>
          <span>{post.readTime} min read</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {(views || 0).toLocaleString()} views
          </span>
        </div>
      </div>

      {/* Featured Image */}
      {post.image && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Link 
            href="/blog" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← More Articles
          </Link>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.943 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {(views || 0).toLocaleString()} views
            </span>
            <span>Published on {formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}