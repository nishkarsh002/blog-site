import Navbar from "@/components/Navbar";
import Link from "next/link";
import BlogPostView from "@/components/BlogPostView";
import RelatedPosts from "@/components/RelatedPosts";
import { getPostBySlug } from "@/app/lib/posts";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto py-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
            <Link 
              href="/blog" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4">
        <BlogPostView post={post} />
        <div className="max-w-4xl mx-auto">
          <RelatedPosts currentPost={post} />
        </div>
      </div>
    </main>
  );
}
