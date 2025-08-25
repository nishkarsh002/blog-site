export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Blog Post: {slug}</h1>
      <p className="text-gray-600">This is a placeholder for the blog post content.</p>
    </div>
  );
}
