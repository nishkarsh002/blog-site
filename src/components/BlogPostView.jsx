'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import SocialShare from './SocialShare';
import TableOfContents from './TableOfContents';

export default function BlogPostView({ post }) {
  const [views, setViews] = useState(Number(post.views) || 0);
  const [hasTracked, setHasTracked] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showEngagementIndicator, setShowEngagementIndicator] = useState(false);
  const [indicatorDismissed, setIndicatorDismissed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canViewFromIP, setCanViewFromIP] = useState(null); // null = checking, true = can view, false = already viewed
  const [showAlreadyViewedIndicator, setShowAlreadyViewedIndicator] = useState(false);

  useEffect(() => {
    // Check if this IP can view the post first
    const checkViewEligibility = async () => {
      try {
        console.log('Checking if IP can view post:', post.slug);
        const response = await fetch(`/api/posts/${post.slug}/can-view`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('View eligibility check:', data);
          setCanViewFromIP(data.canView);
          
          if (!data.canView) {
            console.log('IP has already viewed this post in the last 24 hours - no engagement indicator will be shown');
            // Show the "already viewed" indicator for 5 seconds
            setShowAlreadyViewedIndicator(true);
            setTimeout(() => {
              setShowAlreadyViewedIndicator(false);
            }, 5000);
          }
        } else {
          console.error('Failed to check view eligibility');
          // Default to showing indicator if check fails
          setCanViewFromIP(true);
        }
      } catch (error) {
        console.error('Error checking view eligibility:', error);
        // Default to showing indicator if check fails
        setCanViewFromIP(true);
      }
    };

    // Track view when component mounts (only once per session)
    const trackView = async () => {
      if (hasTracked) return;
      
      try {
        console.log('Tracking view for post after 60 seconds:', post.slug);
        const response = await fetch(`/api/posts/${post.slug}/views`, {
          method: 'POST',
        });
        
        console.log('View tracking response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('View tracking response data:', data);
          setViews(Number(data.views) || 0);
          setHasTracked(true);
          setShowEngagementIndicator(false);
          
          // Show user feedback based on whether view was counted
          if (data.alreadyViewed) {
            console.log('View not counted - already viewed from this IP in last 24 hours');
          } else if (data.success) {
            console.log('View successfully counted!');
          }
        } else {
          const errorData = await response.json();
          console.error('View tracking failed:', errorData);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Check eligibility first
    checkViewEligibility();

    // Show engagement indicator after 30 seconds (only if IP can view)
    const indicatorTimer = setTimeout(() => {
      if (!hasTracked && !indicatorDismissed && canViewFromIP === true) {
        setShowEngagementIndicator(true);
      }
    }, 30000);

    // Track view after 60 seconds of engagement (only if IP can view)
    const trackingTimer = setTimeout(() => {
      if (canViewFromIP === true) {
        trackView();
      }
    }, 60000);
    
    // Update time spent counter every second (only if IP can view)
    const timeCounter = setInterval(() => {
      if (canViewFromIP === true) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);
    
    return () => {
      clearTimeout(indicatorTimer);
      clearTimeout(trackingTimer);
      clearInterval(timeCounter);
    };
  }, [post.slug, hasTracked, canViewFromIP]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((window.scrollY / totalHeight) * 100, 100);
        setScrollProgress(progress);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="max-w-4xl mx-auto py-12">
      {/* Already Viewed Indicator - Subtle notification for users who already viewed */}
      {canViewFromIP === false && showAlreadyViewedIndicator && (
        <div className="fixed bottom-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm opacity-90">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>You've already viewed this post today</span>
            </div>
            <button
              onClick={() => setShowAlreadyViewedIndicator(false)}
              className="flex-shrink-0 ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Engagement Indicator - Only show if IP can view */}
      {showEngagementIndicator && !hasTracked && !indicatorDismissed && canViewFromIP === true && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Keep reading to count as a view! ({Math.max(0, 60 - timeSpent)}s)</span>
            </div>
            <button
              onClick={() => {
                setIndicatorDismissed(true);
                setShowEngagementIndicator(false);
              }}
              className="flex-shrink-0 ml-2 p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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

      {/* Table of Contents */}
      <TableOfContents content={post.content} />

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Social Share */}
      <div className="mt-8">
        <SocialShare post={post} />
      </div>

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
    </>
  );
}