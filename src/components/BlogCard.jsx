import Link from 'next/link';

export default function BlogCard({ post }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {post.image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span>{formatDate(post.createdAt || new Date())}</span>
          {post.category && (
            <>
              <span>•</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {post.category}
              </span>
            </>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <Link 
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            Read more →
          </Link>
          
          {post.readTime && (
            <span className="text-sm text-gray-500">
              {post.readTime} min read
            </span>
          )}
        </div>
      </div>
    </article>
  );
}