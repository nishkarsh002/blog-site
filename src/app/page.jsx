import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { getFeaturedPosts, getRecentPosts } from "@/app/lib/posts";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [featuredPosts, recentPosts] = await Promise.all([
    getFeaturedPosts(3),
    getRecentPosts(6)
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-yellow-300">TechBlog</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Your ultimate destination for cutting-edge web development tutorials, 
              programming insights, and technology trends that shape the future.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/blog" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explore Articles
              </Link>
              <Link 
                href="#newsletter" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold text-lg"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-green-300 rounded-full opacity-20 animate-ping"></div>
      </section>

      <main>
        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Articles Published</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-2">10K+</div>
                <div className="text-gray-600">Monthly Readers</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-purple-600 mb-2">25+</div>
                <div className="text-gray-600">Topics Covered</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-orange-600 mb-2">5+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Articles</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Handpicked content that showcases the latest trends and best practices in web development
              </p>
            </div>
            
            {featuredPosts.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Featured Posts Yet</h3>
                <p className="text-gray-500 mb-6">Get started by seeding the database with sample content</p>
                <Link 
                  href="/api/seed" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Seed Database
                </Link>
              </div>
            )}
            
            <div className="text-center">
              <Link 
                href="/blog" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block font-semibold"
              >
                View All Articles →
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Posts</h2>
                <p className="text-xl text-gray-600">Stay updated with our newest content</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.slice(0, 6).map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        <section id="newsletter" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest articles, tutorials, and tech insights delivered straight to your inbox. 
              Join our community of developers!
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
                <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors font-semibold">
                  Subscribe
                </button>
              </div>
              <p className="text-sm text-blue-200 mt-3">No spam, unsubscribe anytime</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">About TechBlog</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Welcome to TechBlog, where passion meets expertise in the world of web development. 
                  I'm a seasoned developer with over 5 years of experience building scalable applications 
                  and helping others master the art of coding.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  From React and Next.js to backend technologies and DevOps, I share practical insights, 
                  step-by-step tutorials, and real-world solutions that you can apply immediately in your projects.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">JavaScript</div>
                    <div className="text-sm text-gray-600">Expert Level</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">React</div>
                    <div className="text-sm text-gray-600">Advanced</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">Node.js</div>
                    <div className="text-sm text-gray-600">Professional</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">DevOps</div>
                    <div className="text-sm text-gray-600">Intermediate</div>
                  </div>
                </div>
                
                <Link 
                  href="/admin" 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block font-semibold"
                >
                  Write a Post
                </Link>
              </div>
              
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-80 h-80 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-6xl font-bold shadow-2xl">
                    TB
                  </div>
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-bounce">
                    ⚡
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">John Developer</h3>
                <p className="text-gray-600">Full Stack Developer & Tech Blogger</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
