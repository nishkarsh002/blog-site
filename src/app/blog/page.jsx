import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { getAllPosts } from "@/app/lib/posts";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getAllPosts();
  const categories = [...new Set(posts.map(post => post.category))];
  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              All <span className="text-blue-600">Articles</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dive deep into web development, programming tutorials, and cutting-edge technology insights. 
              From beginner guides to advanced techniques, find everything you need to level up your skills.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-blue-600">{posts.length}</div>
              <div className="text-gray-600">Total Articles</div>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-green-600">{categories.length}</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-purple-600">{featuredPosts.length}</div>
              <div className="text-gray-600">Featured</div>
            </div>
          </div>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
              <div className="flex flex-wrap gap-3">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  All ({posts.length})
                </span>
                {categories.map(category => {
                  const count = posts.filter(post => post.category === category).length;
                  return (
                    <span 
                      key={category}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      {category} ({count})
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* All Posts */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {featuredPosts.length > 0 ? 'More Articles' : 'All Articles'}
              </h2>
              <div className="text-gray-500">{posts.length} articles found</div>
            </div>

            {posts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(featuredPosts.length > 0 ? regularPosts : posts).map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
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
          {posts.length > 0 && (
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
      
      <Footer />
    </div>
  );
}
