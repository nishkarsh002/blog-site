'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState('');
  
  // Post creation states
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Admin',
    category: '',
    image: '',
    readTime: 5,
    featured: false,
    tags: ''
  });

  // Check for existing session on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('adminAuth');
      const authExpiry = localStorage.getItem('adminAuthExpiry');
      
      if (authToken && authExpiry) {
        const now = new Date().getTime();
        const expiryTime = parseInt(authExpiry);
        
        if (now < expiryTime) {
          setIsAuthenticated(true);
        } else {
          // Token expired, clear storage
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminAuthExpiry');
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Set authentication state
        setIsAuthenticated(true);
        setPassword('');
        
        // Store auth token in localStorage with configurable expiry
        const expiryDuration = rememberMe ? (7 * 24 * 60 * 60 * 1000) : (2 * 60 * 60 * 1000); // 7 days or 2 hours
        const expiryTime = new Date().getTime() + expiryDuration;
        localStorage.setItem('adminAuth', 'authenticated');
        localStorage.setItem('adminAuthExpiry', expiryTime.toString());
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch (error) {
      setLoginError('Authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };



  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleChange = (title) => {
    setPostForm(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage('❌ Please select an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      // Convert to base64 for simple storage (in production, use cloud storage)
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setPostForm(prev => ({ ...prev, image: base64String }));
        setMessage('✅ Image uploaded successfully!');
        setIsUploading(false);
      };
      reader.onerror = () => {
        setMessage('❌ Error uploading image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage('❌ Error uploading image');
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setPostForm(prev => ({ ...prev, image: '' }));
    setMessage('Image removed');
  };

  // HTML snippet insertion function
  const insertHtmlSnippet = (snippet) => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = postForm.content;
    
    const newContent = currentContent.substring(0, start) + snippet + currentContent.substring(end);
    
    setPostForm(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after insertion
    setTimeout(() => {
      const cursorPosition = start + snippet.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
      textarea.focus();
    }, 0);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!postForm.title.trim()) {
      setMessage('❌ Title is required');
      return;
    }
    if (!postForm.slug.trim()) {
      setMessage('❌ Slug is required');
      return;
    }
    if (!postForm.excerpt.trim()) {
      setMessage('❌ Excerpt is required');
      return;
    }
    if (!postForm.content.trim()) {
      setMessage('❌ Content is required');
      return;
    }
    if (!postForm.category.trim()) {
      setMessage('❌ Category is required');
      return;
    }

    setIsCreating(true);
    setMessage('');

    try {
      const postData = {
        ...postForm,
        title: postForm.title.trim(),
        slug: postForm.slug.trim(),
        excerpt: postForm.excerpt.trim(),
        content: postForm.content.trim(),
        author: postForm.author.trim() || 'Admin',
        category: postForm.category.trim(),
        readTime: Math.max(1, postForm.readTime),
        tags: postForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      console.log('Submitting post data:', postData);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setMessage('✅ Post created successfully! Updating cache...');
        
        // Trigger revalidation
        try {
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          console.log('Cache revalidated');
        } catch (revalidateError) {
          console.error('Revalidation failed:', revalidateError);
        }
        
        setPostForm({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          author: 'Admin',
          category: '',
          image: '',
          readTime: 5,
          featured: false,
          tags: ''
        });
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setMessage('✅ Post created successfully! You can now view it on the blog page.');
      } else {
        console.error('Error response:', data);
        setMessage(`❌ Error: ${data.error || 'Unknown error'}`);
        if (data.details) {
          console.error('Error details:', data.details);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage(`❌ Network Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Admin Login</h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me for {rememberMe ? '7 days' : '2 hours'}
              </label>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                isLoggingIn
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:underline">← Back to Homepage</a>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="max-w-6xl mx-auto py-12">
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="border-b border-gray-200 px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
                  <p className="text-gray-600 mt-2">Share your knowledge with the world</p>
                </div>
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    localStorage.removeItem('adminAuth');
                    localStorage.removeItem('adminAuthExpiry');
                  }}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {message && (
                <div className="mb-6 p-4 rounded-lg bg-gray-100">
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <div>
                <div className="mb-6 flex justify-between items-center">
                  <div className="space-y-2">
                    <a 
                      href="/blog" 
                      className="block text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      → View All Blog Posts
                    </a>
                    <a 
                      href="/" 
                      className="block text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      → Back to Homepage
                    </a>
                  </div>
                </div>
                  
                  <form onSubmit={handleCreatePost} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={postForm.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug *
                        </label>
                        <input
                          type="text"
                          value={postForm.slug}
                          onChange={(e) => setPostForm(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt *
                      </label>
                      <textarea
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content * (HTML supported)
                      </label>
                      
                      {/* HTML Snippet Buttons */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="text-sm font-medium text-gray-700 mb-3">Quick HTML Snippets:</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<h2>Heading</h2>\n')}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                          >
                            H2 Heading
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<h3>Subheading</h3>\n')}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                          >
                            H3 Heading
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<p>Your paragraph text here.</p>\n')}
                            className="px-3 py-2 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                          >
                            Paragraph
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<strong>bold text</strong>')}
                            className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors"
                          >
                            Bold
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<em>italic text</em>')}
                            className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors"
                          >
                            Italic
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<code>code snippet</code>')}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                          >
                            Inline Code
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n')}
                            className="px-3 py-2 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                          >
                            Bullet List
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n  <li>Step 3</li>\n</ol>\n')}
                            className="px-3 py-2 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                          >
                            Numbered List
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<a href="https://example.com" target="_blank">link text</a>')}
                            className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded text-xs hover:bg-indigo-200 transition-colors"
                          >
                            Link
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<pre><code>// Your code block here\nfunction example() {\n  return "Hello World";\n}</code></pre>\n')}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                          >
                            Code Block
                          </button>
                          <button
                            type="button"
                            onClick={() => insertHtmlSnippet('<blockquote>\n  <p>Your quote here...</p>\n</blockquote>\n')}
                            className="px-3 py-2 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 transition-colors"
                          >
                            Quote Block
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2 text-xs text-gray-500">
                        Click the buttons above to insert HTML snippets, or type HTML directly
                      </div>
                      <textarea
                        id="content-textarea"
                        value={postForm.content}
                        onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={15}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="<p>Start writing your blog post content here...</p>

<h2>Section Title</h2>
<p>Your content goes here.</p>

<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Author
                        </label>
                        <input
                          type="text"
                          value={postForm.author}
                          onChange={(e) => setPostForm(prev => ({ ...prev, author: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={postForm.category}
                          onChange={(e) => setPostForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a category</option>
                          <option value="Tutorial">Tutorial</option>
                          <option value="JavaScript">JavaScript</option>
                          <option value="React">React</option>
                          <option value="Next.js">Next.js</option>
                          <option value="CSS">CSS</option>
                          <option value="Backend">Backend</option>
                          <option value="Database">Database</option>
                          <option value="DevOps">DevOps</option>
                          <option value="Web Development">Web Development</option>
                          <option value="Programming">Programming</option>
                          <option value="Technology">Technology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Read Time (minutes)
                        </label>
                        <input
                          type="number"
                          value={postForm.readTime}
                          onChange={(e) => setPostForm(prev => ({ ...prev, readTime: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image
                      </label>
                      
                      {/* Image Preview */}
                      {postForm.image && (
                        <div className="mb-4">
                          <img 
                            src={postForm.image} 
                            alt="Preview" 
                            className="w-full max-w-md h-48 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                      
                      {/* Upload Options */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Upload Image File:</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {isUploading && (
                            <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                          )}
                        </div>
                        
                        <div className="text-center text-gray-500">or</div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Image URL:</label>
                          <input
                            type="url"
                            value={postForm.image.startsWith('data:') ? '' : postForm.image}
                            onChange={(e) => setPostForm(prev => ({ ...prev, image: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                            disabled={postForm.image.startsWith('data:')}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={postForm.tags}
                        onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="JavaScript, React, Tutorial"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={postForm.featured}
                        onChange={(e) => setPostForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                        Featured Post
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isCreating}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          isCreating
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {isCreating ? 'Creating Post...' : 'Create Post'}
                      </button>
                    </div>
                  </form>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}