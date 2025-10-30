import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogContent from "@/components/BlogContent";
import { getAllPosts } from "@/app/lib/posts";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getAllPosts();
  const categories = [...new Set(posts.map(post => post.category))];
  const featuredPosts = posts.filter(post => post.featured);

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

      {/* Blog Content with Filtering */}
      <BlogContent posts={posts} />
      
      <Footer />
    </div>
  );
}
