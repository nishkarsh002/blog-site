'use client';

import { useState } from 'react';
import BlogCard from './BlogCard';
import Link from 'next/link';

export default function BlogContent({ posts }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [...new Set(posts.map(post => post.category))];
  const featuredPosts = posts.filter(post => post.featured);
  
  // Filter posts based on selected category
  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);
  
  const filteredFeaturedPosts = selectedCategory === 'all' 
    ? featuredPosts 
    : featuredPosts.filter(post => post.category === selectedCategory);
  
  const filteredRegularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <main className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({posts.length})
              </button>
              {categories.map(category => {
                const count = posts.filter(post => post.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Results Info */}
        {selectedCategory !== 'all' && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} in "{selectedCategory}"
                </h3>
                <p className="text-blue-700">
                  {filteredFeaturedPosts.length} featured • {filteredRegularPosts.length} regular articles
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filter ×
              </button>
            </div>
          </div>
        )}

        {/* Featured Posts */}
        {filteredFeaturedPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'Featured Articles' : `Featured ${selectedCategory} Articles`}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFeaturedPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {filteredFeaturedPosts.length > 0 
                ? (selectedCategory === 'all' ? 'More Articles' : `More ${selectedCategory} Articles`)
                : (selectedCategory === 'all' ? 'All Articles' : `${selectedCategory} Articles`)
              }
            </h2>
            <div className="text-gray-500">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(filteredFeaturedPosts.length > 0 ? filteredRegularPosts : filteredPosts).map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : selectedCategory !== 'all' ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No "{selectedCategory}" Articles Found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                There are no articles in this category yet. Try browsing other categories or check back later.
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View All Articles
              </button>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <div className="text-8xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No Articles Yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Looks like we're just getting started! Seed the database with some sample content 
                or create your first post.
              </p>
              <div className="space-x-4">
                <Link 
                  href="/api/seed" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block font-semibold"
                >
                  Seed Database
                </Link>
                <Link 
                  href="/admin" 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block font-semibold"
                >
                  Write First Post
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Call to Action */}
        {filteredPosts.length > 0 && (
          <section className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-2xl">
            <h2 className="text-3xl font-bold mb-4">Want to Contribute?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Have insights to share? Join our community of writers and help others learn.
            </p>
            <Link 
              href="/admin" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors inline-block font-semibold text-lg"
            >
              Start Writing
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}