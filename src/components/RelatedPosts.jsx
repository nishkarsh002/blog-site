import Link from 'next/link';
import { getAllPosts } from '@/app/lib/posts';

export default async function RelatedPosts({ currentPost }) {
  const allPosts = await getAllPosts();
  
  // Get related posts by category, excluding current post
  const relatedPosts = allPosts
    .filter(post => 
      post.slug !== currentPost.slug && 
      post.category === currentPost.category
    )
    .slice(0, 3);

  // If not enough posts in same category, fill with other posts
  if (relatedPosts.length < 3) {
    const otherPosts = allPosts
      .filter(post => 
        post.slug !== currentPost.slug && 
        !relatedPosts.some(related => related.slug === post.slug)
      )
      .slice(0, 3 - relatedPosts.length);
    
    relatedPosts.push(...otherPosts);
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {post.image && (
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{formatDate(post.createdAt)}</span>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>{post.readTime} min read</span>
                    {post.views > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}