
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Post from '@/app/models/Post';

const samplePosts = [
  {
    title: 'Getting Started with Next.js 15',
    slug: 'getting-started-nextjs',
    excerpt: 'Learn how to build modern web applications with Next.js 15. This comprehensive guide covers everything from setup to deployment.',
    content: `
      <p>Next.js 15 brings exciting new features and improvements that make building React applications even more enjoyable. In this comprehensive guide, we'll explore the key features and learn how to build a modern web application from scratch.</p>
      
      <h2>What's New in Next.js 15</h2>
      <p>Next.js 15 introduces several groundbreaking features:</p>
      <ul>
        <li><strong>Improved App Router:</strong> Enhanced routing capabilities with better performance</li>
        <li><strong>Server Components:</strong> Better server-side rendering and reduced bundle sizes</li>
        <li><strong>Enhanced Image Optimization:</strong> Faster loading times and better user experience</li>
        <li><strong>Improved TypeScript Support:</strong> Better type checking and developer experience</li>
      </ul>
      
      <h2>Setting Up Your First Next.js Project</h2>
      <p>Getting started with Next.js is incredibly simple. Here's how you can create your first project:</p>
      <pre><code>npx create-next-app@latest my-app
cd my-app
npm run dev</code></pre>
      
      <p>This will create a new Next.js application with all the necessary dependencies and a basic project structure.</p>
      
      <h2>Project Structure</h2>
      <p>Understanding the project structure is crucial for building scalable applications. Here's what each folder contains:</p>
      <ul>
        <li><code>app/</code> - Contains your application routes and layouts</li>
        <li><code>components/</code> - Reusable React components</li>
        <li><code>public/</code> - Static assets like images and icons</li>
        <li><code>styles/</code> - CSS and styling files</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Next.js 15 is a powerful framework that simplifies React development while providing excellent performance and developer experience. Start building your next project with Next.js today!</p>
    `,
    author: 'John Doe',
    category: 'Tutorial',
    readTime: 8,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop',
    featured: true,
    tags: ['Next.js', 'React', 'JavaScript', 'Web Development']
  },
  {
    title: 'Modern CSS Grid and Flexbox Techniques',
    slug: 'modern-css',
    excerpt: 'Discover advanced CSS layout techniques that will transform your web designs. Master Grid and Flexbox for responsive layouts.',
    content: `
      <p>CSS has evolved tremendously over the years, and modern layout techniques like Grid and Flexbox have revolutionized how we approach web design. Let's explore these powerful tools.</p>
      
      <h2>CSS Grid: The Ultimate Layout Tool</h2>
      <p>CSS Grid provides a two-dimensional layout system that allows you to create complex layouts with ease:</p>
      <pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}</code></pre>
      
      <h2>Flexbox: Perfect for One-Dimensional Layouts</h2>
      <p>Flexbox excels at distributing space and aligning items in a single dimension:</p>
      <pre><code>.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}</code></pre>
      
      <p>These modern CSS techniques will transform your web development workflow and help you create stunning, responsive designs.</p>
    `,
    author: 'Jane Smith',
    category: 'CSS',
    readTime: 6,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop',
    featured: true,
    tags: ['CSS', 'Grid', 'Flexbox', 'Layout']
  },
  {
    title: 'JavaScript Best Practices for 2024',
    slug: 'js-best-practices',
    excerpt: 'Write cleaner, more maintainable JavaScript code with these essential best practices and modern ES6+ features.',
    content: `
      <p>Writing clean, maintainable JavaScript is essential for building robust applications. Here are the best practices every developer should follow in 2024.</p>
      
      <h2>Use Modern ES6+ Features</h2>
      <p>Embrace modern JavaScript features like arrow functions, destructuring, and template literals:</p>
      <pre><code>// Destructuring
const { name, age } = user;

// Arrow functions
const multiply = (a, b) => a * b;

// Template literals
const message = \`Hello, \${name}!\`;</code></pre>
      
      <h2>Error Handling</h2>
      <p>Always handle errors gracefully using try-catch blocks and proper error messages.</p>
      
      <p>Following these practices will make your code more readable, maintainable, and less prone to bugs.</p>
    `,
    author: 'Mike Johnson',
    category: 'JavaScript',
    readTime: 10,
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1200&h=600&fit=crop',
    featured: true,
    tags: ['JavaScript', 'ES6', 'Best Practices', 'Clean Code']
  },
  {
    title: 'Building RESTful APIs with Node.js',
    slug: 'nodejs-api',
    excerpt: 'Create robust and scalable REST APIs using Node.js and Express. Learn about middleware, authentication, and best practices.',
    content: `
      <p>Building RESTful APIs is a fundamental skill for backend developers. In this guide, we'll explore how to create robust APIs using Node.js and Express.</p>
      
      <h2>Setting Up Express</h2>
      <p>Start by setting up a basic Express server:</p>
      <pre><code>const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});</code></pre>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Use proper HTTP status codes</li>
        <li>Implement error handling middleware</li>
        <li>Validate input data</li>
        <li>Use environment variables for configuration</li>
      </ul>
    `,
    author: 'Sarah Wilson',
    category: 'Backend',
    readTime: 12,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop',
    tags: ['Node.js', 'Express', 'API', 'Backend']
  },
  {
    title: 'React Hooks Deep Dive',
    slug: 'react-hooks',
    excerpt: 'Master React Hooks with practical examples. Learn useState, useEffect, useContext, and create custom hooks.',
    content: `
      <p>React Hooks have revolutionized how we write React components. Let's dive deep into the most important hooks and learn how to use them effectively.</p>
      
      <h2>useState Hook</h2>
      <p>The useState hook allows you to add state to functional components:</p>
      <pre><code>const [count, setCount] = useState(0);

const increment = () => {
  setCount(count + 1);
};</code></pre>
      
      <h2>useEffect Hook</h2>
      <p>Handle side effects in your components:</p>
      <pre><code>useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);</code></pre>
      
      <h2>Custom Hooks</h2>
      <p>Create reusable logic by building custom hooks that encapsulate common patterns.</p>
    `,
    author: 'Alex Chen',
    category: 'React',
    readTime: 9,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
    tags: ['React', 'Hooks', 'useState', 'useEffect']
  },
  {
    title: 'Database Design Fundamentals',
    slug: 'database-design',
    excerpt: 'Learn the principles of good database design, normalization, and how to structure your data for optimal performance.',
    content: `
      <p>Good database design is crucial for building scalable applications. Let's explore the fundamental principles that will help you create efficient database schemas.</p>
      
      <h2>Normalization</h2>
      <p>Database normalization helps eliminate data redundancy and improve data integrity:</p>
      <ul>
        <li><strong>First Normal Form (1NF):</strong> Eliminate repeating groups</li>
        <li><strong>Second Normal Form (2NF):</strong> Remove partial dependencies</li>
        <li><strong>Third Normal Form (3NF):</strong> Remove transitive dependencies</li>
      </ul>
      
      <h2>Indexing Strategies</h2>
      <p>Proper indexing can dramatically improve query performance:</p>
      <pre><code>CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_post_created_at ON posts(created_at DESC);</code></pre>
      
      <h2>Relationships</h2>
      <p>Understanding different types of relationships is key to good database design:</p>
      <ul>
        <li>One-to-One</li>
        <li>One-to-Many</li>
        <li>Many-to-Many</li>
      </ul>
    `,
    author: 'David Kumar',
    category: 'Database',
    readTime: 15,
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=600&fit=crop',
    tags: ['Database', 'SQL', 'Design', 'Normalization']
  }
];

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    await dbConnect();

    // Clear existing posts
    await Post.deleteMany({});

    // Insert sample posts
    const posts = await Post.insertMany(samplePosts);

    return NextResponse.json({
      message: 'Database seeded successfully',
      count: posts.length
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}