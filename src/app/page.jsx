import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <div>
      <h2 className="text-3xl font-semibold mb-4">Welcome to My Blog</h2>
      <p className="text-lg text-gray-600">
        This is the homepage. Click "Blog" to see all posts.
      </p>
    </div>
    </main>
    
  );
}
