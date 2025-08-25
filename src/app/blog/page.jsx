const dummyPosts = [
  {
    title: 'First Post',
    slug: 'first-post',
    excerpt: 'This is the first post of the blog...',
  },
  {
    title: 'Second Post',
    slug: 'second-post',
    excerpt: 'Another day, another blog post...',
  },
];

export default function BlogPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">All Blog Posts</h2>
      <div className="space-y-4">
        {dummyPosts.map((post) => (
          <div key={post.slug} className="bg-white p-4 rounded shadow hover:shadow-md transition">
            <a href={`/blog/${post.slug}`} className="text-xl font-semibold hover:underline">
              {post.title}
            </a>
            <p className="text-gray-600 mt-2">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
